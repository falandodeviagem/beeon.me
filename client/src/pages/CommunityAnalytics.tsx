import { useState } from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Users, MessageSquare, Heart, Eye, Calendar } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function CommunityAnalytics() {
  const { communityId } = useParams<{ communityId: string }>();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const startDate = new Date();
  const endDate = new Date();
  
  if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  } else {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  const { data: community } = trpc.community.getById.useQuery({ 
    id: parseInt(communityId!) 
  });

  const { data: analytics } = trpc.analytics.getCommunityAnalytics.useQuery({
    communityId: parseInt(communityId!),
    startDate,
    endDate,
  });

  if (!community) {
    return <div>Carregando...</div>;
  }

  // Calculate totals
  const totals = analytics?.reduce(
    (acc, day) => ({
      views: acc.views + day.views,
      uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
      newPosts: acc.newPosts + day.newPosts,
      newComments: acc.newComments + day.newComments,
      totalLikes: acc.totalLikes + day.totalLikes,
      newMembers: acc.newMembers + day.newMembers,
      activeMembers: acc.activeMembers + day.activeMembers,
    }),
    {
      views: 0,
      uniqueVisitors: 0,
      newPosts: 0,
      newComments: 0,
      totalLikes: 0,
      newMembers: 0,
      activeMembers: 0,
    }
  ) || {
    views: 0,
    uniqueVisitors: 0,
    newPosts: 0,
    newComments: 0,
    totalLikes: 0,
    newMembers: 0,
    activeMembers: 0,
  };

  // Format data for charts
  const chartData = analytics?.map((day) => ({
    date: new Date(day.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
    views: day.views,
    visitors: day.uniqueVisitors,
    posts: day.newPosts,
    comments: day.newComments,
    likes: day.totalLikes,
    members: day.newMembers,
  })) || [];

  return (
    <div className="container max-w-7xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics - {community.name}</h1>
        <p className="text-muted-foreground">
          Acompanhe o crescimento e engajamento da sua comunidade
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={period === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPeriod('week')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Última Semana
        </Button>
        <Button
          variant={period === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPeriod('month')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Último Mês
        </Button>
        <Button
          variant={period === 'year' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPeriod('year')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Último Ano
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.views.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totals.uniqueVisitors.toLocaleString()} visitantes únicos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Novos Membros</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.newMembers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {community.memberCount} membros totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Posts</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.newPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totals.newComments.toLocaleString()} comentários
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Curtidas</CardTitle>
            <Heart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalLikes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total de curtidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="growth">Crescimento</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visualizações e Visitantes</CardTitle>
              <CardDescription>
                Acompanhe quantas pessoas estão visitando sua comunidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#F97316" 
                    name="Visualizações"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#FCD34D" 
                    name="Visitantes Únicos"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Curtidas por Dia</CardTitle>
              <CardDescription>
                Veja o engajamento dos membros com o conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="likes" fill="#F97316" name="Curtidas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crescimento de Membros</CardTitle>
              <CardDescription>
                Acompanhe o crescimento da sua comunidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="members" 
                    stroke="#F97316" 
                    name="Novos Membros"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Posts e Comentários</CardTitle>
              <CardDescription>
                Veja a atividade de criação de conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="posts" fill="#F97316" name="Posts" />
                  <Bar dataKey="comments" fill="#FCD34D" name="Comentários" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
