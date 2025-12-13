import { useAuth } from "@/_core/hooks/useAuth";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Shield, AlertTriangle, CheckCircle, XCircle, Ban } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Moderation() {
  const { user, isAuthenticated } = useAuth();
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});
  const [banReason, setBanReason] = useState("");
  const [banUserId, setBanUserId] = useState<number | null>(null);

  const { data: reports, isLoading } = trpc.moderation.getPendingReports.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );

  const utils = trpc.useUtils();

  const reviewMutation = trpc.moderation.reviewReport.useMutation({
    onSuccess: () => {
      toast.success("Denúncia revisada!");
      utils.moderation.getPendingReports.invalidate();
    },
  });

  const banMutation = trpc.moderation.banUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário banido!");
      setBanUserId(null);
      setBanReason("");
    },
  });

  if (!isAuthenticated || user?.role !== "admin") {
    window.location.href = "/";
    return null;
  }

  const handleReview = (reportId: number, status: "reviewed" | "resolved" | "dismissed") => {
    reviewMutation.mutate({
      id: reportId,
      status,
      reviewNotes: reviewNotes[reportId],
    });
  };

  const handleBan = () => {
    if (!banUserId || !banReason.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    banMutation.mutate({
      userId: banUserId,
      reason: banReason,
    });
  };

  return (
    <MainLayout>
      <div className="container max-w-6xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Painel de Moderação</h1>
            </div>
            <p className="text-muted-foreground">
              Gerencie denúncias e mantenha a comunidade segura
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Ban className="w-4 h-4" />
                Banir Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Banir Usuário</DialogTitle>
                <DialogDescription>
                  Esta ação impedirá o usuário de acessar a plataforma
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="userId">ID do Usuário</Label>
                  <Input
                    id="userId"
                    type="number"
                    value={banUserId || ""}
                    onChange={(e) => setBanUserId(parseInt(e.target.value) || null)}
                    placeholder="123"
                  />
                </div>

                <div>
                  <Label htmlFor="reason">Motivo do Banimento</Label>
                  <Textarea
                    id="reason"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Descreva o motivo do banimento..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleBan}
                  disabled={banMutation.isPending}
                  variant="destructive"
                  className="w-full"
                >
                  Confirmar Banimento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reports?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-sm text-muted-foreground">Resolvidas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-sm text-muted-foreground">Descartadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Denúncias Pendentes</CardTitle>
            <CardDescription>
              Analise e tome ações sobre as denúncias recebidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : reports && reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id} className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {report.reportType === "post" && "Post"}
                              {report.reportType === "comment" && "Comentário"}
                              {report.reportType === "user" && "Usuário"}
                            </Badge>
                            <Badge variant="secondary">ID: {report.targetId}</Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Denunciado por: Usuário #{report.reporterId}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Data: {new Date(report.createdAt).toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">Motivo:</Label>
                        <p className="mt-1 p-3 rounded-lg bg-muted/50">{report.reason}</p>
                      </div>

                      <div>
                        <Label htmlFor={`notes-${report.id}`}>Notas da Revisão</Label>
                        <Textarea
                          id={`notes-${report.id}`}
                          value={reviewNotes[report.id] || ""}
                          onChange={(e) =>
                            setReviewNotes((prev) => ({ ...prev, [report.id]: e.target.value }))
                          }
                          placeholder="Adicione suas observações..."
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleReview(report.id, "resolved")}
                          disabled={reviewMutation.isPending}
                          className="gap-2"
                          variant="default"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Resolver
                        </Button>
                        <Button
                          onClick={() => handleReview(report.id, "reviewed")}
                          disabled={reviewMutation.isPending}
                          className="gap-2"
                          variant="secondary"
                        >
                          Marcar como Revisado
                        </Button>
                        <Button
                          onClick={() => handleReview(report.id, "dismissed")}
                          disabled={reviewMutation.isPending}
                          className="gap-2"
                          variant="outline"
                        >
                          <XCircle className="w-4 h-4" />
                          Descartar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Tudo limpo!</h3>
                <p className="text-muted-foreground">
                  Não há denúncias pendentes no momento
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
