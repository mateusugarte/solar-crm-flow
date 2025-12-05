import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, ShoppingCart, Users, UserPlus, Search, Loader2, ArrowLeft, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { COLUMNS } from '@/components/kanban/KanbanBoard';

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
  criado_em: string | null;
}

interface Product {
  id: string;
  modelo: string | null;
  preco_por_placa: string | null;
  status: string | null;
}

interface SaleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leads: Lead[];
  onSuccess: () => void;
}

const getColumnColor = (qualificacao: string | null) => {
  if (!qualificacao) return null;
  const col = COLUMNS.find(c => c.id.toLowerCase() === qualificacao.toLowerCase());
  return col?.color || null;
};

export function SaleDrawer({ open, onOpenChange, leads, onSuccess }: SaleDrawerProps) {
  const [mode, setMode] = useState<'select' | 'manual' | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

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
    parcelas: '',
    valor_parcela: '',
    instituicao_financiamento: '',
  });

  // Sale data (used for existing lead)
  const [saleData, setSaleData] = useState({
    valor_proposta: '',
    forma_pagamento: '',
    produto_proposta: '',
    prazo_instalacao: '',
    info_proposta: '',
    parcelas: '',
    valor_parcela: '',
    instituicao_financiamento: '',
  });

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('placas_solares')
        .select('id, modelo, preco_por_placa, status')
        .eq('status', 'disponivel');
      
      if (!error && data) {
        setProducts(data);
      }
    };
    
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const filteredLeads = useMemo(() => {
    let filtered = leads;
    
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(lead => {
        if (!lead.criado_em) return false;
        const parts = lead.criado_em.split(/[-\/]/);
        if (parts.length < 3) return false;
        const leadDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const diffDays = Math.floor((today.getTime() - leadDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today': return diffDays === 0;
          case '3days': return diffDays <= 3;
          case '7days': return diffDays <= 7;
          default: return true;
        }
      });
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(l => 
        l.nome_completo?.toLowerCase().includes(term) ||
        l.numero?.includes(term) ||
        l.nome_whatsapp?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [leads, searchTerm, dateFilter]);

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setSaleData({
      valor_proposta: lead.valor_proposta || '',
      forma_pagamento: lead.forma_pagamento || '',
      produto_proposta: lead.produto_proposta || '',
      prazo_instalacao: '',
      info_proposta: '',
      parcelas: '',
      valor_parcela: '',
      instituicao_financiamento: '',
    });
  };

  const buildInfoProposta = (data: typeof saleData | typeof formData) => {
    let info = data.info_proposta || '';
    if (data.forma_pagamento === 'Cartao' || data.forma_pagamento === 'Financiamento') {
      const paymentDetails = [];
      if (data.parcelas) paymentDetails.push(`Parcelas: ${data.parcelas}x`);
      if (data.valor_parcela) paymentDetails.push(`Valor da parcela: R$ ${data.valor_parcela}`);
      if (data.forma_pagamento === 'Financiamento' && data.instituicao_financiamento) {
        paymentDetails.push(`Instituição: ${data.instituicao_financiamento}`);
      }
      if (paymentDetails.length > 0) {
        info = info ? `${info}\n\n${paymentDetails.join('\n')}` : paymentDetails.join('\n');
      }
    }
    return info;
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
          info_proposta: buildInfoProposta(saleData),
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
          info_proposta: buildInfoProposta(formData),
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
    setDateFilter('all');
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
      parcelas: '',
      valor_parcela: '',
      instituicao_financiamento: '',
    });
    setSaleData({
      valor_proposta: '',
      forma_pagamento: '',
      produto_proposta: '',
      prazo_instalacao: '',
      info_proposta: '',
      parcelas: '',
      valor_parcela: '',
      instituicao_financiamento: '',
    });
  };

  const goBack = () => {
    if (selectedLead) {
      setSelectedLead(null);
    } else {
      setMode(null);
    }
  };

  // Payment form fields component
  const PaymentFields = ({ data, setData }: { data: typeof saleData; setData: (d: typeof saleData) => void }) => (
    <>
      <div className="space-y-2">
        <Label className="text-muted-foreground">Forma de Pagamento</Label>
        <Select
          value={data.forma_pagamento}
          onValueChange={(v) => setData({ ...data, forma_pagamento: v, parcelas: '', valor_parcela: '', instituicao_financiamento: '' })}
        >
          <SelectTrigger className="bg-muted/50 border-border/50">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A Vista">À Vista</SelectItem>
            <SelectItem value="Financiamento">Financiamento</SelectItem>
            <SelectItem value="PIX">PIX</SelectItem>
            <SelectItem value="Cartao">Cartão de Crédito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.forma_pagamento === 'Cartao' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Nº de Parcelas</Label>
            <Select value={data.parcelas} onValueChange={(v) => setData({ ...data, parcelas: v })}>
              <SelectTrigger className="bg-muted/50 border-border/50">
                <SelectValue placeholder="Parcelas" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                  <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Valor da Parcela</Label>
            <Input
              value={data.valor_parcela}
              onChange={(e) => setData({ ...data, valor_parcela: e.target.value })}
              placeholder="R$ 0,00"
              className="bg-muted/50 border-border/50"
            />
          </div>
        </div>
      )}

      {data.forma_pagamento === 'Financiamento' && (
        <>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Instituição de Financiamento</Label>
            <Input
              value={data.instituicao_financiamento}
              onChange={(e) => setData({ ...data, instituicao_financiamento: e.target.value })}
              placeholder="Ex: BV, Santander, Caixa..."
              className="bg-muted/50 border-border/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Nº de Parcelas</Label>
              <Select value={data.parcelas} onValueChange={(v) => setData({ ...data, parcelas: v })}>
                <SelectTrigger className="bg-muted/50 border-border/50">
                  <SelectValue placeholder="Parcelas" />
                </SelectTrigger>
                <SelectContent>
                  {[12, 24, 36, 48, 60, 72, 84, 96, 108, 120].map(n => (
                    <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Valor da Parcela</Label>
              <Input
                value={data.valor_parcela}
                onChange={(e) => setData({ ...data, valor_parcela: e.target.value })}
                placeholder="R$ 0,00"
                className="bg-muted/50 border-border/50"
              />
            </div>
          </div>
        </>
      )}
    </>
  );

  // Product select field component
  const ProductSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div className="space-y-2">
      <Label className="text-muted-foreground">Produto</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-muted/50 border-border/50">
          <SelectValue placeholder="Selecione um produto..." />
        </SelectTrigger>
        <SelectContent>
          {products.map(product => (
            <SelectItem key={product.id} value={product.modelo || product.id}>
              {product.modelo} {product.preco_por_placa && `- ${product.preco_por_placa}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
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
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Users className="w-6 h-6 text-primary" />
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
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <UserPlus className="w-6 h-6 text-primary" />
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
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 text-primary">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Button>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="bg-muted/50 border-border/50 flex-1">
                    <SelectValue placeholder="Filtrar por data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="3days">Últimos 3 dias</SelectItem>
                    <SelectItem value="7days">Últimos 7 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <Input
                  placeholder="Buscar por nome ou número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted/50"
                />
              </div>

              <ScrollArea className="h-[calc(100vh-380px)]">
                <div className="space-y-2 pr-2">
                  {filteredLeads.map(lead => {
                    const qualColor = getColumnColor(lead.qualificacao);
                    return (
                      <div
                        key={lead.id}
                        className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/50 cursor-pointer transition-all"
                        onClick={() => handleSelectLead(lead)}
                      >
                        <p className="font-medium text-foreground">{lead.nome_completo || lead.nome_whatsapp || 'Sem nome'}</p>
                        <p className="text-sm text-muted-foreground font-mono">{lead.numero}</p>
                        {lead.qualificacao && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full mt-2 inline-flex items-center gap-1.5"
                            style={{ 
                              backgroundColor: qualColor ? `${qualColor}20` : 'hsl(var(--muted))',
                              color: qualColor || 'hsl(var(--muted-foreground))'
                            }}
                          >
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: qualColor || 'hsl(var(--muted-foreground))' }}
                            />
                            {lead.qualificacao}
                          </span>
                        )}
                      </div>
                    );
                  })}
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
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 text-primary">
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

                <PaymentFields data={saleData} setData={setSaleData} />
                
                <ProductSelect 
                  value={saleData.produto_proposta} 
                  onChange={(v) => setSaleData({ ...saleData, produto_proposta: v })} 
                />

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
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 text-primary">
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

                <PaymentFields 
                  data={formData as typeof saleData} 
                  setData={(d) => setFormData({ ...formData, ...d })} 
                />

                <ProductSelect 
                  value={formData.produto_proposta} 
                  onChange={(v) => setFormData({ ...formData, produto_proposta: v })} 
                />

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
