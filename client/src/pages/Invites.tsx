import { useAuth } from "@/_core/hooks/useAuth";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Copy, Check, Gift, Users } from "lucide-react";

export default function Invites() {
  const { user, isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const { data: profile } = trpc.user.getProfile.useQuery(
    { userId: user?.id },
    { enabled: !!user }
  );

  const utils = trpc.useUtils();

  const generateCodeMutation = trpc.user.generateInviteCode.useMutation({
    onSuccess: (data) => {
      toast.success("Código de convite gerado!");
      utils.user.getProfile.invalidate();
    },
  });

  const acceptInviteMutation = trpc.user.acceptInvite.useMutation({
    onSuccess: (data) => {
      toast.success(`Convite aceito! ${data.inviterName} ganhou 50 pontos!`);
      setInviteCode("");
    },
    onError: (error) => {
      toast.error(error.message || "Código inválido");
    },
  });

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  const handleGenerateCode = () => {
    generateCodeMutation.mutate();
  };

  const handleCopy = () => {
    if (profile?.inviteCode) {
      const inviteUrl = `${window.location.origin}?invite=${profile.inviteCode}`;
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAcceptInvite = () => {
    if (!inviteCode.trim()) {
      toast.error("Digite um código de convite");
      return;
    }
    acceptInviteMutation.mutate({ code: inviteCode });
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <UserPlus className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Sistema de Convites
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Convide amigos e ganhe recompensas!
          </p>
        </div>

        {/* Rewards Info */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Ganhe 50 Pontos por Convite!</h3>
                <p className="text-muted-foreground">
                  Cada amigo que aceitar seu convite te dá 50 pontos. Quanto mais amigos, mais pontos!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Invite Code */}
        <Card>
          <CardHeader>
            <CardTitle>Seu Código de Convite</CardTitle>
            <CardDescription>
              Compartilhe este link com seus amigos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.inviteCode ? (
              <>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}?invite=${profile.inviteCode}`}
                    readOnly
                    className="font-mono"
                  />
                  <Button onClick={handleCopy} variant="outline" className="gap-2 flex-shrink-0">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Seu código:</p>
                  <p className="text-2xl font-bold text-primary font-mono">
                    {profile.inviteCode}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Você ainda não tem um código de convite
                </p>
                <Button
                  onClick={handleGenerateCode}
                  disabled={generateCodeMutation.isPending}
                  className="gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Gerar Código de Convite
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accept Invite */}
        <Card>
          <CardHeader>
            <CardTitle>Tem um Código de Convite?</CardTitle>
            <CardDescription>
              Digite o código que você recebeu de um amigo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o código aqui..."
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
              <Button
                onClick={handleAcceptInvite}
                disabled={acceptInviteMutation.isPending}
                className="gap-2 flex-shrink-0"
              >
                <Check className="w-4 h-4" />
                Aceitar
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Ao aceitar um convite, você ajuda seu amigo a ganhar 50 pontos!
            </p>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card>
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Gere seu código</h4>
                  <p className="text-sm text-muted-foreground">
                    Clique em "Gerar Código de Convite" para criar seu código único
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Compartilhe com amigos</h4>
                  <p className="text-sm text-muted-foreground">
                    Copie o link e envie para seus amigos via WhatsApp, email ou redes sociais
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Ganhe recompensas</h4>
                  <p className="text-sm text-muted-foreground">
                    Quando seus amigos aceitarem o convite, você ganha 50 pontos automaticamente!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
