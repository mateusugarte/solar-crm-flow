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
        "group relative border-border bg-card",
        "hover:border-primary/50",
        "transition-all duration-300 cursor-pointer",
        !isAvailable && "opacity-70"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* Status Badge */}
              <Badge 
                className={cn(
                  "border",
                  isAvailable 
                    ? "bg-primary/10 text-primary border-primary/30" 
                    : "bg-muted text-muted-foreground border-border"
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
              <Badge className="bg-muted text-muted-foreground border-border">
                <Boxes className="w-3 h-3 mr-1" />
                {quantidade} un.
              </Badge>
              {product.aceita_financiamento === 'Sim' && (
                <Badge className="bg-primary/10 text-primary border-primary/30">
                  Financiamento
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
              {product.modelo || 'Sem modelo'}
            </h3>
            {product.especs && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {product.especs}
              </p>
            )}
          </div>
          
          {/* Arrow Indicator */}
          <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-all duration-200">
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Zap className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Eficiência</p>
              <p className="text-sm font-medium text-foreground">{product.eficiencia || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Ruler className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Dimensão</p>
              <p className="text-sm font-medium text-foreground">{product.dimensao || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Shield className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Garantia</p>
              <p className="text-sm font-medium text-foreground">{product.garantia || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Prazo</p>
              <p className="text-sm font-medium text-foreground">{product.prazo || '-'}</p>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Preço por placa</p>
              <p className="text-xl font-semibold text-primary">
                {product.preco_por_placa || '-'}
              </p>
            </div>
            
            {/* Package Prices */}
            {(product.pacote_5_placas || product.pacote_10_placas || product.pacote_20_placas) && (
              <div className="flex gap-2">
                {product.pacote_5_placas && (
                  <div className="text-center px-3 py-2 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">5x</p>
                    <p className="text-xs font-medium text-foreground">{product.pacote_5_placas}</p>
                  </div>
                )}
                {product.pacote_10_placas && (
                  <div className="text-center px-3 py-2 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">10x</p>
                    <p className="text-xs font-medium text-foreground">{product.pacote_10_placas}</p>
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
