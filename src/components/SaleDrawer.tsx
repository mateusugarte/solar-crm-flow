import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, ShoppingCart, Users, UserPlus, Search, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  numero: string;
  nome_whatsapp: string | null;
  nome_completo: string | null;
  qualificacao: string | null;
  renda: string | null;
  valor_proposta: string | null;
  forma_pagamento: string | null;
  produto_proposta: string | null;
}

interface SaleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leads: Lead[];
  onSuccess: () => void;
}

export function SaleDrawer({ open, onOpenChange, leads, onSuccess }: SaleDrawerProps) {
  const [mode, setMode] = useState<'select' | 'manual' | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  // Form data for manual registration
  const [formData, setFormData] = useState({
    nome_completo: '',
    numero: '',
    cpf: '',
    renda: '',
    valor_proposta: '',
    forma_pagamento: '',
    produto_proposta: '',
    prazo_instalacao: '',
    info_proposta: '',
  });

  // Sale data (used for existing lead)
  const [saleData, setSaleData] = useState({
    valor_proposta: '',
    forma_pagamento: '',
    produto_proposta: '',
    prazo_instalacao: '',
    info_proposta: '',
  });

  const filteredLeads = useMemo(() => {
    if (!searchTerm) return leads;
    const term = searchTerm.toLowerCase();
    return leads.filter(l => 
      l.nome_completo?.toLowerCase().includes(term) ||
      l.numero?.includes(term) ||
      l.nome_whatsapp?.toLowerCase().includes(term)
    );
  }, [leads, searchTerm]);

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setSaleData({
      valor_proposta: lead.valor_proposta || '',
      forma_pagamento: lead.forma_pagamento || '',
      produto_proposta: lead.produto_proposta || '',
      prazo_instalacao: '',
      info_proposta: '',
    });
  };

  const handleRegisterSale = async () => {
    setSaving(true);

    if (mode === 'select' && selectedLead) {
      const { error } = await supabase
        .from('usuarios')
        .update({
          qualificacao: 'Venda Concluida',
          valor_proposta: saleData.valor_proposta,
          forma_pagamento: saleData.forma_pagamento,
          produto_proposta: saleData.produto_proposta,
          prazo_instalacao: saleData.prazo_instalacao,
          info_proposta: saleData.info_proposta,
        })
        .eq('id', selectedLead.id);

      if (error) {
        toast({ title: 'Erro', description: 'Falha ao registrar venda', variant: 'destructive' });
      } else {
        toast({ title: 'Sucesso', description: 'Venda registrada com sucesso!' });
        onSuccess();
        resetAndClose();
      }
    } else if (mode === 'manual') {
      const { error } = await supabase
        .from('usuarios')
        .insert({
          nome_completo: formData.nome_completo,
          numero: formData.numero,
          cpf: formData.cpf,
          renda: formData.renda,
          qualificacao: 'Venda Concluida',
          valor_proposta: formData.valor_proposta,
          forma_pagamento: formData.forma_pagamento,
          produto_proposta: formData.produto_proposta,
          prazo_instalacao: formData.prazo_instalacao,
          info_proposta: formData.info_proposta,
          criado_em: new Date().toLocaleDateString('pt-BR').split('/').join('-'),
        });

      if (error) {
        toast({ title: 'Erro', description: 'Falha ao registrar venda', variant: 'destructive' });
      } else {
        toast({ title: 'Sucesso', description: 'Venda registrada com sucesso!' });
        onSuccess();
        resetAndClose();
      }
    }

    setSaving(false);
  };

  const resetAndClose = () => {
    onOpenChange(false);
    setMode(null);
    setSelectedLead(null);
    setSearchTerm('');
    setFormData({
      nome_completo: '',
      numero: '',
      cpf: '',
      renda: '',
      valor_proposta: '',
      forma_pagamento: '',
      produto_proposta: '',
      prazo_instalacao: '',
      info_proposta: '',
    });
    setSaleData({
      valor_proposta: '',
      forma_pagamento: '',
      produto_proposta: '',
      prazo_instalacao: '',
      info_proposta: '',
    });
  };

  const goBack = () => {
    if (selectedLead) {
      setSelectedLead(null);
    } else {
      setMode(null);
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
            <div className="w-3 h-3 rounded-full bg-green-500" style={{ boxShadow: '0 0 10px hsl(120 70% 40%)' }} />
            <h2 className="text-xl font-display font-bold text-foreground">Registrar Venda</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={resetAndClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Mode Selection */}
          {!mode && (
            <div className="space-y-6">
              <p className="text-muted-foreground">Como deseja registrar a venda?</p>
              <div className="grid grid-cols-1 gap-4">
                <button
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all group"
                  onClick={() => setMode('select')}
                >
                  <div className="p-3 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Usuário Existente</p>
                    <p className="text-sm text-muted-foreground">Selecionar do banco de dados</p>
                  </div>
                </button>
                <button
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all group"
                  onClick={() => setMode('manual')}
                >
                  <div className="p-3 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                    <UserPlus className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Cadastrar Manual</p>
                    <p className="text-sm text-muted-foreground">Inserir dados do cliente</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Select Existing Lead */}
          {mode === 'select' && !selectedLead && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted/50"
                />
              </div>

              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-2 pr-2">
                  {filteredLeads.map(lead => (
                    <div
                      key={lead.id}
                      className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/50 cursor-pointer transition-all"
                      onClick={() => handleSelectLead(lead)}
                    >
                      <p className="font-medium text-foreground">{lead.nome_completo || lead.nome_whatsapp || 'Sem nome'}</p>
                      <p className="text-sm text-muted-foreground font-mono">{lead.numero}</p>
                      {lead.qualificacao && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground mt-2 inline-block">
                          {lead.qualificacao}
                        </span>
                      )}
                    </div>
                  ))}
                  {filteredLeads.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhum lead encontrado</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Sale Form for Selected Lead */}
          {mode === 'select' && selectedLead && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Button>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <p className="font-semibold text-foreground">{selectedLead.nome_completo || selectedLead.nome_whatsapp}</p>
                <p className="text-sm text-muted-foreground font-mono">{selectedLead.numero}</p>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="font-semibold text-foreground border-b border-border pb-2">Dados da Venda</h3>
                
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Valor da Venda (R$)</Label>
                  <Input
                    value={saleData.valor_proposta}
                    onChange={(e) => setSaleData({ ...saleData, valor_proposta: e.target.value })}
                    placeholder="Ex: 45.000,00"
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Forma de Pagamento</Label>
                  <Select
                    value={saleData.forma_pagamento}
                    onValueChange={(v) => setSaleData({ ...saleData, forma_pagamento: v })}
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
                    value={saleData.produto_proposta}
                    onChange={(e) => setSaleData({ ...saleData, produto_proposta: e.target.value })}
                    placeholder="Ex: Kit 10 Placas 550W"
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Prazo de Instalação</Label>
                  <Input
                    value={saleData.prazo_instalacao}
                    onChange={(e) => setSaleData({ ...saleData, prazo_instalacao: e.target.value })}
                    placeholder="Ex: 15 dias úteis"
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Observações</Label>
                  <Textarea
                    value={saleData.info_proposta}
                    onChange={(e) => setSaleData({ ...saleData, info_proposta: e.target.value })}
                    placeholder="Informações adicionais..."
                    className="bg-muted/50 border-border/50 min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Manual Registration Form */}
          {mode === 'manual' && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Button>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b border-border pb-2">Dados do Cliente</h3>

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
                    <Label className="text-muted-foreground">Telefone *</Label>
                    <Input
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      placeholder="11999999999"
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">CPF</Label>
                    <Input
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Renda</Label>
                  <Input
                    value={formData.renda}
                    onChange={(e) => setFormData({ ...formData, renda: e.target.value })}
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <h3 className="font-semibold text-foreground border-b border-border pb-2 pt-4">Dados da Venda</h3>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Valor da Venda (R$) *</Label>
                  <Input
                    value={formData.valor_proposta}
                    onChange={(e) => setFormData({ ...formData, valor_proposta: e.target.value })}
                    placeholder="Ex: 45.000,00"
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Forma de Pagamento *</Label>
                  <Select
                    value={formData.forma_pagamento}
                    onValueChange={(v) => setFormData({ ...formData, forma_pagamento: v })}
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
                  <Label className="text-muted-foreground">Produto *</Label>
                  <Input
                    value={formData.produto_proposta}
                    onChange={(e) => setFormData({ ...formData, produto_proposta: e.target.value })}
                    placeholder="Ex: Kit 10 Placas 550W"
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Prazo de Instalação</Label>
                  <Input
                    value={formData.prazo_instalacao}
                    onChange={(e) => setFormData({ ...formData, prazo_instalacao: e.target.value })}
                    placeholder="Ex: 15 dias úteis"
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Observações</Label>
                  <Textarea
                    value={formData.info_proposta}
                    onChange={(e) => setFormData({ ...formData, info_proposta: e.target.value })}
                    placeholder="Informações adicionais..."
                    className="bg-muted/50 border-border/50 min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {((mode === 'select' && selectedLead) || mode === 'manual') && (
          <div className="p-6 border-t border-border">
            <Button 
              onClick={handleRegisterSale}
              disabled={saving || (mode === 'manual' && (!formData.nome_completo || !formData.numero || !formData.valor_proposta))}
              className="w-full gradient-solar text-primary-foreground font-semibold"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
              Registrar Venda
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
