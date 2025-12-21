import { useAuth } from "@/_core/hooks/useAuth";
import MainLayout from "@/components/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, Send, Wifi, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Badge } from "@/components/ui/badge";
import { OnlineIndicator } from "@/components/OnlineIndicator";

export default function Messages() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { data: conversations = [], isLoading: loadingConversations, refetch: refetchConversations } = 
    trpc.messages.conversations.useQuery();

  const { data: messages = [], isLoading: loadingMessages, refetch: refetchMessages } = 
    trpc.messages.list.useQuery(
      { conversationId: selectedConversationId! },
      { enabled: selectedConversationId !== null }
    );

  // WebSocket connection
  const { isConnected, isConnecting, send } = useWebSocket({
    onMessage: (message) => {
      if (message.type === "new_message") {
        // Refetch messages and conversations when new message arrives
        refetchMessages();
        refetchConversations();
      } else if (message.type === "typing") {
        // Show typing indicator
        if (message.conversationId === selectedConversationId && message.userId !== user?.id) {
          setOtherUserTyping(true);
          // Hide after 3 seconds
          setTimeout(() => setOtherUserTyping(false), 3000);
        }
      }
    },
  });

  const sendMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      setMessageContent("");
      refetchMessages();
      refetchConversations();
    },
  });

  const markAsReadMutation = trpc.messages.markAsRead.useMutation({
    onSuccess: () => {
      refetchConversations();
    },
  });

  useEffect(() => {
    if (selectedConversationId) {
      markAsReadMutation.mutate({ conversationId: selectedConversationId });
    }
  }, [selectedConversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!messageContent.trim() || !selectedConversationId) return;
    sendMutation.mutate({
      conversationId: selectedConversationId,
      content: messageContent.trim(),
    });
    setIsTyping(false);
  };

  const handleTyping = (value: string) => {
    setMessageContent(value);
    
    if (!selectedConversationId || !isConnected) return;
    
    // Send typing event
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      send({ type: "typing", conversationId: selectedConversationId });
    }
    
    // Reset typing after 2 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Conversations List */}
          <Card className="md:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Conversas
                </h2>
                <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
                  {isConnecting ? (
                    <><WifiOff className="w-3 h-3" /> Conectando...</>
                  ) : isConnected ? (
                    <><Wifi className="w-3 h-3" /> Online</>
                  ) : (
                    <><WifiOff className="w-3 h-3" /> Offline</>
                  )}
                </Badge>
              </div>
              
              {loadingConversations ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma conversa ainda</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-14rem)]">
                  <div className="space-y-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversationId(conversation.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversationId === conversation.id
                            ? "bg-primary/10 border-2 border-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={conversation.otherUserAvatar || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                                {conversation.otherUserName?.[0]?.toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <OnlineIndicator userId={conversation.otherUserId} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold truncate">
                                {conversation.otherUserName || "Usuário"}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2">
            {selectedConversationId ? (
              <CardContent className="p-0 flex flex-col h-full">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation?.otherUserAvatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                      {selectedConversation?.otherUserName?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedConversation?.otherUserName || "Usuário"}</h3>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  {otherUserTyping && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span>{selectedConversation?.otherUserName} está digitando...</span>
                    </div>
                  )}
                  {loadingMessages ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-3/4" />
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma mensagem ainda</p>
                      <p className="text-sm">Envie a primeira mensagem!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.reverse().map((message) => {
                        const isOwn = message.senderId === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={message.senderAvatar || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs">
                                {message.senderName?.[0]?.toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`flex flex-col ${isOwn ? "items-end" : ""}`}>
                              <div
                                className={`px-4 py-2 rounded-lg max-w-md ${
                                  isOwn
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <span className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(message.createdAt), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={messageContent}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!messageContent.trim() || sendMutation.isPending}
                      className="gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Enviar
                    </Button>
                  </div>
                </div>
              </CardContent>
            ) : (
              <CardContent className="flex items-center justify-center h-full text-center">
                <div>
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Selecione uma conversa</h3>
                  <p className="text-muted-foreground">
                    Escolha uma conversa na lista para começar a conversar
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
