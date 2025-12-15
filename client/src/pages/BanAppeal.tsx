import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle, XCircle, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BanAppeal() {
  const { user } = useAuth();
  const { toast, loading, update } = useToast();
  const [reason, setReason] = useState("");
  const utils = trpc.useUtils();

  const { data: appeal, isLoading } = trpc.moderation.getMyAppeal.useQuery();

  const createAppealMutation = trpc.moderation.createAppeal.useMutation({
    onSuccess: () => {
      utils.moderation.getMyAppeal.invalidate();
      setReason("");
    },
  });

  const handleSubmit = async () => {
    if (reason.length < 10) {
      toast({
        title: "Erro",
        description: "A apelação deve ter pelo menos 10 caracteres",
        variant: "destructive",
      });
      return;
    }

    const toastId = loading("Enviando apelação...");
    try {
      await createAppealMutation.mutateAsync({ reason });
      update(toastId.id, {
        title: "Sucesso!",
        description: "Sua apelação foi enviada e será analisada em breve",
        variant: "success",
      });
    } catch (error: any) {
      update(toastId.id, {
        title: "Erro",
        description: error.message || "Erro ao enviar apelação",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Aprovada</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejeitada</Badge>;
      default:
        return null;
    }
  };

  if (!user?.isBanned) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Você não está banido
            </CardTitle>
            <CardDescription>
              Sua conta está em bom estado. Continue seguindo as regras da comunidade!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      {/* Ban Info Card */}
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-6 h-6" />
            Sua conta está suspensa
          </CardTitle>
          <CardDescription className="text-red-600">
            {user.banReason || "Violação das regras da comunidade"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.bannedUntil && (
            <p className="text-sm text-red-600">
              Suspensão temporária até: {new Date(user.bannedUntil).toLocaleDateString("pt-BR")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Appeal Status or Form */}
      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      ) : appeal ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Status da Apelação</CardTitle>
              {getStatusBadge(appeal.status)}
            </div>
            <CardDescription>
              Enviada {formatDistanceToNow(new Date(appeal.createdAt), { addSuffix: true, locale: ptBR })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Seu motivo:</h4>
              <p className="text-muted-foreground bg-muted p-3 rounded-md">{appeal.reason}</p>
            </div>

            {appeal.adminResponse && (
              <div>
                <h4 className="font-medium mb-2">Resposta da moderação:</h4>
                <p className="text-muted-foreground bg-muted p-3 rounded-md">{appeal.adminResponse}</p>
              </div>
            )}

            {appeal.status === "pending" && (
              <p className="text-sm text-yellow-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Sua apelação está sendo analisada. Aguarde a resposta da moderação.
              </p>
            )}

            {appeal.status === "rejected" && (
              <p className="text-sm text-red-600">
                Sua apelação foi rejeitada. Você pode enviar uma nova apelação após 7 dias.
              </p>
            )}

            {appeal.status === "approved" && (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Sua apelação foi aprovada! Sua conta foi desbloqueada.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Solicitar Revisão</CardTitle>
            <CardDescription>
              Se você acredita que seu banimento foi um erro, explique sua situação abaixo.
              Nossa equipe de moderação irá analisar seu caso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Por que você acredita que deve ser desbanido?
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explique detalhadamente sua situação. Seja honesto e respeitoso..."
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo de 10 caracteres. {reason.length}/10
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={reason.length < 10 || createAppealMutation.isPending}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Apelação
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Apelações falsas ou desrespeitosas podem resultar em banimento permanente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
