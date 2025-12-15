import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MentionInput } from "@/components/MentionInput";
import { MentionText } from "@/components/MentionText";
import { Edit2, MoreVertical, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/_core/hooks/useAuth";

interface CommentItemProps {
  comment: {
    id: number;
    content: string;
    authorId: number;
    authorName: string | null;
    authorAvatar: string | null;
    createdAt: Date;
    isEdited?: boolean;
    editedAt?: Date | null;
  };
  postId: number;
  onDeleted?: () => void;
}

export function CommentItem({ comment, postId, onDeleted }: CommentItemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isAuthor = user?.id === comment.authorId;

  const updateMutation = trpc.comment.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Comentário editado com sucesso!",
      });
      setShowEditDialog(false);
      utils.comment.list.invalidate({ postId });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível editar o comentário",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = trpc.comment.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Comentário deletado com sucesso!",
      });
      utils.comment.list.invalidate({ postId });
      onDeleted?.();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível deletar o comentário",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (editContent.trim() === comment.content) {
      setShowEditDialog(false);
      return;
    }
    updateMutation.mutate({ id: comment.id, content: editContent });
  };

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja deletar este comentário?")) {
      deleteMutation.mutate({ id: comment.id, postId });
    }
  };

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <>
      <div className="flex gap-3 py-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.authorAvatar || undefined} />
          <AvatarFallback className="text-xs">
            {comment.authorName?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">
                {comment.authorName || 'Usuário'}
              </span>
              <span className="text-xs text-muted-foreground">
                {timeAgo}
              </span>
              {comment.isEdited && comment.editedAt && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground italic cursor-help">
                        (editado)
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Editado{' '}
                        {formatDistanceToNow(new Date(comment.editedAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <MentionText 
            content={comment.content} 
            className="text-sm mt-1 break-words"
          />
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Comentário</DialogTitle>
          </DialogHeader>
          <MentionInput
            value={editContent}
            onChange={setEditContent}
            placeholder="Edite seu comentário..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEdit}
              disabled={updateMutation.isPending || !editContent.trim()}
            >
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
