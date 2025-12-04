import { Lead } from '@/pages/Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadsChartProps {
  leads: Lead[];
}

export function LeadsChart({ leads }: LeadsChartProps) {
  // Agrupa leads por dia dos últimos 14 dias
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    return format(date, 'yyyy-MM-dd');
  });

  const chartData = last14Days.map(date => {
    const count = leads.filter(lead => {
      if (!lead.criado_em) return false;
      try {
        const leadDate = lead.criado_em.split(' ')[0];
        return leadDate === date;
      } catch {
        return false;
      }
    }).length;

    return {
      date,
      label: format(parseISO(date), 'dd/MM', { locale: ptBR }),
      leads: count,
    };
  });

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center gap-3 pb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-lg font-display">Leads por Dia</CardTitle>
          <p className="text-sm text-muted-foreground">Últimos 14 dias</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(45 100% 51%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(45 100% 51%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
                itemStyle={{ color: 'hsl(45 100% 51%)' }}
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="hsl(45 100% 51%)"
                strokeWidth={3}
                fill="url(#colorLeads)"
                dot={{ fill: 'hsl(45 100% 51%)', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(45 100% 51%)', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
