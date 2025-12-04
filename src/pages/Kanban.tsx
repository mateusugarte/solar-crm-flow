import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { LeadDrawer } from '@/components/kanban/LeadDrawer';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface Lead {
  id: string;
  numero: string;
  nome_whatsapp: string | null;
  nome_completo: string | null;
  qualificacao: string | null;
  renda: string | null;
  resumo: string | null;
  ultima_mensagem: string | null;
  criado_em: string | null;
  cpf: string | null;
  pausar_ia: string | null;
}

export default function Kanban() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('criado_em', { ascending: false });
    
    if (!error && data) {
      setLeads(data);
    }
    setLoading(false);
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    const { error } = await supabase
      .from('usuarios')
      .update({
        nome_completo: updatedLead.nome_completo,
        nome_whatsapp: updatedLead.nome_whatsapp,
        qualificacao: updatedLead.qualificacao,
        renda: updatedLead.renda,
        resumo: updatedLead.resumo,
        cpf: updatedLead.cpf,
        pausar_ia: updatedLead.pausar_ia,
      })
      .eq('id', updatedLead.id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar lead', variant: 'destructive' });
    } else {
      setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
      setSelectedLead(updatedLead);
      toast({ title: 'Sucesso', description: 'Lead atualizado com sucesso' });
    }
  };

  const handleDragEnd = async (leadId: string, newQualification: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const updatedLead = { ...lead, qualificacao: newQualification };
    setLeads(leads.map(l => l.id === leadId ? updatedLead : l));

    const { error } = await supabase
      .from('usuarios')
      .update({ qualificacao: newQualification })
      .eq('id', leadId);

    if (error) {
      setLeads(leads);
      toast({ title: 'Erro', description: 'Falha ao mover lead', variant: 'destructive' });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-hidden flex flex-col">
          <DashboardHeader />
          <div className="flex-1 p-6 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <KanbanBoard 
                leads={leads} 
                onLeadClick={handleLeadClick}
                onDragEnd={handleDragEnd}
              />
            )}
          </div>
        </main>
        <LeadDrawer 
          lead={selectedLead}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onUpdate={handleUpdateLead}
        />
      </div>
    </SidebarProvider>
  );
}
