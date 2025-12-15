import { useAuth } from "@/_core/hooks/useAuth";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trophy, Award, Calendar, Edit2, Save, X, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const { data: profile, isLoading } = trpc.user.getProfile.useQuery(
    { userId: user?.id },
    { enabled: !!user }
  );

  const { data: badges } = trpc.user.getBadges.useQuery(
    { userId: user?.id },
    { enabled: !!user }
  );

  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil");
    },
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  const handleSave = async () => {
    await updateProfileMutation.mutateAsync({
      name: name || undefined,
      bio: bio || undefined,
    });
  };

  const handleCancel = () => {
    setName(profile?.name || "");
    setBio(profile?.bio || "");
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-8 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile?.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {profile?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4 w-full">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Conte um pouco sobre você..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold">{profile?.name || "Usuário"}</h1>
                        <p className="text-muted-foreground">{profile?.email}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </div>

                    {profile?.bio && (
                      <p className="text-foreground">{profile.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
                        <Trophy className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{profile?.points || 0} pontos</p>
                          <p className="text-xs text-muted-foreground">Total acumulado</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/20">
                        <Award className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Nível {profile?.level || 1}</p>
                          <p className="text-xs text-muted-foreground">Ranking atual</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/20">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(profile?.createdAt || Date.now()).toLocaleDateString("pt-BR")}
                          </p>
                          <p className="text-xs text-muted-foreground">Membro desde</p>
                        </div>
                      </div>

                      <Link href="/profile/payments">
                        <a className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors cursor-pointer">
                          <CreditCard className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">Pagamentos</p>
                            <p className="text-xs text-muted-foreground">Ver histórico</p>
                          </div>
                        </a>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Conquistas</CardTitle>
            <CardDescription>
              Badges que você desbloqueou ao longo da jornada
            </CardDescription>
          </CardHeader>
          <CardContent>
            {badges && badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map((userBadge) => (
                  <div
                    key={userBadge.badge.id}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl">
                      {userBadge.badge.iconUrl ? (
                        <img src={userBadge.badge.iconUrl} alt={userBadge.badge.name} className="w-12 h-12" />
                      ) : (
                        "🏆"
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm">{userBadge.badge.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(userBadge.earnedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Você ainda não desbloqueou nenhuma conquista.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Continue participando para ganhar badges!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
