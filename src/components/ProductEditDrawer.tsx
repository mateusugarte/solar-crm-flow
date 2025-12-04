import { useState, useEffect } from 'react';
import { SolarPanel } from '@/pages/Products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Sun, Zap, Ruler, Shield, Clock, DollarSign, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductEditDrawerProps {
  product: SolarPanel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (product: SolarPanel) => void;
}

export function ProductEditDrawer({ product, open, onOpenChange, onUpdate }: ProductEditDrawerProps) {
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
            <div className="p-2 rounded-lg gradient-solar">
              <Sun className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">Editar Produto</h2>
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
                <Sun className="w-4 h-4" /> Modelo
              </Label>
              <Input
                value={formData.modelo || ''}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                className="bg-muted/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                Especificações
              </Label>
              <Textarea
                value={formData.especs || ''}
                onChange={(e) => setFormData({ ...formData, especs: e.target.value })}
                className="bg-muted/50 border-border/50 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="w-4 h-4" /> Eficiência
                </Label>
                <Input
                  value={formData.eficiencia || ''}
                  onChange={(e) => setFormData({ ...formData, eficiencia: e.target.value })}
                  className="bg-muted/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Ruler className="w-4 h-4" /> Dimensão
                </Label>
                <Input
                  value={formData.dimensao || ''}
                  onChange={(e) => setFormData({ ...formData, dimensao: e.target.value })}
                  className="bg-muted/50 border-border/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4" /> Garantia
                </Label>
                <Input
                  value={formData.garantia || ''}
                  onChange={(e) => setFormData({ ...formData, garantia: e.target.value })}
                  className="bg-muted/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" /> Prazo
                </Label>
                <Input
                  value={formData.prazo || ''}
                  onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
                  className="bg-muted/50 border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Aceita Financiamento</Label>
              <Select
                value={formData.aceita_financiamento || 'Não'}
                onValueChange={(value) => setFormData({ ...formData, aceita_financiamento: value })}
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

            <div className="space-y-2">
              <Label className="text-muted-foreground">Modelo de Instalação</Label>
              <Input
                value={formData.modelo_instalacao || ''}
                onChange={(e) => setFormData({ ...formData, modelo_instalacao: e.target.value })}
                className="bg-muted/50 border-border/50"
              />
            </div>

            <div className="pt-4 border-t border-border/50">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" /> Preços
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Preço por Placa</Label>
                  <Input
                    value={formData.preco_por_placa || ''}
                    onChange={(e) => setFormData({ ...formData, preco_por_placa: e.target.value })}
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Package className="w-4 h-4" /> Pacote 5 Placas
                  </Label>
                  <Input
                    value={formData.pacote_5_placas || ''}
                    onChange={(e) => setFormData({ ...formData, pacote_5_placas: e.target.value })}
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Pacote 10 Placas</Label>
                  <Input
                    value={formData.pacote_10_placas || ''}
                    onChange={(e) => setFormData({ ...formData, pacote_10_placas: e.target.value })}
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Pacote 20 Placas</Label>
                  <Input
                    value={formData.pacote_20_placas || ''}
                    onChange={(e) => setFormData({ ...formData, pacote_20_placas: e.target.value })}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <Button 
            onClick={handleSave}
            className="w-full gradient-solar text-primary-foreground font-semibold shadow-glow"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
