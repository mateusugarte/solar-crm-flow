import { Lead } from '@/pages/Kanban';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

interface Column {
  id: string;
  title: string;
  color: string;
}

interface KanbanColumnProps {
  column: Column;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export function KanbanColumn({ column, leads, onLeadClick, onDragOver, onDrop }: KanbanColumnProps) {
  return (
    <div 
      className="flex-shrink-0 w-72 flex flex-col bg-card/50 rounded-xl border border-border/50 backdrop-blur-sm"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full shadow-lg"
            style={{ backgroundColor: column.color, boxShadow: `0 0 10px ${column.color}` }}
          />
          <h3 className="font-display font-semibold text-foreground">{column.title}</h3>
          <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {leads.length}
          </span>
        </div>
      </div>
      <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px] max-h-[calc(100vh-280px)]">
        {leads.map(lead => (
          <KanbanCard 
            key={lead.id} 
            lead={lead} 
            color={column.color}
            onClick={() => onLeadClick(lead)}
          />
        ))}
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-lg">
            Arraste leads aqui
          </div>
        )}
      </div>
    </div>
  );
}
