import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { StatsCards } from '@/components/StatsCards';
import { LeadsTable } from '@/components/LeadsTable';
import { LeadsChart } from '@/components/LeadsChart';
import { Loader2 } from 'lucide-react';

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
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen flex w-full bg-background cyber-grid">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <DashboardHeader />
          <div className="p-6 space-y-6 animate-fade-in">
            <StatsCards leads={leads} />
            <LeadsChart leads={leads} />
            <LeadsTable leads={leads} loading={loading} onRefresh={fetchLeads} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
