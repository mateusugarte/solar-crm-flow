import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SaleDrawer } from '@/components/SaleDrawer';
import { Loader2, ShoppingCart, DollarSign, TrendingUp, FileCheck } from 'lucide-react';

interface Lead {
  id: string;
  numero: string;
  nome_whatsapp: string | null;
  nome_completo: string | null;
  qualificacao: string | null;
  renda: string | null;
  valor_proposta: string | null;
  forma_pagamento: string | null;
  produto_proposta: string | null;
}

export default function Vendas() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
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
      setLeads(data as Lead[]);
    }
    setLoading(false);
  };

  const stats = useMemo(() => {
    const vendasConcluidas = leads.filter(l => 
      l.qualificacao?.toLowerCase() === 'venda concluida'
    );
    const totalVendas = vendasConcluidas.length;
    const valorTotal = vendasConcluidas.reduce((acc, l) => {
      const valor = parseFloat(l.valor_proposta?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
      return acc + valor;
    }, 0);
    const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0;
    const propostasEnviadas = leads.filter(l => 
      l.qualificacao?.toLowerCase() === 'proposta enviada'
    ).length;

    return {
      totalVendas,
      valorTotal,
      ticketMedio,
      propostasEnviadas,
    };
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
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <ShoppingCart className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">{stats.totalVendas}</p>
                  <p className="text-xs text-muted-foreground">Vendas Concluídas</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Valor Total</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    R$ {stats.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Ticket Médio</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <FileCheck className="w-4 h-4 text-cyan-500" />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">{stats.propostasEnviadas}</p>
                  <p className="text-xs text-muted-foreground">Propostas Enviadas</p>
                </CardContent>
              </Card>
            </div>

            {/* Register Sale Button */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-medium">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Registrar Venda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full md:w-auto bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                  onClick={() => setDrawerOpen(true)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Registrar Nova Venda
                </Button>
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-medium">Vendas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leads
                      .filter(l => l.qualificacao?.toLowerCase() === 'venda concluida')
                      .slice(0, 10)
                      .map(lead => (
                        <div key={lead.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                          <div>
                            <p className="font-medium text-foreground">{lead.nome_completo || lead.nome_whatsapp || 'Sem nome'}</p>
                            <p className="text-sm text-muted-foreground">{lead.produto_proposta || 'Produto não informado'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-500">
                              R$ {lead.valor_proposta || '0'}
                            </p>
                            <p className="text-xs text-muted-foreground">{lead.forma_pagamento}</p>
                          </div>
                        </div>
                      ))}
                    {leads.filter(l => l.qualificacao?.toLowerCase() === 'venda concluida').length === 0 && (
                      <p className="text-center text-muted-foreground py-8">Nenhuma venda registrada ainda</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        
        <SaleDrawer 
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          leads={leads}
          onSuccess={fetchLeads}
        />
      </div>
    </SidebarProvider>
  );
}
