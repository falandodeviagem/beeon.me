import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle, User, MessageSquare, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { TemplateSelector } from "@/components/TemplateSelector";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AppealsPanel() {
  const { toast, loading, update } = useToast();
  const [selectedAppeal, setSelectedAppeal] = useState<any>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const utils = trpc.useUtils();

  const { data: pendingAppeals, isLoading: loadingPending } = trpc.moderation.getPendingAppeals.useQuery();
  const { data: allAppeals, isLoading: loadingAll } = trpc.moderation.getAllAppeals.useQuery({
    status: activeTab === "pending" ? "pending" : activeTab === "approved" ? "approved" : activeTab === "rejected" ? "rejected" : undefined,
  });

  const resolveAppealMutation = trpc.moderation.resolveAppeal.useMutation({
    onSuccess: () => {
      utils.moderation.getPendingAppeals.invalidate();
      utils.moderation.getAllAppeals.invalidate();
      setSelectedAppeal(null);
      setAdminResponse("");
    },
  });

  const handleResolve = async (status: "approved" | "rejected") => {
    if (!selectedAppeal || !adminResponse.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, escreva uma resposta",
        variant: "destructive",
      });
      return;
    }

    const toastId = loading(status === "approved" ? "Aprovando apelação..." : "Rejeitando apelação...");
    try {
      await resolveAppealMutation.mutateAsync({
        appealId: selectedAppeal.id,
        status,
        adminResponse,
      });
      update(toastId.id, {
        title: "Sucesso!",
        description: status === "approved" ? "Apelação aprovada e usuário desbanido" : "Apelação rejeitada",
        variant: "success",
      });
    } catch (error: any) {
      update(toastId.id, {
        title: "Erro",
        description: error.message || "Erro ao processar apelação",
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

  const appeals = activeTab === "pending" ? pendingAppeals : allAppeals;
  const isLoading = activeTab === "pending" ? loadingPending : loadingAll;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Apelações de Banimento</h2>
          <p className="text-muted-foreground">Gerencie solicitações de revisão de banimento</p>
        </div>
        {pendingAppeals && pendingAppeals.length > 0 && (
          <Badge variant="destructive">{pendingAppeals.length} pendente(s)</Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="approved">Aprovadas</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-muted-foreground">Carregando apelações...</p>
            </div>
          ) : appeals && appeals.length > 0 ? (
            <div className="space-y-4">
              {appeals.map((appeal: any) => (
                <Card key={appeal.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{appeal.userName || "Usuário"}</span>
                        <span className="text-sm text-muted-foreground">({appeal.userEmail})</span>
                      </div>
                      {getStatusBadge(appeal.status)}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(appeal.createdAt), { addSuffix: true, locale: ptBR })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Motivo do banimento:</p>
                        <p className="text-sm">{appeal.banReason || "Não especificado"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Apelação do usuário:</p>
                        <p className="text-sm bg-muted p-2 rounded">{appeal.reason}</p>
                      </div>
                      {appeal.adminResponse && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Resposta da moderação:</p>
                          <p className="text-sm bg-muted p-2 rounded">{appeal.adminResponse}</p>
                        </div>
                      )}
                      {appeal.status === "pending" && (
                        <Button
                          onClick={() => setSelectedAppeal(appeal)}
                          className="w-full mt-2"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Responder Apelação
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma apelação {activeTab === "pending" ? "pendente" : "encontrada"}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={!!selectedAppeal} onOpenChange={() => setSelectedAppeal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Responder Apelação</DialogTitle>
            <DialogDescription>
              Analise a apelação e forneça uma resposta ao usuário.
            </DialogDescription>
          </DialogHeader>

          {selectedAppeal && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Usuário: {selectedAppeal.userName}</p>
                <p className="text-sm text-muted-foreground">Motivo do ban: {selectedAppeal.banReason}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Apelação:</p>
                <p className="text-sm bg-muted p-3 rounded">{selectedAppeal.reason}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">Sua resposta:</label>
                  <div className="flex gap-2">
                    <TemplateSelector
                      category="appeal_approve"
                      onSelect={(content) => setAdminResponse(content)}
                    />
                    <TemplateSelector
                      category="appeal_reject"
                      onSelect={(content) => setAdminResponse(content)}
                    />
                  </div>
                </div>
                <Textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Explique sua decisão..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedAppeal(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleResolve("rejected")}
              disabled={!adminResponse.trim() || resolveAppealMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Rejeitar
            </Button>
            <Button
              onClick={() => handleResolve("approved")}
              disabled={!adminResponse.trim() || resolveAppealMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Aprovar e Desbanir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
