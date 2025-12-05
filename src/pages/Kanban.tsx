import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { LeadDrawer } from '@/components/kanban/LeadDrawer';
import { CreateLeadDialog } from '@/components/kanban/CreateLeadDialog';
import { Loader2, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parse, isAfter, subDays, startOfDay } from 'date-fns';

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
  // Proposal fields
  valor_proposta: string | null;
  forma_pagamento: string | null;
  produto_proposta: string | null;
  prazo_instalacao: string | null;
  info_proposta: string | null;
  motivo_rejeicao: string | null;
  pdf_url: string | null;
}

type DateFilter = 'today' | '3days' | '7days' | '30days' | 'all';

export default function Kanban() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

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
      setLeads(data as Lead[]);
    }
    setLoading(false);
  };

  const filteredLeads = useMemo(() => {
    if (dateFilter === 'all') return leads;

    const now = new Date();
    let cutoffDate: Date;

    switch (dateFilter) {
      case 'today':
        cutoffDate = startOfDay(now);
        break;
      case '3days':
        cutoffDate = startOfDay(subDays(now, 3));
        break;
      case '7days':
        cutoffDate = startOfDay(subDays(now, 7));
        break;
      case '30days':
        cutoffDate = startOfDay(subDays(now, 30));
        break;
      default:
        return leads;
    }

    return leads.filter(lead => {
      if (!lead.criado_em) return false;
      try {
        const leadDate = parse(lead.criado_em, 'dd-MM-yyyy', new Date());
        return isAfter(leadDate, cutoffDate) || leadDate.getTime() === cutoffDate.getTime();
      } catch {
        return false;
      }
    });
  }, [leads, dateFilter]);

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
        valor_proposta: updatedLead.valor_proposta,
        forma_pagamento: updatedLead.forma_pagamento,
        produto_proposta: updatedLead.produto_proposta,
        prazo_instalacao: updatedLead.prazo_instalacao,
        info_proposta: updatedLead.info_proposta,
        motivo_rejeicao: updatedLead.motivo_rejeicao,
        pdf_url: updatedLead.pdf_url,
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
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            {/* Date Filter and Create Button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
                  <SelectTrigger className="w-48 bg-card border-border">
                    <SelectValue placeholder="Filtrar por data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os leads</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="3days">Últimos 3 dias</SelectItem>
                    <SelectItem value="7days">Últimos 7 dias</SelectItem>
                    <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
                </span>
              </div>
              <CreateLeadDialog onCreated={fetchLeads} />
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <KanbanBoard 
                leads={filteredLeads} 
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
