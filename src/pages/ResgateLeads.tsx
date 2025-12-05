import { useState, useEffect, useMemo } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Clock, UserX, Phone, MessageCircle, Users, Target, TrendingUp } from 'lucide-react';
import { parse, differenceInHours } from 'date-fns';

interface Lead {
  id: string;
  numero: string;
  nome_completo: string | null;
  nome_whatsapp: string | null;
  qualificacao: string | null;
  renda: string | null;
  ultima_mensagem: string | null;
  criado_em: string | null;
  cpf: string | null;
  resumo: string | null;
  pausar_ia: string | null;
  Oportunidade: string | null;
}

export default function ResgateLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('ultima_mensagem', { ascending: false });

    if (!error && data) {
      setLeads(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const parseDate = (dateStr: string | null): Date | null => {
    if (!dateStr) return null;
    try {
      return parse(dateStr, 'dd-MM-yyyy HH:mm', new Date());
    } catch {
      return null;
    }
  };

  const isMoreThan8HoursAgo = (dateStr: string | null): boolean => {
    const date = parseDate(dateStr);
    if (!date) return false;
    const hoursAgo = differenceInHours(new Date(), date);
    return hoursAgo > 8;
  };

  const hasOpportunity = (lead: Lead): boolean => {
    return !!lead.Oportunidade && lead.Oportunidade.trim() !== '';
  };

  const oportunidades = useMemo(() => {
    return leads.filter(lead => hasOpportunity(lead));
  }, [leads]);

  const desqualificados = useMemo(() => {
    return leads.filter(lead => lead.qualificacao === 'Desqualificado');
  }, [leads]);

  const followUp = useMemo(() => {
    return leads.filter(lead => 
      lead.qualificacao !== 'Desqualificado' && 
      lead.qualificacao !== 'Qualificado' &&
      isMoreThan8HoursAgo(lead.ultima_mensagem)
    );
  }, [leads]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return dateStr;
  };

  const getHoursAgo = (dateStr: string | null): string => {
    const date = parseDate(dateStr);
    if (!date) return '-';
    const hours = differenceInHours(new Date(), date);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const stats = [
    {
      title: 'Follow-up Pendente',
      value: followUp.length,
      icon: Clock,
    },
    {
      title: 'Oportunidades',
      value: oportunidades.length,
      icon: Target,
    },
    {
      title: 'Desqualificados',
      value: desqualificados.length,
      icon: UserX,
    },
    {
      title: 'Taxa de Resgate',
      value: desqualificados.length > 0 
        ? `${Math.round((oportunidades.length / desqualificados.length) * 100)}%` 
        : '0%',
      icon: TrendingUp,
    },
  ];

  const LeadTable = ({ data, showHoursAgo = false }: { data: Lead[], showHoursAgo?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow className="border-border/50">
          <TableHead className="text-muted-foreground">Contato</TableHead>
          <TableHead className="text-muted-foreground">Número</TableHead>
          <TableHead className="text-muted-foreground">Qualificação</TableHead>
          <TableHead className="text-muted-foreground">Renda</TableHead>
          <TableHead className="text-muted-foreground">Última Mensagem</TableHead>
          {showHoursAgo && <TableHead className="text-muted-foreground">Tempo</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showHoursAgo ? 6 : 5} className="text-center text-muted-foreground py-8">
              Nenhum lead encontrado
            </TableCell>
          </TableRow>
        ) : (
          data.map((lead) => (
            <TableRow 
              key={lead.id} 
              className="border-border/30 hover:bg-muted/30 cursor-pointer"
              onClick={() => handleLeadClick(lead)}
            >
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {lead.nome_completo || lead.nome_whatsapp || 'Sem nome'}
                  </span>
                  {lead.nome_whatsapp && lead.nome_completo && (
                    <span className="text-xs text-muted-foreground">{lead.nome_whatsapp}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  {lead.numero}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={
                    lead.qualificacao === 'Desqualificado' 
                      ? 'border-red-500/50 text-red-400 bg-red-500/10' 
                      : 'border-amber-500/50 text-amber-400 bg-amber-500/10'
                  }
                >
                  {lead.qualificacao || 'Não definido'}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {lead.renda || '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  {formatDate(lead.ultima_mensagem)}
                </div>
              </TableCell>
              {showHoursAgo && (
                <TableCell>
                  <Badge variant="outline" className="border-orange-500/50 text-orange-400 bg-orange-500/10">
                    <Clock className="w-3 h-3 mr-1" />
                    {getHoursAgo(lead.ultima_mensagem)}
                  </Badge>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background animated-bg">
        <AppSidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <DashboardHeader />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Resgate de Leads</h1>
                <p className="text-muted-foreground">Follow-up e oportunidades perdidas</p>
              </div>
              <Button 
                variant="outline" 
                onClick={fetchLeads} 
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {stats.map((stat) => (
                <Card 
                  key={stat.title}
                  className="border-border bg-card card-minimal-hover"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <stat.icon className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <p className="text-2xl font-semibold text-foreground mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.title}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="followup" className="space-y-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="followup" className="gap-2 data-[state=active]:bg-background">
                  <Clock className="w-4 h-4 text-primary" />
                  Follow-up ({followUp.length})
                </TabsTrigger>
                <TabsTrigger value="oportunidades" className="gap-2 data-[state=active]:bg-background">
                  <Target className="w-4 h-4 text-primary" />
                  Oportunidades ({oportunidades.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="followup">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-medium">
                      <Clock className="w-5 h-5 text-primary" />
                      Leads sem resposta há mais de 8 horas
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Leads que não responderam e precisam de acompanhamento
                    </p>
                  </CardHeader>
                  <CardContent>
                    <LeadTable data={followUp} showHoursAgo />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="oportunidades">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-medium">
                      <Target className="w-5 h-5 text-primary" />
                      Oportunidades de Resgate
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Leads com oportunidade identificada
                    </p>
                  </CardHeader>
                  <CardContent>
                    <LeadTable data={oportunidades} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Lead Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg bg-card border-border">
          <SheetHeader>
            <SheetTitle className="text-foreground">
              {selectedLead?.nome_completo || selectedLead?.nome_whatsapp || 'Lead'}
            </SheetTitle>
            <SheetDescription>
              Detalhes e resumo do lead
            </SheetDescription>
          </SheetHeader>
          
          {selectedLead && (
            <div className="mt-6 space-y-6">
              {/* Lead Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Número</p>
                    <p className="font-medium text-foreground">{selectedLead.numero}</p>
                  </div>
                </div>

                {selectedLead.nome_whatsapp && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Nome WhatsApp</p>
                      <p className="font-medium text-foreground">{selectedLead.nome_whatsapp}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Última Mensagem</p>
                    <p className="font-medium text-foreground">
                      {selectedLead.ultima_mensagem || '-'}
                      {selectedLead.ultima_mensagem && (
                        <span className="ml-2 text-xs text-orange-400">
                          ({getHoursAgo(selectedLead.ultima_mensagem)})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {selectedLead.renda && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Renda</p>
                      <p className="font-medium text-foreground">{selectedLead.renda}</p>
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-muted/30">
                  <Badge 
                    variant="outline" 
                    className={
                      selectedLead.qualificacao === 'Desqualificado' 
                        ? 'border-red-500/50 text-red-400 bg-red-500/10' 
                        : 'border-amber-500/50 text-amber-400 bg-amber-500/10'
                    }
                  >
                    {selectedLead.qualificacao || 'Não definido'}
                  </Badge>
                </div>
              </div>

              {/* Resumo Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Resumo da Conversa
                </h3>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  {selectedLead.resumo ? (
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {selectedLead.resumo}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhum resumo disponível para este lead.
                    </p>
                  )}
                </div>
              </div>

              {/* Opportunity Indicator */}
              {hasOpportunity(selectedLead) && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <p className="text-sm text-green-400 font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Oportunidade
                  </p>
                  <p className="text-sm text-foreground mt-2">
                    {selectedLead.Oportunidade}
                  </p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
}
