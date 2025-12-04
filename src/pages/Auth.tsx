import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Zap, ArrowRight, Loader2, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Erro', description: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast({ title: 'Erro ao entrar', description: 'Credenciais inválidas. Verifique seu email e senha.', variant: 'destructive' });
    } else {
      toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso' });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-dark relative overflow-hidden cyber-grid">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full gradient-solar blur-[100px] opacity-30" />
          <div className="absolute bottom-32 right-20 w-96 h-96 rounded-full gradient-cyber blur-[100px] opacity-20" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full gradient-purple blur-[80px] opacity-20" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl gradient-solar shadow-glow animate-pulse-glow">
              <Sun className="w-8 h-8 text-primary-foreground" />
            </div>
            <span className="text-3xl font-display font-bold text-white">GetMore Solar</span>
          </div>
          <h1 className="text-5xl font-display font-bold text-white mb-6 leading-tight">
            CRM Inteligente para
            <span className="text-gradient-solar block">Energia Solar</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-md mb-8">
            Sistema de gestão completo para acompanhar leads, propostas e 
            catálogo de placas solares com IA integrada.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="p-2 rounded-lg bg-primary/10 neon-border">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span>Kanban Inteligente</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Zap className="w-5 h-5 text-secondary" />
              </div>
              <span>WhatsApp Integrado</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="p-2 rounded-lg bg-accent/10">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <span>Qualificação com IA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="p-2 rounded-lg gradient-solar">
              <Sun className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-bold">GetMore Solar</span>
          </div>

          <Card className="shadow-soft border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto p-3 rounded-full bg-muted/50 w-fit mb-2">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-display">Acessar Sistema</CardTitle>
              <CardDescription>
                Entre com suas credenciais para acessar o painel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-muted/50 border-border/50"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 gradient-solar text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-glow"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Entrar <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-6">
                Apenas usuários autorizados podem acessar este sistema.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
