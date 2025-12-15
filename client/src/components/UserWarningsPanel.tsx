import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Ban, Clock, Shield, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserWarningsPanelProps {
  userId: number;
  userName?: string;
}

const levelLabels: Record<string, { label: string; color: string; icon: typeof AlertTriangle }> = {
  warning_1: { label: "1º Aviso", color: "bg-yellow-500", icon: AlertTriangle },
  warning_2: { label: "2º Aviso", color: "bg-orange-500", icon: AlertTriangle },
  temp_ban: { label: "Ban Temporário", color: "bg-red-500", icon: Clock },
  perm_ban: { label: "Ban Permanente", color: "bg-red-700", icon: Ban },
};

export function UserWarningsPanel({ userId, userName }: UserWarningsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");

  const { data, isLoading, refetch } = trpc.moderation.getUserWarnings.useQuery(
    { userId },
    { enabled: isOpen }
  );

  const utils = trpc.useUtils();

  const issueMutation = trpc.moderation.issueWarning.useMutation({
    onSuccess: (result) => {
      const levelInfo = levelLabels[result.level];
      toast.success(`${levelInfo.label} emitido com sucesso!`);
      setReason("");
      refetch();
      utils.moderation.getStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deactivateMutation = trpc.moderation.deactivateWarning.useMutation({
    onSuccess: () => {
      toast.success("Aviso desativado!");
      refetch();
    },
  });

  const handleIssueWarning = () => {
    if (!reason.trim()) {
      toast.error("Informe o motivo do aviso");
      return;
    }
    issueMutation.mutate({ userId, reason });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Shield className="w-4 h-4" />
          Avisos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Avisos de {userName || `Usuário #${userId}`}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Avisos Ativos</p>
                <p className="text-2xl font-bold">{data?.activeCount || 0}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Próximo Nível</p>
                <Badge className={levelLabels[data?.nextLevel || "warning_1"].color}>
                  {levelLabels[data?.nextLevel || "warning_1"].label}
                </Badge>
              </div>
            </div>

            {/* Issue New Warning */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Emitir Novo Aviso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Descreva o motivo do aviso..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Será emitido: <Badge className={levelLabels[data?.nextLevel || "warning_1"].color}>
                      {levelLabels[data?.nextLevel || "warning_1"].label}
                    </Badge>
                  </p>
                  <Button
                    onClick={handleIssueWarning}
                    disabled={issueMutation.isPending}
                    variant="destructive"
                  >
                    Emitir Aviso
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Warning History */}
            <div className="space-y-3">
              <h3 className="font-medium">Histórico de Avisos</h3>
              {data?.warnings.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum aviso registrado</p>
              ) : (
                <div className="space-y-2">
                  {data?.warnings.map((warning) => {
                    const levelInfo = levelLabels[warning.level];
                    const LevelIcon = levelInfo.icon;
                    return (
                      <Card key={warning.id} className={!warning.isActive ? "opacity-60" : ""}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full ${levelInfo.color} flex items-center justify-center`}>
                                <LevelIcon className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={levelInfo.color}>{levelInfo.label}</Badge>
                                  {!warning.isActive && (
                                    <Badge variant="outline">Desativado</Badge>
                                  )}
                                </div>
                                <p className="text-sm">{warning.reason}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Por {warning.moderatorName || `Mod #${warning.moderatorId}`} •{" "}
                                  {formatDistanceToNow(new Date(warning.createdAt), {
                                    addSuffix: true,
                                    locale: ptBR,
                                  })}
                                  {warning.expiresAt && (
                                    <> • Expira em {formatDistanceToNow(new Date(warning.expiresAt), {
                                      locale: ptBR,
                                    })}</>
                                  )}
                                </p>
                              </div>
                            </div>
                            {warning.isActive && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deactivateMutation.mutate({ warningId: warning.id })}
                                disabled={deactivateMutation.isPending}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
