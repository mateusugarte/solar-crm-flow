import { useState, useEffect } from 'react';
import { Lead } from '@/pages/Kanban';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Phone, User, Wallet, FileText, Calendar, Brain } from 'lucide-react';
import { COLUMNS } from './KanbanBoard';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface LeadDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (lead: Lead) => void;
}

export function LeadDrawer({ lead, open, onOpenChange, onUpdate }: LeadDrawerProps) {
  const [formData, setFormData] = useState<Lead | null>(null);

  useEffect(() => {
    if (lead) {
      setFormData({ ...lead });
    }
  }, [lead]);

  if (!lead || !formData) return null;

  const handleSave = () => {
    if (formData) {
      onUpdate(formData);
    }
  };

  const currentColumn = COLUMNS.find(c => 
    formData.qualificacao?.toLowerCase().includes(c.id.toLowerCase())
  );

  return (
    <div 
      className={cn(
        "fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-50 transform transition-transform duration-300 ease-out",
        open ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: currentColumn?.color || 'hsl(var(--muted))',
                boxShadow: `0 0 10px ${currentColumn?.color || 'transparent'}`
              }}
            />
            <h2 className="text-xl font-display font-bold text-foreground">Detalhes do Lead</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" /> Nome Completo
              </Label>
              <Input
                value={formData.nome_completo || ''}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                className="bg-muted/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" /> Número
              </Label>
              <Input
                value={formData.numero}
                disabled
                className="bg-muted/30 border-border/30 font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                Nome WhatsApp
              </Label>
              <Input
                value={formData.nome_whatsapp || ''}
                onChange={(e) => setFormData({ ...formData, nome_whatsapp: e.target.value })}
                className="bg-muted/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                Qualificação
              </Label>
              <Select
                value={formData.qualificacao || ''}
                onValueChange={(value) => setFormData({ ...formData, qualificacao: value })}
              >
                <SelectTrigger className="bg-muted/50 border-border/50">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {COLUMNS.map(col => (
                    <SelectItem key={col.id} value={col.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: col.color }}
                        />
                        {col.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="w-4 h-4" /> Renda
              </Label>
              <Input
                value={formData.renda || ''}
                onChange={(e) => setFormData({ ...formData, renda: e.target.value })}
                className="bg-muted/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                CPF
              </Label>
              <Input
                value={formData.cpf || ''}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                className="bg-muted/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <FileText className="w-4 h-4" /> Resumo
              </Label>
              <Textarea
                value={formData.resumo || ''}
                onChange={(e) => setFormData({ ...formData, resumo: e.target.value })}
                className="bg-muted/50 border-border/50 min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" /> Última Mensagem
              </Label>
              <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                {formData.ultima_mensagem || 'Sem mensagem'}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Brain className="w-4 h-4" /> Pausar IA
              </Label>
              <Select
                value={formData.pausar_ia || 'Não'}
                onValueChange={(value) => setFormData({ ...formData, pausar_ia: value })}
              >
                <SelectTrigger className="bg-muted/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sim">Sim</SelectItem>
                  <SelectItem value="Não">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <Button 
            onClick={handleSave}
            className="w-full gradient-solar text-primary-foreground font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
