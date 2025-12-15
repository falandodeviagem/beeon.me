import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, CheckCheck, Filter, AtSign, MessageCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Notifications() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [activeTab, setActiveTab] = useState<"all" | "mentions">("all");
  
  const { data: notifications, isLoading, refetch } = trpc.notification.list.useQuery({ limit: 50 });
  const { data: unreadCount } = trpc.notification.unreadCount.useQuery();
  const { data: mentions, isLoading: mentionsLoading } = trpc.notification.getMentions.useQuery({ limit: 50 });
  
  const markAsReadMutation = trpc.notification.markAsRead.useMutation();
  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation();

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsReadMutation.mutateAsync({ id });
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar como lida",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      refetch();
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas como lidas",
        variant: "destructive",
      });
    }
  };

  const filteredNotifications = notifications?.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const mentionNotifications = notifications?.filter(n => n.type === 'mention');

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6" />
                <CardTitle>Notificações</CardTitle>
                {unreadCount && unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </div>
              {activeTab === "all" && unreadCount && unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "mentions")}>
              <TabsList className="mb-4">
                <TabsTrigger value="all" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Todas
                </TabsTrigger>
                <TabsTrigger value="mentions" className="gap-2">
                  <AtSign className="w-4 h-4" />
                  Menções
                  {mentions && mentions.length > 0 && (
                    <Badge variant="secondary" className="ml-1">{mentions.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    Todas
                  </Button>
                  <Button
                    variant={filter === "unread" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("unread")}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Não lidas
                  </Button>
                </div>

                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : filteredNotifications && filteredNotifications.length > 0 ? (
                  <div className="space-y-2">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          notification.isRead
                            ? "bg-background"
                            : "bg-accent/50 border-primary/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{notification.title}</p>
                              {!notification.isRead && (
                                <Badge variant="secondary" className="text-xs">
                                  Nova
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleString("pt-BR")}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={markAsReadMutation.isPending}
                            >
                              Marcar como lida
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {filter === "unread"
                        ? "Você não tem notificações não lidas"
                        : "Você não tem notificações"}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="mentions">
                {mentionsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24" />
                    ))}
                  </div>
                ) : mentions && mentions.length > 0 ? (
                  <div className="space-y-3">
                    {mentions.map((mention) => (
                      <Link 
                        key={mention.id} 
                        href={mention.postId ? `/post/${mention.postId}` : '#'}
                      >
                        <a className="block p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={mention.mentionerAvatar || undefined} />
                              <AvatarFallback>
                                {mention.mentionerName?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{mention.mentionerName}</span>
                                <span className="text-muted-foreground">mencionou você</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {mention.postId && (
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    em um post
                                  </span>
                                )}
                                {mention.commentId && (
                                  <span className="flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" />
                                    em um comentário
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(mention.createdAt), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                            <AtSign className="w-5 h-5 text-primary flex-shrink-0" />
                          </div>
                        </a>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <AtSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Você ainda não foi mencionado</p>
                    <p className="text-sm mt-2">
                      Quando alguém usar @seu_nome em um post ou comentário, aparecerá aqui
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
