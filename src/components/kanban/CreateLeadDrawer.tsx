import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { COLUMNS } from './KanbanBoard';
import { cn } from '@/lib/utils';

interface CreateLeadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateLeadDrawer({ open, onOpenChange, onCreated }: CreateLeadDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    nome_whatsapp: '',
    numero: '',
    cpf: '',
    renda: '',
    qualificacao: 'Aquecendo',
    resumo: '',
  });

  const handleCreate = async () => {
    if (!formData.nome_completo || !formData.numero) {
      toast({ title: 'Erro', description: 'Nome e número são obrigatórios', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('usuarios')
      .insert({
        nome_completo: formData.nome_completo,
        nome_whatsapp: formData.nome_whatsapp || formData.nome_completo,
        numero: formData.numero,
        cpf: formData.cpf,
        renda: formData.renda,
        qualificacao: formData.qualificacao,
        resumo: formData.resumo,
        criado_em: new Date().toLocaleDateString('pt-BR').split('/').join('-'),
        pausar_ia: 'Não',
      });

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao criar lead', variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Lead criado com sucesso!' });
      onCreated();
      resetAndClose();
    }
    setSaving(false);
  };

  const resetAndClose = () => {
    onOpenChange(false);
    setFormData({
      nome_completo: '',
      nome_whatsapp: '',
      numero: '',
      cpf: '',
      renda: '',
      qualificacao: 'Aquecendo',
      resumo: '',
    });
  };

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
            <div className="w-3 h-3 rounded-full bg-primary" style={{ boxShadow: '0 0 10px hsl(var(--primary))' }} />
            <h2 className="text-xl font-display font-bold text-foreground">Criar Novo Lead</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={resetAndClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Nome Completo *</Label>
            <Input
              value={formData.nome_completo}
              onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
              className="bg-muted/50 border-border/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Nome WhatsApp</Label>
              <Input
                value={formData.nome_whatsapp}
                onChange={(e) => setFormData({ ...formData, nome_whatsapp: e.target.value })}
                placeholder="Apelido no WhatsApp"
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Telefone *</Label>
              <Input
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                placeholder="11999999999"
                className="bg-muted/50 border-border/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">CPF</Label>
              <Input
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Renda</Label>
              <Input
                value={formData.renda}
                onChange={(e) => setFormData({ ...formData, renda: e.target.value })}
                className="bg-muted/50 border-border/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Qualificação Inicial</Label>
            <Select
              value={formData.qualificacao}
              onValueChange={(v) => setFormData({ ...formData, qualificacao: v })}
            >
              <SelectTrigger className="bg-muted/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLUMNS.map(col => (
                  <SelectItem key={col.id} value={col.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                      {col.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Resumo / Observações</Label>
            <Textarea
              value={formData.resumo}
              onChange={(e) => setFormData({ ...formData, resumo: e.target.value })}
              placeholder="Informações sobre o lead..."
              className="bg-muted/50 border-border/50 min-h-[100px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <Button
            className="w-full gradient-solar text-primary-foreground font-semibold"
            onClick={handleCreate}
            disabled={saving || !formData.nome_completo || !formData.numero}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
            Criar Lead
          </Button>
        </div>
      </div>
    </div>
  );
}
