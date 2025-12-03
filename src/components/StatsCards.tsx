import { Lead } from '@/pages/Dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, TrendingUp, MessageSquare } from 'lucide-react';

interface StatsCardsProps {
  leads: Lead[];
}

export function StatsCards({ leads }: StatsCardsProps) {
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l => 
    l.qualificacao?.toLowerCase().includes('qualificado') || 
    l.qualificacao?.toLowerCase().includes('hot')
  ).length;
  const withIncome = leads.filter(l => l.renda).length;
  const recentMessages = leads.filter(l => l.ultima_mensagem).length;

  const stats = [
    {
      title: 'Total de Leads',
      value: totalLeads,
      icon: Users,
      gradient: 'gradient-solar',
      textColor: 'text-primary-foreground',
    },
    {
      title: 'Qualificados',
      value: qualifiedLeads,
      icon: UserCheck,
      gradient: 'gradient-ocean',
      textColor: 'text-secondary-foreground',
    },
    {
      title: 'Com Renda',
      value: withIncome,
      icon: TrendingUp,
      gradient: 'bg-success',
      textColor: 'text-success-foreground',
    },
    {
      title: 'Mensagens Recentes',
      value: recentMessages,
      icon: MessageSquare,
      gradient: 'bg-accent',
      textColor: 'text-accent-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title} 
          className="border-0 shadow-soft overflow-hidden animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-5">
              <div className={`p-3 rounded-xl ${stat.gradient}`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                <p className="text-3xl font-display font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
