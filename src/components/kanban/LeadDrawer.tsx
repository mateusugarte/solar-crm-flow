import { useState, useEffect, useRef } from 'react';
import { Lead } from '@/pages/Kanban';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Phone, User, Wallet, FileText, Calendar, Brain, Upload, File, Trash2, ArrowRightLeft } from 'lucide-react';
import { COLUMNS } from './KanbanBoard';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LeadDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (lead: Lead) => void;
}

const PROPOSAL_COLUMNS = ['Elaborando Proposta', 'Proposta Enviada', 'Venda Concluida'];
const REJECTION_COLUMN = 'Proposta Rejeitada';

export function LeadDrawer({ lead, open, onOpenChange, onUpdate }: LeadDrawerProps) {
  const [formData, setFormData] = useState<Lead | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    formData.qualificacao?.toLowerCase() === c.id.toLowerCase()
  );

  const isProposalColumn = PROPOSAL_COLUMNS.some(
    col => formData.qualificacao?.toLowerCase() === col.toLowerCase()
  );

  const isRejectionColumn = formData.qualificacao?.toLowerCase() === REJECTION_COLUMN.toLowerCase();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({ title: 'Erro', description: 'Apenas arquivos PDF são permitidos', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const fileName = `${lead.id}-${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('propostas')
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: 'Erro', description: 'Falha ao fazer upload do arquivo', variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('propostas')
      .getPublicUrl(fileName);

    setFormData({ ...formData, pdf_url: publicUrl });
    toast({ title: 'Sucesso', description: 'Arquivo enviado com sucesso' });
    setUploading(false);
  };

  const handleRemovePdf = async () => {
    if (formData.pdf_url) {
      const fileName = formData.pdf_url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('propostas').remove([fileName]);
      }
      setFormData({ ...formData, pdf_url: null });
    }
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

        {/* Move To Section */}
        <div className="p-4 border-b border-border bg-muted/30">
          <Label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <ArrowRightLeft className="w-4 h-4" /> Mover para
          </Label>
          <Select
            value={formData.qualificacao || ''}
            onValueChange={(value) => setFormData({ ...formData, qualificacao: value })}
          >
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Selecione uma coluna..." />
            </SelectTrigger>
            <SelectContent>
              {COLUMNS.map(col => (
                <SelectItem key={col.id} value={col.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: col.color }}
                    />
                    {col.title}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            {/* Basic Fields */}
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

            {/* Proposal Fields - Show for Elaborando Proposta, Proposta Enviada, Venda Concluida */}
            {isProposalColumn && (
              <div className="pt-4 border-t border-border space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Dados da Proposta
                </h3>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Valor Enviado (R$)</Label>
                  <Input
                    value={formData.valor_proposta || ''}
                    onChange={(e) => setFormData({ ...formData, valor_proposta: e.target.value })}
                    placeholder="Ex: 45.000,00"
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Forma de Pagamento</Label>
                  <Select
                    value={formData.forma_pagamento || ''}
                    onValueChange={(value) => setFormData({ ...formData, forma_pagamento: value })}
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A Vista">À Vista</SelectItem>
                      <SelectItem value="Financiamento">Financiamento</SelectItem>
                      <SelectItem value="Parcelado">Parcelado</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="Cartao">Cartão de Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Produto</Label>
                  <Input
                    value={formData.produto_proposta || ''}
                    onChange={(e) => setFormData({ ...formData, produto_proposta: e.target.value })}
                    placeholder="Ex: Kit 10 Placas 550W"
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Prazo de Instalação</Label>
                  <Input
                    value={formData.prazo_instalacao || ''}
                    onChange={(e) => setFormData({ ...formData, prazo_instalacao: e.target.value })}
                    placeholder="Ex: 15 dias úteis"
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Informações Adicionais</Label>
                  <Textarea
                    value={formData.info_proposta || ''}
                    onChange={(e) => setFormData({ ...formData, info_proposta: e.target.value })}
                    placeholder="Observações sobre a proposta..."
                    className="bg-muted/50 border-border/50 min-h-[80px]"
                  />
                </div>

                {/* PDF Upload */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Anexar PDF da Proposta</Label>
                  <input
                    type="file"
                    accept="application/pdf"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {formData.pdf_url ? (
                    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                      <File className="w-5 h-5 text-primary" />
                      <a 
                        href={formData.pdf_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex-1 truncate"
                      >
                        Ver PDF anexado
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemovePdf}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Enviando...' : 'Selecionar PDF'}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Rejection Fields - Show only for Proposta Rejeitada */}
            {isRejectionColumn && (
              <div className="pt-4 border-t border-border space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2 text-destructive">
                  <X className="w-4 h-4" />
                  Motivo da Rejeição
                </h3>

                <div className="space-y-2">
                  <Textarea
                    value={formData.motivo_rejeicao || ''}
                    onChange={(e) => setFormData({ ...formData, motivo_rejeicao: e.target.value })}
                    placeholder="Descreva o motivo da rejeição da proposta..."
                    className="bg-muted/50 border-border/50 min-h-[120px]"
                  />
                </div>
              </div>
            )}
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
