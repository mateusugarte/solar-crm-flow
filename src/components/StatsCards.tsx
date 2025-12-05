import { Lead } from '@/pages/Dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX, Flame, TrendingUp, Clock, FileCheck, ShoppingCart, FileX } from 'lucide-react';
import { parse, differenceInHours } from 'date-fns';

interface StatsCardsProps {
  leads: Lead[];
}

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

export function StatsCards({ leads }: StatsCardsProps) {
  const total = leads.length;
  const qualificados = leads.filter(l => 
    l.qualificacao?.toLowerCase() === 'qualificado'
  ).length;
  const desqualificados = leads.filter(l => 
    l.qualificacao?.toLowerCase() === 'desqualificado'
  ).length;
  const aquecendo = leads.filter(l => 
    l.qualificacao?.toLowerCase() === 'aquecendo'
  ).length;
  const followUp = leads.filter(l => 
    l.qualificacao !== 'Desqualificado' && 
    isMoreThan8HoursAgo(l.ultima_mensagem)
  ).length;
  const propostasEnviadas = leads.filter(l => 
    l.qualificacao?.toLowerCase() === 'proposta enviada'
  ).length;
  const vendasConcluidas = leads.filter(l => 
    l.qualificacao?.toLowerCase() === 'venda concluida'
  ).length;
  const propostasRejeitadas = leads.filter(l => 
    l.qualificacao?.toLowerCase() === 'proposta rejeitada'
  ).length;
  const taxaQualificacao = total > 0 ? Math.round((qualificados / total) * 100) : 0;

  const stats = [
    {
      title: 'Total de Leads',
      value: total,
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Taxa de Qualificação',
      value: `${taxaQualificacao}%`,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Qualificados',
      value: qualificados,
      icon: UserCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Propostas Enviadas',
      value: propostasEnviadas,
      icon: FileCheck,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Vendas Concluídas',
      value: vendasConcluidas,
      icon: ShoppingCart,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Propostas Rejeitadas',
      value: propostasRejeitadas,
      icon: FileX,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title}
          className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-foreground mb-1">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">
              {stat.title}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
