import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Filter, ChevronLeft, ChevronRight, FileText, User, Calendar, Search, X, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import MainLayout from "@/components/MainLayout";

export default function AuditLogs() {
  const { user } = useAuth();
  const { toast, loading, update } = useToast();
  
  // Filters
  const [action, setAction] = useState<string>("");
  const [entityType, setEntityType] = useState<string>("");
  const [searchUserId, setSearchUserId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Pagination
  const [page, setPage] = useState(0);
  const limit = 20;
  
  // Details modal
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Queries
  const { data: actions } = trpc.moderation.getAuditLogActions.useQuery();
  const { data: entityTypes } = trpc.moderation.getAuditLogEntityTypes.useQuery();
  
  const { data: logsData, isLoading } = trpc.moderation.getAuditLogs.useQuery({
    action: action || undefined,
    entityType: entityType || undefined,
    userId: searchUserId ? parseInt(searchUserId) : undefined,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    limit,
    offset: page * limit,
  });

  const exportMutation = trpc.moderation.exportAuditLogsCSV.useMutation();

  const handleExport = async () => {
    const toastId = loading("Gerando CSV...");
    try {
      const result = await exportMutation.mutateAsync({
        action: action || undefined,
        entityType: entityType || undefined,
        userId: searchUserId ? parseInt(searchUserId) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
      
      // Download CSV
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      update(toastId.id, {
        title: "Sucesso!",
        description: "CSV exportado com sucesso",
        variant: "success",
      });
    } catch (error: any) {
      update(toastId.id, {
        title: "Erro",
        description: error.message || "Erro ao exportar CSV",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setAction("");
    setEntityType("");
    setSearchUserId("");
    setStartDate("");
    setEndDate("");
    setPage(0);
  };

  const hasFilters = action || entityType || searchUserId || startDate || endDate;

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      ban_user: "bg-red-100 text-red-800",
      unban_user: "bg-green-100 text-green-800",
      remove_post: "bg-orange-100 text-orange-800",
      remove_comment: "bg-orange-100 text-orange-800",
      approve_appeal: "bg-green-100 text-green-800",
      reject_appeal: "bg-red-100 text-red-800",
      resolve_report: "bg-blue-100 text-blue-800",
    };
    return <Badge variant="outline" className={colors[action] || "bg-gray-100 text-gray-800"}>{action}</Badge>;
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
            <h1 className="text-3xl font-bold">Logs de Auditoria</h1>
            <p className="text-muted-foreground">Histórico detalhado de todas as ações administrativas</p>
          </div>
          <Button onClick={handleExport} disabled={exportMutation.isPending}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </CardTitle>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Ação</label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as ações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as ações</SelectItem>
                    {actions?.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Tipo de Entidade</label>
                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    {entityTypes?.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">ID do Usuário</label>
                <Input
                  type="number"
                  placeholder="ID do admin"
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Data Início</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Data Fim</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {logsData?.total || 0} registro(s) encontrado(s)
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page + 1} de {Math.ceil((logsData?.total || 0) / limit) || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!logsData || (page + 1) * limit >= logsData.total}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="mt-4 text-muted-foreground">Carregando logs...</p>
              </div>
            ) : logsData && logsData.logs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsData.logs.map((log: any) => (
                      <TableRow key={log.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">{log.id}</TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>
                          <span className="text-sm">{log.entityType}</span>
                          <span className="text-xs text-muted-foreground ml-1">#{log.entityId}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{log.userName || `ID: ${log.userId}`}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: ptBR })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum log encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes do Log</DialogTitle>
              <DialogDescription>
                Informações completas do registro de auditoria
              </DialogDescription>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                    <p className="font-mono">{selectedLog.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ação</p>
                    {getActionBadge(selectedLog.action)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tipo de Entidade</p>
                    <p>{selectedLog.entityType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID da Entidade</p>
                    <p className="font-mono">{selectedLog.entityId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Usuário</p>
                    <p>{selectedLog.userName || `ID: ${selectedLog.userId}`}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">IP</p>
                    <p className="font-mono">{selectedLog.ipAddress || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data/Hora</p>
                  <p>{format(new Date(selectedLog.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</p>
                </div>

                {selectedLog.details && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Detalhes (JSON)</p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(JSON.parse(selectedLog.details), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
