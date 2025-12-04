import { Lead } from '@/pages/Kanban';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onDragEnd: (leadId: string, newQualification: string) => void;
}

export const COLUMNS = [
  { id: 'Aquecendo', title: 'Aquecendo', color: 'hsl(30 90% 55%)' },
  { id: 'Informando', title: 'Informando', color: 'hsl(200 80% 50%)' },
  { id: 'Coletando', title: 'Coletando', color: 'hsl(270 70% 55%)' },
  { id: 'Qualificado', title: 'Qualificado', color: 'hsl(142 76% 45%)' },
  { id: 'Desqualificado', title: 'Desqualificado', color: 'hsl(0 70% 55%)' },
  { id: 'Interesse', title: 'Interesse', color: 'hsl(45 100% 50%)' },
];

export function KanbanBoard({ leads, onLeadClick, onDragEnd }: KanbanBoardProps) {
  const getLeadsForColumn = (columnId: string) => {
    return leads.filter(lead => {
      const qual = lead.qualificacao?.toLowerCase() || '';
      const colId = columnId.toLowerCase();
      return qual.includes(colId) || qual === colId;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      onDragEnd(leadId, columnId);
    }
  };

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {COLUMNS.map(column => (
        <KanbanColumn
          key={column.id}
          column={column}
          leads={getLeadsForColumn(column.id)}
          onLeadClick={onLeadClick}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        />
      ))}
    </div>
  );
}
