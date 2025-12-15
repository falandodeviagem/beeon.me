import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  CreditCard, 
  Loader2, 
  ExternalLink,
  Receipt,
  Calendar
} from "lucide-react";

export default function PaymentHistory() {
  const { isAuthenticated } = useAuth();

  const { data: payments, isLoading } = trpc.user.getPaymentHistory.useQuery(
    { limit: 100 },
    { enabled: isAuthenticated }
  );

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Pago</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'refunded':
        return <Badge variant="outline">Reembolsado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-xl font-semibold mb-2">Faça login para ver seu histórico</h3>
              <Link href="/">
                <Button variant="outline">Voltar para início</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Histórico de Pagamentos</h1>
            <p className="text-muted-foreground">Suas assinaturas e transações</p>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Resumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total de Pagamentos</p>
                <p className="text-2xl font-bold">{payments?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Gasto</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    payments?.reduce((acc, p) => p.status === 'completed' ? acc + p.amount : acc, 0) || 0
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Comunidades Ativas</p>
                <p className="text-2xl font-bold">
                  {new Set(payments?.filter(p => p.status === 'completed').map(p => p.communityId)).size || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Último Pagamento</p>
                <p className="text-lg font-medium">
                  {payments && payments.length > 0 
                    ? formatDate(payments[0].createdAt)
                    : '-'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <Card>
          <CardHeader>
            <CardTitle>Transações</CardTitle>
            <CardDescription>Histórico completo de pagamentos</CardDescription>
          </CardHeader>
          <CardContent>
            {payments && payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div 
                    key={payment.id} 
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={payment.communityImage || undefined} />
                      <AvatarFallback>
                        {payment.communityName?.[0]?.toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/community/${payment.communityId}`}>
                          <span className="font-medium hover:underline cursor-pointer">
                            {payment.communityName || 'Comunidade'}
                          </span>
                        </Link>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(payment.createdAt)}</span>
                        {payment.periodStart && payment.periodEnd && (
                          <span className="text-xs">
                            (Período: {new Date(payment.periodStart).toLocaleDateString('pt-BR')} - {new Date(payment.periodEnd).toLocaleDateString('pt-BR')})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(payment.amount)}
                      </p>
                      {payment.stripeInvoiceUrl && (
                        <a 
                          href={payment.stripeInvoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 justify-end"
                        >
                          <Receipt className="w-3 h-3" />
                          Ver fatura
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhum pagamento encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Você ainda não fez nenhuma assinatura de comunidade paga.
                </p>
                <Link href="/communities">
                  <Button>Explorar Comunidades</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
