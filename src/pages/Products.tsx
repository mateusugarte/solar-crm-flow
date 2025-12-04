import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { ProductCard } from '@/components/ProductCard';
import { ProductEditDrawer } from '@/components/ProductEditDrawer';
import { Loader2, Package, Search, SlidersHorizontal } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface SolarPanel {
  id: string;
  modelo: string | null;
  especs: string | null;
  eficiencia: string | null;
  dimensao: string | null;
  garantia: string | null;
  aceita_financiamento: string | null;
  preco_por_placa: string | null;
  pacote_5_placas: string | null;
  pacote_10_placas: string | null;
  pacote_20_placas: string | null;
  modelo_instalacao: string | null;
  prazo: string | null;
}

export default function Products() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<SolarPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<SolarPanel | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('placas_solares')
      .select('*');
    
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleProductClick = (product: SolarPanel) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
  };

  const handleUpdateProduct = async (updatedProduct: SolarPanel) => {
    const { error } = await supabase
      .from('placas_solares')
      .update({
        modelo: updatedProduct.modelo,
        especs: updatedProduct.especs,
        eficiencia: updatedProduct.eficiencia,
        dimensao: updatedProduct.dimensao,
        garantia: updatedProduct.garantia,
        aceita_financiamento: updatedProduct.aceita_financiamento,
        preco_por_placa: updatedProduct.preco_por_placa,
        pacote_5_placas: updatedProduct.pacote_5_placas,
        pacote_10_placas: updatedProduct.pacote_10_placas,
        pacote_20_placas: updatedProduct.pacote_20_placas,
        modelo_instalacao: updatedProduct.modelo_instalacao,
        prazo: updatedProduct.prazo,
      })
      .eq('id', updatedProduct.id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar produto', variant: 'destructive' });
    } else {
      setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      setSelectedProduct(updatedProduct);
      toast({ title: 'Sucesso', description: 'Produto atualizado com sucesso' });
    }
  };

  const filteredProducts = products.filter(p => 
    p.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.especs?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <DashboardHeader />
          
          <div className="p-8 animate-fade-in">
            {/* Hero Section */}
            <div className="relative mb-10 p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
                    <Package className="w-7 h-7 text-amber-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">
                      Catálogo de Produtos
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Gerencie suas placas solares e pacotes
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por modelo ou especificações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 bg-background/50 border-border/50 rounded-xl"
                    />
                  </div>
                  <Button variant="outline" className="h-12 px-6 border-border/50 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400">
                    <SlidersHorizontal className="w-5 h-5 mr-2" />
                    Filtros
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-card/50 border border-border/50">
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold text-foreground mt-1">{products.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-card/50 border border-border/50">
                <p className="text-sm text-muted-foreground">Com Financiamento</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">
                  {products.filter(p => p.aceita_financiamento === 'Sim').length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card/50 border border-border/50">
                <p className="text-sm text-muted-foreground">Resultados</p>
                <p className="text-2xl font-bold text-foreground mt-1">{filteredProducts.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-card/50 border border-border/50">
                <p className="text-sm text-muted-foreground">Última Atualização</p>
                <p className="text-lg font-semibold text-foreground mt-1">Hoje</p>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-amber-400 mb-4" />
                <p className="text-muted-foreground">Carregando produtos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/30 flex items-center justify-center">
                  <Package className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {searchTerm ? 'Nenhum produto encontrado' : 'Catálogo vazio'}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchTerm 
                    ? 'Tente buscar por outro termo ou limpe o filtro'
                    : 'Adicione placas solares ao seu catálogo para começar'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <div 
                    key={product.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProductCard 
                      product={product}
                      onClick={() => handleProductClick(product)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <ProductEditDrawer
          product={selectedProduct}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onUpdate={handleUpdateProduct}
        />
      </div>
    </SidebarProvider>
  );
}