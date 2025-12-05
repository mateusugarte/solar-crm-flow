import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ShoppingCart, DollarSign, TrendingUp, FileCheck, UserPlus, Users, Search } from 'lucide-react';
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

export default function Vendas() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [registerMode, setRegisterMode] = useState<'select' | 'manual' | null>(null);
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

  // Sale data (used for both modes)
  const [saleData, setSaleData] = useState({
    valor_proposta: '',
    forma_pagamento: '',
    produto_proposta: '',
    prazo_instalacao: '',
    info_proposta: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('criado_em', { ascending: false });
    
    if (!error && data) {
      setLeads(data as Lead[]);
    }
    setLoading(false);
  };

  const stats = useMemo(() => {
    const vendasConcluidas = leads.filter(l => 
      l.qualificacao?.toLowerCase() === 'venda concluida'
    );
    const totalVendas = vendasConcluidas.length;
    const valorTotal = vendasConcluidas.reduce((acc, l) => {
      const valor = parseFloat(l.valor_proposta?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
      return acc + valor;
    }, 0);
    const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0;
    const propostasEnviadas = leads.filter(l => 
      l.qualificacao?.toLowerCase() === 'proposta enviada'
    ).length;

    return {
      totalVendas,
      valorTotal,
      ticketMedio,
      propostasEnviadas,
    };
  }, [leads]);

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

    if (registerMode === 'select' && selectedLead) {
      // Update existing lead to Venda Concluida
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
        fetchLeads();
        resetForm();
      }
    } else if (registerMode === 'manual') {
      // Create new lead with Venda Concluida status
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
        fetchLeads();
        resetForm();
      }
    }

    setSaving(false);
  };

  const resetForm = () => {
    setDialogOpen(false);
    setRegisterMode(null);
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background cyber-grid">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <DashboardHeader />
          <div className="p-6 space-y-6 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <ShoppingCart className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-display font-bold text-foreground">{stats.totalVendas}</p>
                  <p className="text-xs text-muted-foreground">Vendas Concluídas</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-2xl font-display font-bold text-foreground">
                    R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Valor Total</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-display font-bold text-foreground">
                    R$ {stats.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Ticket Médio</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <FileCheck className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-display font-bold text-foreground">{stats.propostasEnviadas}</p>
                  <p className="text-xs text-muted-foreground">Propostas Enviadas</p>
                </CardContent>
              </Card>
            </div>

            {/* Register Sale Button */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Registrar Venda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="w-full md:w-auto gradient-solar text-primary-foreground font-semibold">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Registrar Nova Venda
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Registrar Venda</DialogTitle>
                    </DialogHeader>

                    {!registerMode && (
                      <div className="space-y-4">
                        <p className="text-muted-foreground text-sm">Selecione como deseja registrar a venda:</p>
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2"
                            onClick={() => setRegisterMode('select')}
                          >
                            <Users className="w-6 h-6" />
                            <span>Usuário Existente</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2"
                            onClick={() => setRegisterMode('manual')}
                          >
                            <UserPlus className="w-6 h-6" />
                            <span>Cadastrar Manual</span>
                          </Button>
                        </div>
                      </div>
                    )}

                    {registerMode === 'select' && (
                      <div className="space-y-4">
                        <Button variant="ghost" size="sm" onClick={() => setRegisterMode(null)}>
                          ← Voltar
                        </Button>

                        {!selectedLead ? (
                          <>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                placeholder="Buscar por nome ou número..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                            <ScrollArea className="h-[300px]">
                              <div className="space-y-2">
                                {filteredLeads.map(lead => (
                                  <div
                                    key={lead.id}
                                    className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => handleSelectLead(lead)}
                                  >
                                    <p className="font-medium">{lead.nome_completo || lead.nome_whatsapp || 'Sem nome'}</p>
                                    <p className="text-sm text-muted-foreground">{lead.numero}</p>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </>
                        ) : (
                          <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="font-medium">{selectedLead.nome_completo || selectedLead.nome_whatsapp}</p>
                              <p className="text-sm text-muted-foreground">{selectedLead.numero}</p>
                            </div>

                            <div className="space-y-3">
                              <div className="space-y-1">
                                <Label>Valor da Venda (R$)</Label>
                                <Input
                                  value={saleData.valor_proposta}
                                  onChange={(e) => setSaleData({ ...saleData, valor_proposta: e.target.value })}
                                  placeholder="Ex: 45.000,00"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>Forma de Pagamento</Label>
                                <Select
                                  value={saleData.forma_pagamento}
                                  onValueChange={(v) => setSaleData({ ...saleData, forma_pagamento: v })}
                                >
                                  <SelectTrigger>
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
                              <div className="space-y-1">
                                <Label>Produto</Label>
                                <Input
                                  value={saleData.produto_proposta}
                                  onChange={(e) => setSaleData({ ...saleData, produto_proposta: e.target.value })}
                                  placeholder="Ex: Kit 10 Placas 550W"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>Prazo de Instalação</Label>
                                <Input
                                  value={saleData.prazo_instalacao}
                                  onChange={(e) => setSaleData({ ...saleData, prazo_instalacao: e.target.value })}
                                  placeholder="Ex: 15 dias úteis"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>Observações</Label>
                                <Textarea
                                  value={saleData.info_proposta}
                                  onChange={(e) => setSaleData({ ...saleData, info_proposta: e.target.value })}
                                  placeholder="Informações adicionais..."
                                />
                              </div>
                            </div>

                            <Button
                              className="w-full gradient-solar"
                              onClick={handleRegisterSale}
                              disabled={saving}
                            >
                              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                              Registrar Venda
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {registerMode === 'manual' && (
                      <ScrollArea className="max-h-[60vh]">
                        <div className="space-y-4 pr-4">
                          <Button variant="ghost" size="sm" onClick={() => setRegisterMode(null)}>
                            ← Voltar
                          </Button>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1 col-span-2">
                              <Label>Nome Completo *</Label>
                              <Input
                                value={formData.nome_completo}
                                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
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
                            <div className="space-y-1 col-span-2">
                              <Label>Renda</Label>
                              <Input
                                value={formData.renda}
                                onChange={(e) => setFormData({ ...formData, renda: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="border-t border-border pt-4 space-y-3">
                            <h4 className="font-semibold">Dados da Venda</h4>
                            <div className="space-y-1">
                              <Label>Valor da Venda (R$) *</Label>
                              <Input
                                value={formData.valor_proposta}
                                onChange={(e) => setFormData({ ...formData, valor_proposta: e.target.value })}
                                placeholder="Ex: 45.000,00"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Forma de Pagamento *</Label>
                              <Select
                                value={formData.forma_pagamento}
                                onValueChange={(v) => setFormData({ ...formData, forma_pagamento: v })}
                              >
                                <SelectTrigger>
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
                            <div className="space-y-1">
                              <Label>Produto *</Label>
                              <Input
                                value={formData.produto_proposta}
                                onChange={(e) => setFormData({ ...formData, produto_proposta: e.target.value })}
                                placeholder="Ex: Kit 10 Placas 550W"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Prazo de Instalação</Label>
                              <Input
                                value={formData.prazo_instalacao}
                                onChange={(e) => setFormData({ ...formData, prazo_instalacao: e.target.value })}
                                placeholder="Ex: 15 dias úteis"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Observações</Label>
                              <Textarea
                                value={formData.info_proposta}
                                onChange={(e) => setFormData({ ...formData, info_proposta: e.target.value })}
                                placeholder="Informações adicionais..."
                              />
                            </div>
                          </div>

                          <Button
                            className="w-full gradient-solar"
                            onClick={handleRegisterSale}
                            disabled={saving || !formData.nome_completo || !formData.numero || !formData.valor_proposta}
                          >
                            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                            Registrar Venda
                          </Button>
                        </div>
                      </ScrollArea>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Vendas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leads
                      .filter(l => l.qualificacao?.toLowerCase() === 'venda concluida')
                      .slice(0, 10)
                      .map(lead => (
                        <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <p className="font-medium">{lead.nome_completo || lead.nome_whatsapp || 'Sem nome'}</p>
                            <p className="text-sm text-muted-foreground">{lead.produto_proposta || 'Produto não informado'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-400">
                              R$ {lead.valor_proposta || '0'}
                            </p>
                            <p className="text-xs text-muted-foreground">{lead.forma_pagamento}</p>
                          </div>
                        </div>
                      ))}
                    {leads.filter(l => l.qualificacao?.toLowerCase() === 'venda concluida').length === 0 && (
                      <p className="text-center text-muted-foreground py-8">Nenhuma venda registrada ainda</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
