import { Lead } from '@/pages/Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, subDays, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadsChartProps {
  leads: Lead[];
}

// Parse date from dd-MM-yy format to Date object
function parseLeadDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  try {
    // Format: dd-MM-yy (ex: 03-12-25)
    const parsed = parse(dateStr, 'dd-MM-yy', new Date());
    return parsed;
  } catch {
    return null;
  }
}

export function LeadsChart({ leads }: LeadsChartProps) {
  // Get last 14 days
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    return {
      date,
      dateKey: format(date, 'dd-MM-yyyy'), // Format: 03-12-2025
      label: format(date, 'dd/MM', { locale: ptBR }),
    };
  });

  const chartData = last14Days.map(({ dateKey, label }) => {
    const count = leads.filter(lead => {
      if (!lead.criado_em) return false;
      // Direct comparison since both are in dd-MM-yyyy format
      return lead.criado_em === dateKey;
    }).length;

    return {
      label,
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
