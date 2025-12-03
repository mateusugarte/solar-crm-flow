import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sun, Zap, Users, BarChart3, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Users,
      title: 'Gestão de Leads',
      description: 'Organize e acompanhe todos os seus contatos em um só lugar',
    },
    {
      icon: BarChart3,
      title: 'Dashboard Inteligente',
      description: 'Visualize métricas e insights em tempo real',
    },
    {
      icon: Sun,
      title: 'Catálogo de Produtos',
      description: 'Gerencie seu portfólio de placas solares',
    },
    {
      icon: Zap,
      title: 'WhatsApp Integrado',
      description: 'Histórico de conversas e qualificação automática',
    },
  ];

  const benefits = [
    'Aumente suas conversões em até 40%',
    'Economize tempo com automação',
    'Acompanhe toda a jornada do cliente',
    'Acesse de qualquer dispositivo',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-dark" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full gradient-solar blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full gradient-ocean blur-3xl" />
        </div>

        <nav className="relative z-10 container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl gradient-solar">
                <Sun className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-white">GetMore Solar</span>
            </div>
            <Link to="/auth">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Entrar
              </Button>
            </Link>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-6 pt-16 pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>CRM especializado em energia solar</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight animate-fade-in">
              Transforme leads em
              <span className="text-gradient-solar block mt-2">clientes satisfeitos</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto animate-fade-in">
              A plataforma completa para gerenciar suas vendas de energia solar. 
              Organize leads, acompanhe conversas e feche mais negócios.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link to="/auth">
                <Button size="lg" className="gradient-solar text-primary-foreground font-semibold h-12 px-8 hover:opacity-90 transition-opacity">
                  Começar gratuitamente
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Tudo que você precisa para <span className="text-gradient-solar">vender mais</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ferramentas poderosas para otimizar seu processo de vendas do início ao fim
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="border-0 shadow-soft hover:shadow-lg transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Por que escolher o <span className="text-gradient-solar">GetMore Solar?</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Desenvolvido especificamente para empresas de energia solar, 
                nosso CRM entende as particularidades do seu negócio.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li 
                    key={benefit} 
                    className="flex items-center gap-3 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-1 rounded-full bg-success/20">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 gradient-solar opacity-10 rounded-3xl blur-3xl" />
              <Card className="relative border-0 shadow-soft overflow-hidden">
                <div className="h-2 gradient-solar" />
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full gradient-solar flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-3xl font-display font-bold">1.500+</p>
                        <p className="text-muted-foreground text-sm">Leads gerenciados</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full gradient-ocean flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="text-3xl font-display font-bold">40%</p>
                        <p className="text-muted-foreground text-sm">Aumento em conversões</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
                        <Zap className="w-6 h-6 text-success-foreground" />
                      </div>
                      <div>
                        <p className="text-3xl font-display font-bold">5x</p>
                        <p className="text-muted-foreground text-sm">Mais produtividade</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full gradient-solar blur-3xl" />
        </div>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            Pronto para turbinar suas vendas?
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
            Comece agora e veja a diferença em seu processo de vendas de energia solar
          </p>
          <Link to="/auth">
            <Button size="lg" className="gradient-solar text-primary-foreground font-semibold h-12 px-8 hover:opacity-90 transition-opacity">
              Criar conta grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg gradient-solar">
                <Sun className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold">GetMore Solar</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GetMore Solar. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
