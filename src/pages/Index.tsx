import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, ArrowRight, Loader2, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

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
      toast({ title: 'Erro ao entrar', description: 'Credenciais inválidas', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background cyber-grid relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full gradient-solar blur-[120px] opacity-20" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full gradient-cyber blur-[100px] opacity-15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full gradient-purple blur-[80px] opacity-15" />
      </div>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md mx-4 border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-4 rounded-2xl gradient-solar shadow-glow mb-4 w-fit">
            <Sun className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-display font-bold">GetMore Solar</CardTitle>
          <CardDescription className="text-muted-foreground">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
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
              <Label htmlFor="password" className="text-foreground">Senha</Label>
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
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Acesso restrito a usuários autorizados</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
