import { useAuth } from "@/_core/hooks/useAuth";
import FollowButton from "@/components/FollowButton";
import MainLayout from "@/components/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Trophy, Users } from "lucide-react";
import { Link, useParams } from "wouter";

export default function Followers() {
  const { userId } = useParams<{ userId: string }>();
  const parsedUserId = parseInt(userId || "0");
  const { user: currentUser } = useAuth();

  const { data: user } = trpc.profile.getUser.useQuery({ userId: parsedUserId });
  const { data: followers = [], isLoading } = trpc.follow.followers.useQuery({ userId: parsedUserId });

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
            <Users className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Seguidores</h1>
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
        ) : followers.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum seguidor ainda</h3>
              <p className="text-muted-foreground">
                {currentUser?.id === parsedUserId
                  ? "Você ainda não tem seguidores"
                  : "Este usuário ainda não tem seguidores"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {followers.map((follower) => (
              <Card key={follower.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Link href={`/user/${follower.id}`}>
                      <Avatar className="w-16 h-16 cursor-pointer hover:opacity-80 transition-opacity">
                        <AvatarImage src={follower.avatarUrl || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xl">
                          {follower.name?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/user/${follower.id}`}>
                        <h3 className="text-lg font-semibold hover:underline cursor-pointer">
                          {follower.name || "Usuário Anônimo"}
                        </h3>
                      </Link>
                      {follower.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {follower.bio}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2">
                        <Badge variant="secondary" className="gap-1">
                          <Trophy className="w-3 h-3" />
                          {follower.points || 0} pontos
                        </Badge>
                        <Badge variant="outline">
                          Nível {follower.level || 1}
                        </Badge>
                      </div>
                    </div>

                    <FollowButton userId={follower.id} />
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
