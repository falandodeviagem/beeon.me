import { useAuth } from "@/_core/hooks/useAuth";
import FollowButton from "@/components/FollowButton";
import MainLayout from "@/components/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Trophy, UserPlus } from "lucide-react";
import { Link, useParams } from "wouter";

export default function Following() {
  const { userId } = useParams<{ userId: string }>();
  const parsedUserId = parseInt(userId || "0");
  const { user: currentUser } = useAuth();

  const { data: user } = trpc.profile.getUser.useQuery({ userId: parsedUserId });
  const { data: following = [], isLoading } = trpc.follow.following.useQuery({ userId: parsedUserId });

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href={`/user/${parsedUserId}`}>
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Perfil
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Seguindo</h1>
              <p className="text-muted-foreground">
                {user?.name || "Usuário"}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : following.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <UserPlus className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Não está seguindo ninguém</h3>
              <p className="text-muted-foreground">
                {currentUser?.id === parsedUserId
                  ? "Você ainda não segue ninguém"
                  : "Este usuário ainda não segue ninguém"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {following.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Link href={`/user/${user.id}`}>
                      <Avatar className="w-16 h-16 cursor-pointer hover:opacity-80 transition-opacity">
                        <AvatarImage src={user.avatarUrl || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xl">
                          {user.name?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/user/${user.id}`}>
                        <h3 className="text-lg font-semibold hover:underline cursor-pointer">
                          {user.name || "Usuário Anônimo"}
                        </h3>
                      </Link>
                      {user.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {user.bio}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2">
                        <Badge variant="secondary" className="gap-1">
                          <Trophy className="w-3 h-3" />
                          {user.points || 0} pontos
                        </Badge>
                        <Badge variant="outline">
                          Nível {user.level || 1}
                        </Badge>
                      </div>
                    </div>

                    <FollowButton userId={user.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
