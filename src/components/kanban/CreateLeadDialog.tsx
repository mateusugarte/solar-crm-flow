import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { COLUMNS } from './KanbanBoard';

interface CreateLeadDialogProps {
  onCreated: () => void;
}

export function CreateLeadDialog({ onCreated }: CreateLeadDialogProps) {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
      setFormData({
        nome_completo: '',
        nome_whatsapp: '',
        numero: '',
        cpf: '',
        renda: '',
        qualificacao: 'Aquecendo',
        resumo: '',
      });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Criar Lead
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Lead</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <Label>Nome Completo *</Label>
              <Input
                value={formData.nome_completo}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Nome WhatsApp</Label>
              <Input
                value={formData.nome_whatsapp}
                onChange={(e) => setFormData({ ...formData, nome_whatsapp: e.target.value })}
                placeholder="Apelido no WhatsApp"
              />
            </div>
            <div className="space-y-1">
              <Label>Telefone *</Label>
              <Input
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                placeholder="11999999999"
              />
            </div>
            <div className="space-y-1">
              <Label>CPF</Label>
              <Input
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Renda</Label>
              <Input
                value={formData.renda}
                onChange={(e) => setFormData({ ...formData, renda: e.target.value })}
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Qualificação Inicial</Label>
              <Select
                value={formData.qualificacao}
                onValueChange={(v) => setFormData({ ...formData, qualificacao: v })}
              >
                <SelectTrigger>
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
            <div className="space-y-1 col-span-2">
              <Label>Resumo / Observações</Label>
              <Textarea
                value={formData.resumo}
                onChange={(e) => setFormData({ ...formData, resumo: e.target.value })}
                placeholder="Informações sobre o lead..."
              />
            </div>
          </div>
          <Button
            className="w-full gradient-solar"
            onClick={handleCreate}
            disabled={saving || !formData.nome_completo || !formData.numero}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
            Criar Lead
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
