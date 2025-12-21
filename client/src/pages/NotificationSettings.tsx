import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const { data: preferences, isLoading } = trpc.push.getPreferences.useQuery();
  const updatePreferences = trpc.push.updatePreferences.useMutation();
  const sendTestMutation = trpc.push.sendTest.useMutation();
  
  const {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const [localPrefs, setLocalPrefs] = useState(preferences);

  // Update local state when server data loads
  if (preferences && !localPrefs) {
    setLocalPrefs(preferences);
  }

  const handleToggle = async (key: string, value: boolean) => {
    if (!localPrefs) return;

    const newPrefs = { ...localPrefs, [key]: value };
    setLocalPrefs(newPrefs);

    try {
      await updatePreferences.mutateAsync({ [key]: value });
      toast.success('Preferências atualizadas');
    } catch (error) {
      toast.error('Erro ao atualizar preferências');
      // Revert on error
      setLocalPrefs(localPrefs);
    }
  };

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestMutation.mutateAsync();
      toast.success('Notificação de teste enviada!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar notificação de teste');
    }
  };

  if (isLoading || !localPrefs) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configurações de Notificações</h1>
        <p className="text-muted-foreground">
          Gerencie como e quando você recebe notificações do BeeOn.me
        </p>
      </div>

      {/* Push Notifications Status */}
      {isSupported && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                  Notificações Push
                </CardTitle>
                <CardDescription>
                  {isSubscribed
                    ? 'Você está recebendo notificações push'
                    : 'Ative para receber notificações mesmo quando não estiver no site'}
                </CardDescription>
              </div>
              <Button
                onClick={handlePushToggle}
                variant={isSubscribed ? 'outline' : 'default'}
              >
                {isSubscribed ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
          </CardHeader>
          
          {isSubscribed && (
            <CardContent>
              <Button
                onClick={handleTestNotification}
                variant="outline"
                size="sm"
                disabled={sendTestMutation.isPending}
              >
                {sendTestMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enviar Notificação de Teste
              </Button>
            </CardContent>
          )}

          {permission === 'denied' && (
            <CardContent>
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                <p className="font-medium mb-1">Permissão negada</p>
                <p>
                  Você bloqueou as notificações. Para ativá-las, vá nas configurações do seu navegador
                  e permita notificações para este site.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {!isSupported && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="bg-muted px-4 py-3 rounded-md text-sm">
              <p className="font-medium mb-1">Notificações push não suportadas</p>
              <p className="text-muted-foreground">
                Seu navegador não suporta notificações push. Tente usar Chrome, Firefox ou Edge.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Push Notification Preferences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tipos de Notificações Push</CardTitle>
          <CardDescription>
            Escolha quais eventos devem enviar notificações push
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Comentários</p>
              <p className="text-sm text-muted-foreground">
                Quando alguém comentar em seus posts
              </p>
            </div>
            <Switch
              checked={localPrefs.pushComments}
              onCheckedChange={(checked) => handleToggle('pushComments', checked)}
              disabled={!localPrefs.pushEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Curtidas</p>
              <p className="text-sm text-muted-foreground">
                Quando alguém curtir seus posts ou comentários
              </p>
            </div>
            <Switch
              checked={localPrefs.pushLikes}
              onCheckedChange={(checked) => handleToggle('pushLikes', checked)}
              disabled={!localPrefs.pushEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Novos Seguidores</p>
              <p className="text-sm text-muted-foreground">
                Quando alguém começar a seguir você
              </p>
            </div>
            <Switch
              checked={localPrefs.pushFollows}
              onCheckedChange={(checked) => handleToggle('pushFollows', checked)}
              disabled={!localPrefs.pushEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mensagens</p>
              <p className="text-sm text-muted-foreground">
                Quando você receber uma nova mensagem direta
              </p>
            </div>
            <Switch
              checked={localPrefs.pushMessages}
              onCheckedChange={(checked) => handleToggle('pushMessages', checked)}
              disabled={!localPrefs.pushEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Badges</p>
              <p className="text-sm text-muted-foreground">
                Quando você conquistar um novo badge
              </p>
            </div>
            <Switch
              checked={localPrefs.pushBadges}
              onCheckedChange={(checked) => handleToggle('pushBadges', checked)}
              disabled={!localPrefs.pushEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Comunidades</p>
              <p className="text-sm text-muted-foreground">
                Atualizações importantes das suas comunidades
              </p>
            </div>
            <Switch
              checked={localPrefs.pushCommunity}
              onCheckedChange={(checked) => handleToggle('pushCommunity', checked)}
              disabled={!localPrefs.pushEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações no Aplicativo</CardTitle>
          <CardDescription>
            Notificações que aparecem dentro do BeeOn.me
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Ativar notificações no app</p>
              <p className="text-sm text-muted-foreground">
                Mostrar notificações no sino de notificações
              </p>
            </div>
            <Switch
              checked={localPrefs.inAppEnabled}
              onCheckedChange={(checked) => handleToggle('inAppEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
