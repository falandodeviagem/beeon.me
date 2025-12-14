import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Users, 
  Trophy, 
  UserPlus, 
  Shield, 
  DollarSign, 
  Bell, 
  Hash,
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

const steps = [
  {
    title: "Bem-vindo ao BeeOn.me! 🐝",
    description: "Sua nova rede social de comunidades vibrantes",
    icon: Users,
    content: (
      <div className="space-y-4">
        <p className="text-lg">
          O BeeOn.me é uma plataforma onde você pode se conectar com pessoas que compartilham seus interesses através de <strong>comunidades</strong>.
        </p>
        <div className="bg-primary/10 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">O que você pode fazer aqui:</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Participar de comunidades públicas e pagas</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Criar posts, comentar e reagir com emojis</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Ganhar pontos e badges por suas atividades</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Seguir outros usuários e enviar mensagens diretas</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "Comunidades",
    description: "Encontre seu lugar",
    icon: Users,
    content: (
      <div className="space-y-4">
        <p>
          As <strong>comunidades</strong> são o coração do BeeOn.me. Cada comunidade tem um tema específico e pode ser:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Gratuitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Acesso livre para todos. Perfeitas para começar e explorar a plataforma.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-500" />
                Pagas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Conteúdo premium e exclusivo. Requer assinatura mensal via Stripe.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
          <p className="text-sm">
            <strong>Dica:</strong> Explore a página de comunidades para encontrar tópicos do seu interesse!
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Gamificação",
    description: "Ganhe pontos e badges",
    icon: Trophy,
    content: (
      <div className="space-y-4">
        <p>
          Cada ação que você realiza no BeeOn.me te dá <strong>pontos de experiência</strong>:
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border p-3 rounded-lg">
            <div className="font-semibold text-primary">+10 pontos</div>
            <div className="text-sm text-muted-foreground">Criar um post</div>
          </div>
          <div className="bg-card border p-3 rounded-lg">
            <div className="font-semibold text-primary">+5 pontos</div>
            <div className="text-sm text-muted-foreground">Comentar</div>
          </div>
          <div className="bg-card border p-3 rounded-lg">
            <div className="font-semibold text-primary">+2 pontos</div>
            <div className="text-sm text-muted-foreground">Reagir a posts</div>
          </div>
          <div className="bg-card border p-3 rounded-lg">
            <div className="font-semibold text-primary">+20 pontos</div>
            <div className="text-sm text-muted-foreground">Entrar em comunidade</div>
          </div>
        </div>
        <p>
          Acumule pontos para <strong>subir de nível</strong> e desbloquear <strong>badges especiais</strong>!
        </p>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">🌱 Iniciante</Badge>
          <Badge variant="secondary">💬 Comunicador</Badge>
          <Badge variant="secondary">👥 Social</Badge>
          <Badge variant="secondary">🔥 Engajado</Badge>
        </div>
      </div>
    ),
  },
  {
    title: "Sistema de Convites",
    description: "Convide amigos e ganhe recompensas",
    icon: UserPlus,
    content: (
      <div className="space-y-4">
        <p>
          Cada usuário possui um <strong>código de convite único</strong>. Quando alguém usa seu código:
        </p>
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 text-white rounded-full p-3">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-lg">+50 pontos</div>
              <div className="text-sm text-muted-foreground">Para você e para o novo usuário!</div>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Encontre seu código de convite na página de <strong>Convites</strong> e compartilhe com amigos!
        </p>
      </div>
    ),
  },
  {
    title: "Moderação e Segurança",
    description: "Comunidade segura e respeitosa",
    icon: Shield,
    content: (
      <div className="space-y-4">
        <p>
          O BeeOn.me possui um sistema robusto de moderação para manter a plataforma segura:
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-red-500/10 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h4 className="font-semibold">Denúncias</h4>
              <p className="text-sm text-muted-foreground">
                Reporte posts, comentários ou usuários inadequados
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-amber-500/10 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h4 className="font-semibold">Revisão de Moderadores</h4>
              <p className="text-sm text-muted-foreground">
                Equipe analisa denúncias e toma ações apropriadas
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-semibold">Banimentos</h4>
              <p className="text-sm text-muted-foreground">
                Temporários ou permanentes para violações graves
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Recursos Adicionais",
    description: "Aproveite ao máximo a plataforma",
    icon: Bell,
    content: (
      <div className="space-y-4">
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Receba alertas sobre novos comentários, reações e badges desbloqueados.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hash className="w-5 h-5 text-amber-500" />
                Hashtags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use #hashtags nos posts para categorizar conteúdo e facilitar descoberta.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="bg-primary/10 p-4 rounded-lg text-center">
          <p className="font-semibold mb-2">Pronto para começar?</p>
          <p className="text-sm text-muted-foreground">
            Explore comunidades, crie seu primeiro post e comece a ganhar pontos!
          </p>
        </div>
      </div>
    ),
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();

  const step = steps[currentStep];
  const Icon = step!.icon;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      // Redirecionar para home ao finalizar
      setLocation("/");
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{step!.title}</CardTitle>
                <CardDescription>{step!.description}</CardDescription>
              </div>
            </div>
            <Badge variant="outline">
              {currentStep + 1} / {steps.length}
            </Badge>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          {step!.content}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {!isFirstStep && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Pular tutorial
            </Button>
            <Button onClick={handleNext}>
              {isLastStep ? "Começar" : "Próximo"}
              {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
