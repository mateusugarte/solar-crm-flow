import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { StatsCards } from '@/components/StatsCards';
import { LeadsTable } from '@/components/LeadsTable';
import { LeadsChart } from '@/components/LeadsChart';
import { ProposalChart } from '@/components/ProposalChart';
import { Loader2 } from 'lucide-react';
import { parse, startOfMonth, endOfMonth } from 'date-fns';

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

  // Filter leads for current month only
  const currentMonthLeads = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    return leads.filter(lead => {
      if (!lead.criado_em) return false;
      try {
        const leadDate = parse(lead.criado_em, 'dd-MM-yyyy', new Date());
        return leadDate >= monthStart && leadDate <= monthEnd;
      } catch {
        return false;
      }
    });
  }, [leads]);

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
      <div className="min-h-screen flex w-full bg-background animated-bg">
        <AppSidebar />
        <main className="flex-1 overflow-auto relative z-10">
          <DashboardHeader />
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">
                Visão Geral
              </h2>
              <span className="text-sm text-muted-foreground">
                {leads.length} leads totais • {currentMonthLeads.length} este mês
              </span>
            </div>
            <StatsCards leads={leads} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeadsChart leads={currentMonthLeads} />
              <ProposalChart leads={leads} />
            </div>
            <LeadsTable leads={currentMonthLeads} loading={loading} onRefresh={fetchLeads} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
