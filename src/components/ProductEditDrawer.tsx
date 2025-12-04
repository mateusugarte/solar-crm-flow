import { useState, useEffect } from 'react';
import { SolarPanel } from '@/pages/Products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Zap, Ruler, Shield, Clock, DollarSign, Package, Settings2, Trash2, Plus, ToggleLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductEditDrawerProps {
  product: SolarPanel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (product: SolarPanel) => void;
  onDelete?: (productId: string) => void;
  isNew?: boolean;
}

export function ProductEditDrawer({ product, open, onOpenChange, onUpdate, onDelete, isNew = false }: ProductEditDrawerProps) {
  const [formData, setFormData] = useState<SolarPanel | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    }
  }, [product]);

  if (!product || !formData) return null;

  const handleSave = () => {
    if (formData) {
      onUpdate(formData);
    }
  };

  const handleDelete = () => {
    if (onDelete && product.id) {
      onDelete(product.id);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => onOpenChange(false)}
      />
      
      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-lg bg-card border-l border-border z-50 transform transition-transform duration-500 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-amber-500/10 to-transparent">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
                {isNew ? <Plus className="w-6 h-6 text-amber-400" /> : <Settings2 className="w-6 h-6 text-amber-400" />}
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  {isNew ? 'Novo Produto' : 'Editar Produto'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isNew ? 'Adicione um novo produto ao catálogo' : 'Atualize as informações do produto'}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status Section */}
            <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ToggleLeft className="w-4 h-4 text-amber-400" />
                Status do Produto
              </h3>
              
              <div className="space-y-2">
                <Label className="text-muted-foreground">Disponibilidade</Label>
                <Select
                  value={formData.status || 'disponivel'}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-background/50 border-border/50 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="indisponivel">Indisponível</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Model Section */}
            <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                Informações Básicas
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Modelo</Label>
                  <Input
                    value={formData.modelo || ''}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="bg-background/50 border-border/50 h-11"
                    placeholder="Ex: Painel Solar 550W"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Especificações</Label>
                  <Textarea
                    value={formData.especs || ''}
                    onChange={(e) => setFormData({ ...formData, especs: e.target.value })}
                    className="bg-background/50 border-border/50 min-h-[100px] resize-none"
                    placeholder="Descreva as especificações técnicas..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Modelo de Instalação</Label>
                  <Input
                    value={formData.modelo_instalacao || ''}
                    onChange={(e) => setFormData({ ...formData, modelo_instalacao: e.target.value })}
                    className="bg-background/50 border-border/50 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Aceita Financiamento</Label>
                  <Select
                    value={formData.aceita_financiamento || 'Não'}
                    onValueChange={(value) => setFormData({ ...formData, aceita_financiamento: value })}
                  >
                    <SelectTrigger className="bg-background/50 border-border/50 h-11">
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

            {/* Specs Section */}
            <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Especificações Técnicas
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="w-3 h-3" /> Eficiência
                  </Label>
                  <Input
                    value={formData.eficiencia || ''}
                    onChange={(e) => setFormData({ ...formData, eficiencia: e.target.value })}
                    className="bg-background/50 border-border/50 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Ruler className="w-3 h-3" /> Dimensão
                  </Label>
                  <Input
                    value={formData.dimensao || ''}
                    onChange={(e) => setFormData({ ...formData, dimensao: e.target.value })}
                    className="bg-background/50 border-border/50 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="w-3 h-3" /> Garantia
                  </Label>
                  <Input
                    value={formData.garantia || ''}
                    onChange={(e) => setFormData({ ...formData, garantia: e.target.value })}
                    className="bg-background/50 border-border/50 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3 h-3" /> Prazo
                  </Label>
                  <Input
                    value={formData.prazo || ''}
                    onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
                    className="bg-background/50 border-border/50 h-11"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Preços
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Preço por Placa</Label>
                  <Input
                    value={formData.preco_por_placa || ''}
                    onChange={(e) => setFormData({ ...formData, preco_por_placa: e.target.value })}
                    className="bg-background/50 border-amber-500/30 h-11 text-lg font-semibold"
                    placeholder="R$ 0,00"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Pacote 5x</Label>
                    <Input
                      value={formData.pacote_5_placas || ''}
                      onChange={(e) => setFormData({ ...formData, pacote_5_placas: e.target.value })}
                      className="bg-background/50 border-border/50 h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Pacote 10x</Label>
                    <Input
                      value={formData.pacote_10_placas || ''}
                      onChange={(e) => setFormData({ ...formData, pacote_10_placas: e.target.value })}
                      className="bg-background/50 border-border/50 h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Pacote 20x</Label>
                    <Input
                      value={formData.pacote_20_placas || ''}
                      onChange={(e) => setFormData({ ...formData, pacote_20_placas: e.target.value })}
                      className="bg-background/50 border-border/50 h-10 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-card space-y-3">
            <Button 
              onClick={handleSave}
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25"
            >
              <Save className="w-5 h-5 mr-2" />
              {isNew ? 'Criar Produto' : 'Salvar Alterações'}
            </Button>
            
            {!isNew && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="w-full h-12 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Excluir Produto
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. O produto será removido permanentemente do catálogo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </>
  );
}