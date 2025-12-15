import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { trpc } from '../lib/trpc';
import { useToast } from '../hooks/use-toast';

interface ReportButtonProps {
  reportType: 'post' | 'comment' | 'user';
  targetId: number;
  variant?: 'ghost' | 'outline';
}

export function ReportButton({ reportType, targetId, variant = 'ghost' }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const { toast } = useToast();

  const reportMutation = trpc.moderation.report.useMutation({
    onSuccess: () => {
      toast({
        title: 'Denúncia enviada',
        description: 'Obrigado por nos ajudar a manter a comunidade segura.',
      });
      setOpen(false);
      setReason('');
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar denúncia',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast({
        title: 'Motivo obrigatório',
        description: 'Por favor, descreva o motivo da denúncia.',
        variant: 'destructive',
      });
      return;
    }

    reportMutation.mutate({
      reportType,
      targetId,
      reason: reason.trim(),
    });
  };

  const getTypeLabel = () => {
    switch (reportType) {
      case 'post':
        return 'post';
      case 'comment':
        return 'comentário';
      case 'user':
        return 'usuário';
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        onClick={() => setOpen(true)}
        aria-label={`Denunciar ${getTypeLabel()}`}
      >
        <Flag className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Denunciar {getTypeLabel()}</DialogTitle>
            <DialogDescription>
              Descreva o motivo da denúncia. Nossa equipe de moderação irá revisar em breve.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Descreva o motivo da denúncia (spam, assédio, conteúdo inapropriado, etc.)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={reportMutation.isPending}
            >
              {reportMutation.isPending ? 'Enviando...' : 'Enviar denúncia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
