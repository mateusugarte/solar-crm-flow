import { Lead } from '@/pages/Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadsChartProps {
  leads: Lead[];
}

export function LeadsChart({ leads }: LeadsChartProps) {
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
    const count = leads.filter(lead => {
      if (!lead.criado_em) return false;
      return lead.criado_em === dateKey;
    }).length;

    return {
      label,
      leads: count,
    };
  });

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center gap-3 pb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-lg font-medium">Leads por Dia</CardTitle>
          <p className="text-sm text-muted-foreground">Últimos 14 dias</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(45 100% 55%)" stopOpacity={0.6}/>
                  <stop offset="50%" stopColor="hsl(45 100% 50%)" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="hsl(45 100% 45%)" stopOpacity={0.05}/>
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
                itemStyle={{ color: 'hsl(45 100% 50%)' }}
              />
              <Area
                type="monotoneX"
                dataKey="leads"
                stroke="hsl(45 100% 50%)"
                strokeWidth={2}
                fill="url(#gradientLeads)"
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(45 100% 50%)', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
