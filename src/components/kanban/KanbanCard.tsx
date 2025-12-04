import { Lead } from '@/pages/Kanban';
import { Phone, User } from 'lucide-react';

interface KanbanCardProps {
  lead: Lead;
  color: string;
  onClick: () => void;
}

export function KanbanCard({ lead, color, onClick }: KanbanCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('leadId', lead.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="group bg-card border border-border/50 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-3">
        <div 
          className="w-2 h-full min-h-[40px] rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground truncate">
              {lead.nome_completo || lead.nome_whatsapp || 'Sem nome'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-3 h-3" />
            <span className="font-mono text-xs">{lead.numero}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
