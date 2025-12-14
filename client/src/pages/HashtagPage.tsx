import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import PostCard from "@/components/PostCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hash, Loader2 } from "lucide-react";

export default function HashtagPage() {
  const params = useParams();
  const tag = params.tag || "";

  const { data: posts, isLoading } = trpc.hashtags.byTag.useQuery({ tag });

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Hash className="w-8 h-8 text-primary" />
              #{tag}
            </CardTitle>
            <p className="text-muted-foreground">
              {posts && posts.length > 0
                ? `${posts.length} posts encontrados`
                : "Nenhum post encontrado"}
            </p>
          </CardHeader>
        </Card>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && posts && posts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Hash className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum post encontrado</h3>
              <p className="text-muted-foreground">
                Ainda não há posts com esta hashtag. Seja o primeiro a usá-la!
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && posts && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
