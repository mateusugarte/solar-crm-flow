import { useState, useEffect, useMemo } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Clock, UserX, Phone, MessageCircle, Calendar } from 'lucide-react';
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
}

export default function ResgateLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

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

  const desqualificados = useMemo(() => {
    return leads.filter(lead => lead.qualificacao === 'Desqualificado');
  }, [leads]);

  const followUp = useMemo(() => {
    return leads.filter(lead => 
      lead.qualificacao !== 'Desqualificado' && 
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
            <TableRow key={lead.id} className="border-border/30 hover:bg-muted/30">
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
                  <Phone className="w-4 h-4" />
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
                  <MessageCircle className="w-4 h-4" />
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
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Resgate de Leads</h1>
                <p className="text-muted-foreground">Follow-up e oportunidades perdidas</p>
              </div>
              <Button 
                variant="outline" 
                onClick={fetchLeads} 
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            <Tabs defaultValue="followup" className="space-y-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="followup" className="gap-2 data-[state=active]:bg-background">
                  <Clock className="w-4 h-4" />
                  Follow-up ({followUp.length})
                </TabsTrigger>
                <TabsTrigger value="oportunidades" className="gap-2 data-[state=active]:bg-background">
                  <UserX className="w-4 h-4" />
                  Oportunidades ({desqualificados.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="followup">
                <Card className="bg-card border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5 text-orange-400" />
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
                <Card className="bg-card border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <UserX className="w-5 h-5 text-red-400" />
                      Leads Desqualificados
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Oportunidades que podem ser reativadas no futuro
                    </p>
                  </CardHeader>
                  <CardContent>
                    <LeadTable data={desqualificados} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
