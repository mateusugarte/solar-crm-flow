import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
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
      return lead.criado_em === dateKey && lead.qualificacao?.toLowerCase() === 'proposta enviada';
    }).length;

    const vendasConcluidas = leads.filter(lead => {
      if (!lead.criado_em) return false;
      return lead.criado_em === dateKey && lead.qualificacao?.toLowerCase() === 'venda concluida';
    }).length;

    const propostasRejeitadas = leads.filter(lead => {
      if (!lead.criado_em) return false;
      return lead.criado_em === dateKey && lead.qualificacao?.toLowerCase() === 'proposta rejeitada';
    }).length;

    return {
      label,
      propostasEnviadas,
      vendasConcluidas,
      propostasRejeitadas,
    };
  });

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center gap-3 pb-4">
        <div className="p-2 rounded-lg bg-cyan-500/10">
          <FileText className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <CardTitle className="text-lg font-display">Propostas e Vendas</CardTitle>
          <p className="text-sm text-muted-foreground">Últimos 14 dias</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
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
                  return labels[value] || value;
                }}
              />
              <Line
                type="monotone"
                dataKey="propostasEnviadas"
                stroke="hsl(190 80% 50%)"
                strokeWidth={3}
                dot={{ fill: 'hsl(190 80% 50%)', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(190 80% 50%)', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="vendasConcluidas"
                stroke="hsl(120 70% 40%)"
                strokeWidth={3}
                dot={{ fill: 'hsl(120 70% 40%)', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(120 70% 40%)', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="propostasRejeitadas"
                stroke="hsl(350 70% 50%)"
                strokeWidth={3}
                dot={{ fill: 'hsl(350 70% 50%)', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(350 70% 50%)', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
