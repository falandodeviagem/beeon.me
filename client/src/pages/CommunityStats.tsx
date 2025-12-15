import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, TrendingUp, Users, FileText, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function CommunityStats() {
  const { id } = useParams<{ id: string }>();
  const communityId = parseInt(id || "0");
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");

  const { data: community } = trpc.community.getById.useQuery({ id: communityId });
  const { data: stats, isLoading } = trpc.community.getStats.useQuery({
    communityId,
    days: parseInt(period),
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats || !community) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Estatísticas não disponíveis</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const membersChartData = {
    labels: stats.newMembersPerDay.map((d) => new Date(d.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Novos Membros',
        data: stats.newMembersPerDay.map((d) => d.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const postsChartData = {
    labels: stats.postsPerWeek.map((d) => `Semana ${d.week.toString().slice(-2)}`),
    datasets: [
      {
        label: 'Posts Criados',
        data: stats.postsPerWeek.map((d) => d.count),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  const totalMembers = stats.newMembersPerDay.reduce((sum, d) => sum + d.count, 0);
  const totalPosts = stats.postsPerWeek.reduce((sum, d) => sum + d.count, 0);
  const avgEngagement = (stats.engagement.avgLikes + stats.engagement.avgComments).toFixed(1);

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href={`/community/${communityId}`}>
              <a>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </a>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{community.name}</h1>
              <p className="text-muted-foreground">Estatísticas da Comunidade</p>
            </div>
          </div>
        </div>

        <Select value={period} onValueChange={(v) => setPeriod(v as "7" | "30" | "90")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              nos últimos {period} dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Criados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              nos últimos {period} dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagement}</div>
            <p className="text-xs text-muted-foreground">
              curtidas + comentários por post
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Membros</CardTitle>
            <CardDescription>Novos membros por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line data={membersChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade de Posts</CardTitle>
            <CardDescription>Posts criados por semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={postsChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detalhes de Engajamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total de Posts</p>
              <p className="text-2xl font-bold">{stats.engagement.totalPosts}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Média de Curtidas</p>
              <p className="text-2xl font-bold">{stats.engagement.avgLikes.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Média de Comentários</p>
              <p className="text-2xl font-bold">{stats.engagement.avgComments.toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
