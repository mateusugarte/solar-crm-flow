import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, FileText, Send, CheckCircle, XCircle, Clock, AlertTriangle, 
  Plus, X, ArrowLeft, Upload, File, Trash2, Phone, Bell, ShoppingCart
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { parse, differenceInHours, differenceInDays } from 'date-fns';

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
  prazo_instalacao: string | null;
  info_proposta: string | null;
  pdf_url: string | null;
  criado_em: string | null;
  ultima_mensagem: string | null;
  motivo_rejeicao: string | null;
}

interface Product {
  id: string;
  modelo: string | null;
  preco_por_placa: string | null;
}

export default function Propostas() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'cobranca'>('create');
  const [availableLeads, setAvailableLeads] = useState<Lead[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    
    const [leadsRes, productsRes, availableRes] = await Promise.all([
      supabase.from('usuarios').select('*').order('criado_em', { ascending: false }),
      supabase.from('placas_solares').select('id, modelo, preco_por_placa').eq('status', 'disponivel'),
      supabase.from('usuarios').select('*').not('qualificacao', 'in', '("Proposta Enviada","Venda Concluida","Proposta Rejeitada")').order('nome_completo')
    ]);

    if (!leadsRes.error && leadsRes.data) setLeads(leadsRes.data);
    if (!productsRes.error && productsRes.data) setProducts(productsRes.data);
    if (!availableRes.error && availableRes.data) setAvailableLeads(availableRes.data);
    
    setLoading(false);
  };

  // Filter proposals
  const propostas = useMemo(() => {
    return leads.filter(l => 
      ['Elaborando Proposta', 'Proposta Enviada'].some(
        q => l.qualificacao?.toLowerCase() === q.toLowerCase()
      )
    );
  }, [leads]);

  const propostasEnviadas = useMemo(() => {
    return leads.filter(l => l.qualificacao?.toLowerCase() === 'proposta enviada');
  }, [leads]);

  const vendasConcluidas = useMemo(() => {
    return leads.filter(l => l.qualificacao?.toLowerCase() === 'venda concluida');
  }, [leads]);

  const propostasRejeitadas = useMemo(() => {
    return leads.filter(l => l.qualificacao?.toLowerCase() === 'proposta rejeitada');
  }, [leads]);

  // Proposals without response (more than 24h without answer)
  const semResposta = useMemo(() => {
    return propostasEnviadas.filter(lead => {
      if (!lead.ultima_mensagem) return true;
      try {
        const date = parse(lead.ultima_mensagem, 'dd-MM-yyyy HH:mm', new Date());
        const hours = differenceInHours(new Date(), date);
        return hours > 24;
      } catch {
        return true;
      }
    });
  }, [propostasEnviadas]);

  const getUrgencyLevel = (lead: Lead): { level: string; color: string; text: string } => {
    if (!lead.ultima_mensagem) return { level: 'critical', color: 'text-red-500', text: 'Sem registro' };
    try {
      const date = parse(lead.ultima_mensagem, 'dd-MM-yyyy HH:mm', new Date());
      const days = differenceInDays(new Date(), date);
      if (days >= 5) return { level: 'critical', color: 'text-red-500', text: `${days} dias` };
      if (days >= 3) return { level: 'high', color: 'text-orange-500', text: `${days} dias` };
      if (days >= 1) return { level: 'medium', color: 'text-yellow-500', text: `${days} dia(s)` };
      return { level: 'low', color: 'text-green-500', text: 'Recente' };
    } catch {
      return { level: 'critical', color: 'text-red-500', text: 'Data inválida' };
    }
  };

  const stats = [
    { title: 'Propostas Enviadas', value: propostasEnviadas.length, icon: Send },
    { title: 'Vendas Concluídas', value: vendasConcluidas.length, icon: CheckCircle },
    { title: 'Propostas Rejeitadas', value: propostasRejeitadas.length, icon: XCircle },
    { title: 'Sem Resposta', value: semResposta.length, icon: AlertTriangle },
  ];

  const openCreateDrawer = () => {
    setSelectedLead(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEditDrawer = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const openCobrancaDrawer = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerMode('cobranca');
    setDrawerOpen(true);
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
      <div className="min-h-screen flex w-full bg-background animated-bg">
        <AppSidebar />
        <main className="flex-1 overflow-auto relative z-10">
          <DashboardHeader />
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Propostas</h1>
                <p className="text-muted-foreground">Gerenciamento de propostas enviadas</p>
              </div>
              <Button onClick={openCreateDrawer} className="gap-2 bg-primary text-primary-foreground">
                <Plus className="w-4 h-4" /> Nova Proposta
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <Card key={stat.title} className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <stat.icon className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="enviadas" className="space-y-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="enviadas" className="gap-2 data-[state=active]:bg-background">
                  <Send className="w-4 h-4 text-primary" /> Enviadas ({propostasEnviadas.length})
                </TabsTrigger>
                <TabsTrigger value="sem-resposta" className="gap-2 data-[state=active]:bg-background">
                  <AlertTriangle className="w-4 h-4 text-primary" /> Sem Resposta ({semResposta.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="enviadas">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-medium">
                      <Send className="w-5 h-5 text-primary" />
                      Propostas Enviadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : propostasEnviadas.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Nenhuma proposta enviada</p>
                    ) : (
                      <div className="space-y-3">
                        {propostasEnviadas.map(lead => (
                          <div 
                            key={lead.id} 
                            className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{lead.nome_completo || lead.nome_whatsapp || 'Sem nome'}</p>
                              <p className="text-sm text-muted-foreground font-mono">{lead.numero}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {lead.valor_proposta && (
                                  <Badge variant="outline" className="border-primary/50 text-primary">
                                    R$ {lead.valor_proposta}
                                  </Badge>
                                )}
                                {lead.produto_proposta && (
                                  <span className="text-xs text-muted-foreground">{lead.produto_proposta}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDrawer(lead)}>
                                <FileText className="w-4 h-4 text-primary" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => openCobrancaDrawer(lead)}>
                                <Bell className="w-4 h-4 text-primary" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sem-resposta">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-medium text-orange-500">
                      <AlertTriangle className="w-5 h-5" />
                      Propostas Sem Resposta - Urgência de Cobrança
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Propostas que precisam de follow-up para obter retorno do cliente
                    </p>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : semResposta.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Todas as propostas estão em dia!</p>
                    ) : (
                      <div className="space-y-3">
                        {semResposta.map(lead => {
                          const urgency = getUrgencyLevel(lead);
                          return (
                            <div 
                              key={lead.id} 
                              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-foreground">{lead.nome_completo || lead.nome_whatsapp || 'Sem nome'}</p>
                                  <Badge variant="outline" className={cn("border-current", urgency.color)}>
                                    <Clock className="w-3 h-3 mr-1" />
                                    {urgency.text}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground font-mono">{lead.numero}</p>
                                {lead.valor_proposta && (
                                  <Badge variant="outline" className="mt-1 border-primary/50 text-primary">
                                    R$ {lead.valor_proposta}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => openCobrancaDrawer(lead)}
                                  className="gap-1 border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                                >
                                  <Bell className="w-4 h-4" />
                                  Cobrar
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Proposal Drawer */}
        <ProposalDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          lead={selectedLead}
          mode={drawerMode}
          products={products}
          availableLeads={availableLeads}
          onSuccess={fetchData}
        />
      </div>
    </SidebarProvider>
  );
}

// Proposal Drawer Component
interface ProposalDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  mode: 'create' | 'edit' | 'cobranca';
  products: Product[];
  availableLeads: Lead[];
  onSuccess: () => void;
}

function ProposalDrawer({ open, onOpenChange, lead, mode, products, availableLeads, onSuccess }: ProposalDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [step, setStep] = useState<'select' | 'form'>('select');
  
  const [formData, setFormData] = useState({
    valor_proposta: '',
    forma_pagamento: '',
    produto_proposta: '',
    prazo_instalacao: '',
    info_proposta: '',
    pdf_url: '',
    parcelas: '',
    valor_parcela: '',
    instituicao_financiamento: '',
  });

  const [cobrancaData, setCobrancaData] = useState({
    observacao: '',
    quantidade_cobrancas: 1,
  });

  useEffect(() => {
    if (lead && (mode === 'edit' || mode === 'cobranca')) {
      setFormData({
        valor_proposta: lead.valor_proposta || '',
        forma_pagamento: lead.forma_pagamento || '',
        produto_proposta: lead.produto_proposta || '',
        prazo_instalacao: lead.prazo_instalacao || '',
        info_proposta: lead.info_proposta || '',
        pdf_url: lead.pdf_url || '',
        parcelas: '',
        valor_parcela: '',
        instituicao_financiamento: '',
      });
      setStep('form');
    } else {
      setStep('select');
    }
  }, [lead, mode]);

  const filteredLeads = useMemo(() => {
    if (!searchTerm) return availableLeads;
    const term = searchTerm.toLowerCase();
    return availableLeads.filter(l =>
      l.nome_completo?.toLowerCase().includes(term) ||
      l.numero?.includes(term) ||
      l.nome_whatsapp?.toLowerCase().includes(term)
    );
  }, [availableLeads, searchTerm]);

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setStep('form');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({ title: 'Erro', description: 'Apenas arquivos PDF são permitidos', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const leadId = lead?.id || selectedLeadId;
    const fileName = `${leadId}-${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('propostas')
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: 'Erro', description: 'Falha ao fazer upload', variant: 'destructive' });
    } else {
      const { data: { publicUrl } } = supabase.storage.from('propostas').getPublicUrl(fileName);
      setFormData({ ...formData, pdf_url: publicUrl });
      toast({ title: 'Sucesso', description: 'PDF anexado com sucesso' });
    }
    setUploading(false);
  };

  const handleRemovePdf = async () => {
    if (formData.pdf_url) {
      const fileName = formData.pdf_url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('propostas').remove([fileName]);
      }
      setFormData({ ...formData, pdf_url: '' });
    }
  };

  const handleSaveProposal = async () => {
    setSaving(true);
    const leadId = lead?.id || selectedLeadId;

    let info = formData.info_proposta || '';
    if (formData.forma_pagamento === 'Cartao' || formData.forma_pagamento === 'Financiamento') {
      const details = [];
      if (formData.parcelas) details.push(`Parcelas: ${formData.parcelas}x`);
      if (formData.valor_parcela) details.push(`Valor parcela: R$ ${formData.valor_parcela}`);
      if (formData.instituicao_financiamento) details.push(`Instituição: ${formData.instituicao_financiamento}`);
      if (details.length > 0) info = info ? `${info}\n\n${details.join('\n')}` : details.join('\n');
    }

    const { error } = await supabase
      .from('usuarios')
      .update({
        qualificacao: 'Proposta Enviada',
        valor_proposta: formData.valor_proposta,
        forma_pagamento: formData.forma_pagamento,
        produto_proposta: formData.produto_proposta,
        prazo_instalacao: formData.prazo_instalacao,
        info_proposta: info,
        pdf_url: formData.pdf_url,
      })
      .eq('id', leadId);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar proposta', variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Proposta salva com sucesso!' });
      onSuccess();
      resetAndClose();
    }
    setSaving(false);
  };

  const handleCobranca = async () => {
    if (!lead) return;
    setSaving(true);

    const now = new Date();
    const timestamp = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const currentInfo = lead.info_proposta || '';
    const cobrancaLog = `\n\n--- Cobrança ${cobrancaData.quantidade_cobrancas}ª (${timestamp}) ---\n${cobrancaData.observacao}`;
    const newInfo = currentInfo + cobrancaLog;

    const { error } = await supabase
      .from('usuarios')
      .update({
        info_proposta: newInfo,
        ultima_mensagem: timestamp,
      })
      .eq('id', lead.id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao registrar cobrança', variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Cobrança registrada!' });
      onSuccess();
      resetAndClose();
    }
    setSaving(false);
  };

  const handleMoveToRejected = async () => {
    if (!lead) return;
    setSaving(true);

    const { error } = await supabase
      .from('usuarios')
      .update({ qualificacao: 'Proposta Rejeitada' })
      .eq('id', lead.id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao mover proposta', variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Proposta marcada como rejeitada' });
      onSuccess();
      resetAndClose();
    }
    setSaving(false);
  };

  const handleRegisterSale = async () => {
    if (!lead) return;
    setSaving(true);

    const { error } = await supabase
      .from('usuarios')
      .update({ qualificacao: 'Venda Concluida' })
      .eq('id', lead.id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao registrar venda', variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Venda registrada com sucesso!' });
      onSuccess();
      resetAndClose();
    }
    setSaving(false);
  };

  const resetAndClose = () => {
    onOpenChange(false);
    setStep('select');
    setSelectedLeadId('');
    setSearchTerm('');
    setFormData({
      valor_proposta: '',
      forma_pagamento: '',
      produto_proposta: '',
      prazo_instalacao: '',
      info_proposta: '',
      pdf_url: '',
      parcelas: '',
      valor_parcela: '',
      instituicao_financiamento: '',
    });
    setCobrancaData({ observacao: '', quantidade_cobrancas: 1 });
  };

  const goBack = () => {
    if (mode === 'create' && step === 'form') {
      setStep('select');
    } else {
      resetAndClose();
    }
  };

  const selectedLeadData = lead || availableLeads.find(l => l.id === selectedLeadId);

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
            <h2 className="text-xl font-display font-bold text-foreground">
              {mode === 'create' ? 'Nova Proposta' : mode === 'cobranca' ? 'Registrar Cobrança' : 'Editar Proposta'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={resetAndClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Select Lead Step (only for create mode) */}
          {mode === 'create' && step === 'select' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">Selecione o lead para enviar a proposta:</p>
              
              <Input
                placeholder="Buscar por nome ou número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-muted/50"
              />

              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-2 pr-2">
                  {filteredLeads.map(l => (
                    <div
                      key={l.id}
                      className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/50 cursor-pointer transition-all"
                      onClick={() => handleSelectLead(l.id)}
                    >
                      <p className="font-medium text-foreground">{l.nome_completo || l.nome_whatsapp || 'Sem nome'}</p>
                      <p className="text-sm text-muted-foreground font-mono">{l.numero}</p>
                      {l.qualificacao && (
                        <Badge variant="outline" className="mt-1">{l.qualificacao}</Badge>
                      )}
                    </div>
                  ))}
                  {filteredLeads.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhum lead disponível</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Form Step */}
          {(step === 'form' || mode !== 'create') && mode !== 'cobranca' && (
            <div className="space-y-4">
              {mode === 'create' && (
                <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 text-primary">
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </Button>
              )}

              {selectedLeadData && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="font-semibold text-foreground">{selectedLeadData.nome_completo || selectedLeadData.nome_whatsapp}</p>
                  <p className="text-sm text-muted-foreground font-mono">{selectedLeadData.numero}</p>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <h3 className="font-semibold text-foreground border-b border-border pb-2">Dados da Proposta</h3>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Valor da Proposta (R$)</Label>
                  <Input
                    value={formData.valor_proposta}
                    onChange={(e) => setFormData({ ...formData, valor_proposta: e.target.value })}
                    placeholder="Ex: 45.000,00"
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Forma de Pagamento</Label>
                  <Select
                    value={formData.forma_pagamento}
                    onValueChange={(v) => setFormData({ ...formData, forma_pagamento: v, parcelas: '', valor_parcela: '', instituicao_financiamento: '' })}
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

                {formData.forma_pagamento === 'Cartao' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Nº de Parcelas</Label>
                      <Select value={formData.parcelas} onValueChange={(v) => setFormData({ ...formData, parcelas: v })}>
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
                        value={formData.valor_parcela}
                        onChange={(e) => setFormData({ ...formData, valor_parcela: e.target.value })}
                        placeholder="R$ 0,00"
                        className="bg-muted/50 border-border/50"
                      />
                    </div>
                  </div>
                )}

                {formData.forma_pagamento === 'Financiamento' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Instituição de Financiamento</Label>
                      <Input
                        value={formData.instituicao_financiamento}
                        onChange={(e) => setFormData({ ...formData, instituicao_financiamento: e.target.value })}
                        placeholder="Ex: BV, Santander, Caixa..."
                        className="bg-muted/50 border-border/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Nº de Parcelas</Label>
                        <Select value={formData.parcelas} onValueChange={(v) => setFormData({ ...formData, parcelas: v })}>
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
                          value={formData.valor_parcela}
                          onChange={(e) => setFormData({ ...formData, valor_parcela: e.target.value })}
                          placeholder="R$ 0,00"
                          className="bg-muted/50 border-border/50"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Produto</Label>
                  <Select value={formData.produto_proposta} onValueChange={(v) => setFormData({ ...formData, produto_proposta: v })}>
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

                {/* PDF Upload */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Anexar PDF da Proposta</Label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload"
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
                      <Button variant="ghost" size="icon" onClick={handleRemovePdf} className="h-8 w-8 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('pdf-upload')?.click()}
                      disabled={uploading}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2 text-primary" />
                      {uploading ? 'Enviando...' : 'Selecionar PDF'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cobrança Mode */}
          {mode === 'cobranca' && lead && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <p className="font-semibold text-foreground">{lead.nome_completo || lead.nome_whatsapp}</p>
                <p className="text-sm text-muted-foreground font-mono">{lead.numero}</p>
                {lead.valor_proposta && (
                  <Badge variant="outline" className="mt-2 border-primary/50 text-primary">
                    R$ {lead.valor_proposta}
                  </Badge>
                )}
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Registrar Cobrança
                </h3>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Número da Cobrança</Label>
                  <Select 
                    value={String(cobrancaData.quantidade_cobrancas)} 
                    onValueChange={(v) => setCobrancaData({ ...cobrancaData, quantidade_cobrancas: parseInt(v) })}
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <SelectItem key={n} value={String(n)}>{n}ª cobrança</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Observação da Cobrança</Label>
                  <Textarea
                    value={cobrancaData.observacao}
                    onChange={(e) => setCobrancaData({ ...cobrancaData, observacao: e.target.value })}
                    placeholder="Ex: Ligação realizada, cliente pediu para retornar amanhã..."
                    className="bg-muted/50 border-border/50 min-h-[100px]"
                  />
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Ou mover para:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={handleMoveToRejected}
                      disabled={saving}
                      className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRegisterSale}
                      disabled={saving}
                      className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Venda
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {((mode === 'create' && step === 'form') || mode === 'edit') && (
          <div className="p-6 border-t border-border">
            <Button 
              onClick={handleSaveProposal}
              disabled={saving}
              className="w-full gradient-solar text-primary-foreground font-semibold"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {mode === 'create' ? 'Enviar Proposta' : 'Salvar Proposta'}
            </Button>
          </div>
        )}

        {mode === 'cobranca' && (
          <div className="p-6 border-t border-border">
            <Button 
              onClick={handleCobranca}
              disabled={saving || !cobrancaData.observacao}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bell className="w-4 h-4 mr-2" />}
              Registrar Cobrança
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
