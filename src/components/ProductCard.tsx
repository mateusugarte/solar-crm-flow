import { SolarPanel } from '@/pages/Products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, Zap, Ruler, Shield, Clock, Edit } from 'lucide-react';

interface ProductCardProps {
  product: SolarPanel;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card 
      className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:shadow-glow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-solar">
              <Sun className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-display">{product.modelo || 'Sem modelo'}</CardTitle>
              {product.aceita_financiamento === 'Sim' && (
                <Badge variant="secondary" className="mt-1 bg-success/20 text-success border-0">
                  Aceita Financiamento
                </Badge>
              )}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            <span>{product.eficiencia || '-'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Ruler className="w-4 h-4 text-secondary" />
            <span>{product.dimensao || '-'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4 text-accent" />
            <span>{product.garantia || '-'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 text-warning" />
            <span>{product.prazo || '-'}</span>
          </div>
        </div>

        {product.especs && (
          <p className="text-sm text-muted-foreground line-clamp-2">{product.especs}</p>
        )}

        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Por placa</span>
            <span className="text-lg font-display font-bold text-primary">
              {product.preco_por_placa || '-'}
            </span>
          </div>
        </div>

        {(product.pacote_5_placas || product.pacote_10_placas || product.pacote_20_placas) && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pacotes</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {product.pacote_5_placas && (
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="font-medium">5 placas</p>
                  <p className="text-muted-foreground">{product.pacote_5_placas}</p>
                </div>
              )}
              {product.pacote_10_placas && (
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="font-medium">10 placas</p>
                  <p className="text-muted-foreground">{product.pacote_10_placas}</p>
                </div>
              )}
              {product.pacote_20_placas && (
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="font-medium">20 placas</p>
                  <p className="text-muted-foreground">{product.pacote_20_placas}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
