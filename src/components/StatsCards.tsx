import { Lead } from '@/pages/Dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, TrendingUp, FileCheck, ShoppingCart, FileX, FileEdit, Target, UserX, Clock } from 'lucide-react';
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
  
  const elaborandoProposta = leads.filter(l => 
    l.qualificacao?.toLowerCase() === 'elaborando proposta'
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
  
  const desqualificados = leads.filter(l => 
    l.qualificacao?.toLowerCase() === 'desqualificado'
  ).length;
  
  const pendentesFollowUp = leads.filter(l => 
    l.qualificacao?.toLowerCase() !== 'desqualificado' &&
    l.qualificacao?.toLowerCase() !== 'venda concluida' &&
    l.qualificacao?.toLowerCase() !== 'proposta rejeitada' &&
    isMoreThan8HoursAgo(l.ultima_mensagem)
  ).length;
  
  // Taxa de conversão: vendas / total de propostas (enviadas + rejeitadas + vendas)
  const totalPropostas = propostasEnviadas + vendasConcluidas + propostasRejeitadas;
  const taxaConversao = totalPropostas > 0 ? Math.round((vendasConcluidas / totalPropostas) * 100) : 0;

  const stats = [
    {
      title: 'Total de Leads',
      value: total,
      icon: Users,
    },
    {
      title: 'Taxa de Conversão',
      value: `${taxaConversao}%`,
      icon: Target,
    },
    {
      title: 'Qualificados',
      value: qualificados,
      icon: UserCheck,
    },
    {
      title: 'Elaborando Proposta',
      value: elaborandoProposta,
      icon: FileEdit,
    },
    {
      title: 'Propostas Enviadas',
      value: propostasEnviadas,
      icon: FileCheck,
    },
    {
      title: 'Vendas Concluídas',
      value: vendasConcluidas,
      icon: ShoppingCart,
    },
    {
      title: 'Propostas Rejeitadas',
      value: propostasRejeitadas,
      icon: FileX,
    },
    {
      title: 'Desqualificados',
      value: desqualificados,
      icon: UserX,
    },
    {
      title: 'Pendentes Follow-up',
      value: pendentesFollowUp,
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
  );
}
