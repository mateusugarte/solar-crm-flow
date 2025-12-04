import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { ProductCard } from '@/components/ProductCard';
import { ProductEditDrawer } from '@/components/ProductEditDrawer';
import { Loader2, Sun } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
          <div className="p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg gradient-solar shadow-glow">
                <Sun className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">Catálogo de Placas</h1>
                <p className="text-muted-foreground">Clique para editar produtos</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <Sun className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">Nenhum produto cadastrado</h3>
                <p className="text-sm text-muted-foreground/70">Adicione placas solares ao catálogo</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    onClick={() => handleProductClick(product)}
                  />
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
