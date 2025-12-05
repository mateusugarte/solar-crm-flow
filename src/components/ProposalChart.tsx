import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';
import { FileText } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Lead {
  id: string;
  qualificacao: string | null;
  criado_em: string | null;
}

interface ProposalChartProps {
  leads: Lead[];
}

export function ProposalChart({ leads }: ProposalChartProps) {
  // Get last 14 days
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    return {
      date,
      dateKey: format(date, 'dd-MM-yyyy'),
      label: format(date, 'dd/MM', { locale: ptBR }),
    };
  });

  const chartData = last14Days.map(({ dateKey, label }) => {
    const propostasEnviadas = leads.filter(lead => {
      if (!lead.criado_em) return false;
      const leadDatePart = lead.criado_em.split(' ')[0];
      return leadDatePart === dateKey && lead.qualificacao?.toLowerCase() === 'proposta enviada';
    }).length;

    const vendasConcluidas = leads.filter(lead => {
      if (!lead.criado_em) return false;
      const leadDatePart = lead.criado_em.split(' ')[0];
      return leadDatePart === dateKey && lead.qualificacao?.toLowerCase() === 'venda concluida';
    }).length;

    const propostasRejeitadas = leads.filter(lead => {
      if (!lead.criado_em) return false;
      const leadDatePart = lead.criado_em.split(' ')[0];
      return leadDatePart === dateKey && lead.qualificacao?.toLowerCase() === 'proposta rejeitada';
    }).length;

    return {
      label,
      propostasEnviadas,
      vendasConcluidas,
      propostasRejeitadas,
    };
  });

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center gap-3 pb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-lg font-medium">Propostas e Vendas</CardTitle>
          <p className="text-sm text-muted-foreground">Últimos 14 dias</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientPropostas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(45 100% 55%)" stopOpacity={0.5}/>
                  <stop offset="100%" stopColor="hsl(45 100% 50%)" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="gradientVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(40 100% 45%)" stopOpacity={0.5}/>
                  <stop offset="100%" stopColor="hsl(40 100% 40%)" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="gradientRejeitadas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(35 100% 40%)" stopOpacity={0.5}/>
                  <stop offset="100%" stopColor="hsl(35 100% 35%)" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    propostasEnviadas: 'Propostas Enviadas',
                    vendasConcluidas: 'Vendas Concluídas',
                    propostasRejeitadas: 'Propostas Rejeitadas',
                  };
                  return <span className="text-xs text-muted-foreground">{labels[value] || value}</span>;
                }}
              />
              <Area
                type="monotoneX"
                dataKey="propostasEnviadas"
                stroke="hsl(45 100% 55%)"
                strokeWidth={2}
                fill="url(#gradientPropostas)"
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(45 100% 55%)', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
              <Area
                type="monotoneX"
                dataKey="vendasConcluidas"
                stroke="hsl(40 100% 45%)"
                strokeWidth={2}
                fill="url(#gradientVendas)"
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(40 100% 45%)', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
              <Area
                type="monotoneX"
                dataKey="propostasRejeitadas"
                stroke="hsl(35 100% 40%)"
                strokeWidth={2}
                fill="url(#gradientRejeitadas)"
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(35 100% 40%)', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
