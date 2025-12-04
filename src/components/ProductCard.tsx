import { SolarPanel } from '@/pages/Products';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Ruler, Shield, Clock, ArrowRight, CheckCircle2, XCircle, Boxes } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: SolarPanel;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const isAvailable = product.status === 'disponivel';
  const quantidade = product.quantidade ?? 0;

  return (
    <Card 
      className={cn(
        "group relative border-border/50 bg-card/30 backdrop-blur-sm",
        "hover:border-amber-500/50 hover:bg-card/50",
        "transition-all duration-500 cursor-pointer overflow-hidden",
        !isAvailable && "opacity-70"
      )}
      onClick={onClick}
    >
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:via-amber-500/5 group-hover:to-transparent transition-all duration-500" />
      
      {/* Glow Effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/0 group-hover:bg-amber-500/20 rounded-full blur-3xl transition-all duration-700" />

      <CardContent className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* Status Badge */}
              <Badge 
                className={cn(
                  "border",
                  isAvailable 
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                    : "bg-red-500/20 text-red-400 border-red-500/30"
                )}
              >
                {isAvailable ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Disponível
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Indisponível
                  </>
                )}
              </Badge>
              {/* Quantity Badge */}
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Boxes className="w-3 h-3 mr-1" />
                {quantidade} un.
              </Badge>
              {product.aceita_financiamento === 'Sim' && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30">
                  Financiamento
                </Badge>
              )}
            </div>
            <h3 className="text-xl font-display font-bold text-foreground group-hover:text-amber-400 transition-colors">
              {product.modelo || 'Sem modelo'}
            </h3>
            {product.especs && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {product.especs}
              </p>
            )}
          </div>
          
          {/* Arrow Indicator */}
          <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-amber-500/20 transition-all duration-300 group-hover:translate-x-1">
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-amber-400 transition-colors" />
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Eficiência</p>
              <p className="text-sm font-medium text-foreground">{product.eficiencia || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
            <Ruler className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Dimensão</p>
              <p className="text-sm font-medium text-foreground">{product.dimensao || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Garantia</p>
              <p className="text-sm font-medium text-foreground">{product.garantia || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
            <Clock className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Prazo</p>
              <p className="text-sm font-medium text-foreground">{product.prazo || '-'}</p>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Preço por placa</p>
              <p className="text-2xl font-display font-bold text-amber-400">
                {product.preco_por_placa || '-'}
              </p>
            </div>
            
            {/* Package Prices */}
            {(product.pacote_5_placas || product.pacote_10_placas || product.pacote_20_placas) && (
              <div className="flex gap-2">
                {product.pacote_5_placas && (
                  <div className="text-center px-3 py-2 rounded-lg bg-muted/50 border border-border/30">
                    <p className="text-xs text-muted-foreground">5x</p>
                    <p className="text-xs font-semibold text-foreground">{product.pacote_5_placas}</p>
                  </div>
                )}
                {product.pacote_10_placas && (
                  <div className="text-center px-3 py-2 rounded-lg bg-muted/50 border border-border/30">
                    <p className="text-xs text-muted-foreground">10x</p>
                    <p className="text-xs font-semibold text-foreground">{product.pacote_10_placas}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}