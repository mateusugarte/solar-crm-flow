import { SolarPanel } from '@/pages/Products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, Zap, Ruler, Shield, CreditCard, Package } from 'lucide-react';

interface ProductCardProps {
  product: SolarPanel;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="border-0 shadow-soft hover:shadow-lg transition-all duration-300 group overflow-hidden">
      <div className="h-2 gradient-solar" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Sun className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-display">{product.modelo || 'Modelo N/A'}</CardTitle>
              {product.modelo_instalacao && (
                <p className="text-xs text-muted-foreground">{product.modelo_instalacao}</p>
              )}
            </div>
          </div>
          {product.aceita_financiamento?.toLowerCase() === 'sim' && (
            <Badge variant="secondary" className="text-xs">
              <CreditCard className="w-3 h-3 mr-1" />
              Financiável
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {product.eficiencia && (
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Eficiência:</span>
              <span className="font-medium">{product.eficiencia}</span>
            </div>
          )}
          {product.dimensao && (
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-secondary" />
              <span className="text-muted-foreground">Dimensão:</span>
              <span className="font-medium">{product.dimensao}</span>
            </div>
          )}
          {product.garantia && (
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              <span className="text-muted-foreground">Garantia:</span>
              <span className="font-medium">{product.garantia}</span>
            </div>
          )}
          {product.prazo && (
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">Prazo:</span>
              <span className="font-medium">{product.prazo}</span>
            </div>
          )}
        </div>

        {product.especs && (
          <p className="text-sm text-muted-foreground line-clamp-2">{product.especs}</p>
        )}

        <div className="pt-3 border-t space-y-2">
          {product.preco_por_placa && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Por placa</span>
              <span className="font-display font-bold text-lg">{product.preco_por_placa}</span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {product.pacote_5_placas && (
              <div className="p-2 rounded-lg bg-muted text-center">
                <p className="text-muted-foreground">5 placas</p>
                <p className="font-semibold">{product.pacote_5_placas}</p>
              </div>
            )}
            {product.pacote_10_placas && (
              <div className="p-2 rounded-lg bg-muted text-center">
                <p className="text-muted-foreground">10 placas</p>
                <p className="font-semibold">{product.pacote_10_placas}</p>
              </div>
            )}
            {product.pacote_20_placas && (
              <div className="p-2 rounded-lg bg-muted text-center">
                <p className="text-muted-foreground">20 placas</p>
                <p className="font-semibold">{product.pacote_20_placas}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
