import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, FileText, CheckCircle, XCircle, AlertTriangle, Ban, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import MainLayout from "@/components/MainLayout";

const categoryLabels: Record<string, string> = {
  appeal_approve: "Aprovar Apelação",
  appeal_reject: "Rejeitar Apelação",
  report_resolve: "Resolver Denúncia",
  report_dismiss: "Descartar Denúncia",
  warning: "Aviso",
  ban: "Banimento",
};

const categoryIcons: Record<string, any> = {
  appeal_approve: CheckCircle,
  appeal_reject: XCircle,
  report_resolve: CheckCircle,
  report_dismiss: XCircle,
  warning: AlertTriangle,
  ban: Ban,
};

const categoryColors: Record<string, string> = {
  appeal_approve: "bg-green-100 text-green-800",
  appeal_reject: "bg-red-100 text-red-800",
  report_resolve: "bg-blue-100 text-blue-800",
  report_dismiss: "bg-gray-100 text-gray-800",
  warning: "bg-yellow-100 text-yellow-800",
  ban: "bg-red-100 text-red-800",
};

export default function ResponseTemplates() {
  const { user } = useAuth();
  const { toast, loading, update } = useToast();
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("");

  const { data: templates, isLoading } = trpc.moderation.getTemplates.useQuery({
    category: activeTab === "all" ? undefined : activeTab,
  });

  const createMutation = trpc.moderation.createTemplate.useMutation({
    onSuccess: () => {
      utils.moderation.getTemplates.invalidate();
      setShowCreateDialog(false);
      resetForm();
    },
  });

  const updateMutation = trpc.moderation.updateTemplate.useMutation({
    onSuccess: () => {
      utils.moderation.getTemplates.invalidate();
      setEditingTemplate(null);
      resetForm();
    },
  });

  const deleteMutation = trpc.moderation.deleteTemplate.useMutation({
    onSuccess: () => {
      utils.moderation.getTemplates.invalidate();
      setDeleteConfirm(null);
    },
  });

  const resetForm = () => {
    setName("");
    setContent("");
    setCategory("");
  };

  const handleCreate = async () => {
    if (!name.trim() || !content.trim() || !category) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    const toastId = loading("Criando template...");
    try {
      await createMutation.mutateAsync({
        name,
        content,
        category: category as any,
      });
      update(toastId.id, {
        title: "Sucesso!",
        description: "Template criado com sucesso",
        variant: "success",
      });
    } catch (error: any) {
      update(toastId.id, {
        title: "Erro",
        description: error.message || "Erro ao criar template",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingTemplate) return;

    const toastId = loading("Atualizando template...");
    try {
      await updateMutation.mutateAsync({
        id: editingTemplate.id,
        name,
        content,
        category: category as any,
      });
      update(toastId.id, {
        title: "Sucesso!",
        description: "Template atualizado com sucesso",
        variant: "success",
      });
    } catch (error: any) {
      update(toastId.id, {
        title: "Erro",
        description: error.message || "Erro ao atualizar template",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    const toastId = loading("Excluindo template...");
    try {
      await deleteMutation.mutateAsync({ id });
      update(toastId.id, {
        title: "Sucesso!",
        description: "Template excluído com sucesso",
        variant: "success",
      });
    } catch (error: any) {
      update(toastId.id, {
        title: "Erro",
        description: error.message || "Erro ao excluir template",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (template: any) => {
    setEditingTemplate(template);
    setName(template.name);
    setContent(template.content);
    setCategory(template.category);
  };

  if (user?.role !== "admin") {
    return (
      <MainLayout>
        <div className="container py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Acesso restrito a administradores</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="w-8 h-8 text-primary" />
              Templates de Resposta
            </h1>
            <p className="text-muted-foreground">Respostas pré-definidas para agilizar moderação</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="appeal_approve">Aprovar Apelação</TabsTrigger>
            <TabsTrigger value="appeal_reject">Rejeitar Apelação</TabsTrigger>
            <TabsTrigger value="report_resolve">Resolver Denúncia</TabsTrigger>
            <TabsTrigger value="report_dismiss">Descartar Denúncia</TabsTrigger>
            <TabsTrigger value="warning">Aviso</TabsTrigger>
            <TabsTrigger value="ban">Banimento</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : templates && templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template: any) => {
                  const Icon = categoryIcons[template.category] || FileText;
                  return (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <Badge variant="outline" className={`mt-1 ${categoryColors[template.category]}`}>
                              <Icon className="w-3 h-3 mr-1" />
                              {categoryLabels[template.category]}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(template)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(template.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <span>Usado {template.useCount}x</span>
                          <span>{formatDistanceToNow(new Date(template.createdAt), { addSuffix: true, locale: ptBR })}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum template encontrado</p>
                  <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Template</DialogTitle>
              <DialogDescription>
                Crie uma resposta pré-definida para usar na moderação
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Apelação aprovada - Primeira vez"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Categoria</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Conteúdo</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva o texto do template..."
                  rows={5}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                Criar Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingTemplate} onOpenChange={() => { setEditingTemplate(null); resetForm(); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Template</DialogTitle>
              <DialogDescription>
                Atualize as informações do template
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Categoria</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Conteúdo</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditingTemplate(null); resetForm(); }}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMutation.isPending}
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
