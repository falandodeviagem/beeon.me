import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Sparkles, Users, Trophy, Shield } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/10 to-primary/10 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <span className="text-4xl">🐝</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                BeeOn.me
              </h1>
              <p className="text-muted-foreground">Sua comunidade, seu jeito</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Conecte-se, Compartilhe, Cresça
            </h2>
            <p className="text-muted-foreground text-lg">
              Junte-se a comunidades incríveis, compartilhe conteúdo e ganhe recompensas enquanto interage.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Comunidades Exclusivas</h3>
                <p className="text-sm text-muted-foreground">
                  Participe de comunidades públicas ou crie sua própria comunidade paga
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Sistema de Gamificação</h3>
                <p className="text-sm text-muted-foreground">
                  Ganhe pontos, desbloqueie badges e suba no ranking
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Ambiente Seguro</h3>
                <p className="text-sm text-muted-foreground">
                  Sistema robusto de moderação e proteção da comunidade
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login card */}
        <Card className="shadow-2xl border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Bem-vindo!</CardTitle>
            <CardDescription className="text-center">
              Entre para começar sua jornada na BeeOn.me
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleLogin}
              size="lg"
              className="w-full gap-2 text-lg h-12"
            >
              <Sparkles className="w-5 h-5" />
              Entrar com Manus
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Rápido e seguro
                </span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Ao entrar, você concorda com nossos
              </p>
              <div className="flex justify-center gap-2 text-sm">
                <a href="#" className="text-primary hover:underline">
                  Termos de Uso
                </a>
                <span className="text-muted-foreground">e</span>
                <a href="#" className="text-primary hover:underline">
                  Política de Privacidade
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
