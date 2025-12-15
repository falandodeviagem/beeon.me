import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, Users, Trophy, UserPlus, Shield, LogOut, User, Search, Mail, Sun, Moon } from "lucide-react";
import { SoundToggle } from "@/components/SoundToggle";
import { GlobalSearch } from "@/components/GlobalSearch";
import NotificationPanel from "@/components/NotificationPanel";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logout realizado com sucesso");
      window.location.href = "/";
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const navItems = [
    { href: "/", label: "Início", icon: Home },
    { href: "/communities", label: "Comunidades", icon: Users },
    { href: "/search", label: "Buscar", icon: Search },
    { href: "/leaderboard", label: "Ranking", icon: Trophy },
    { href: "/invites", label: "Convites", icon: UserPlus },
    { href: "/messages", label: "Mensagens", icon: Mail },
  ];

  if (user?.role === "admin") {
    navItems.push({ href: "/moderation", label: "Moderação", icon: Shield });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-xl">🐝</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                BeeOn.me
              </span>
            </a>
          </Link>

          {/* Global Search */}
          {isAuthenticated && (
            <div className="flex-1 max-w-md mx-4">
              <GlobalSearch />
            </div>
          )}

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <a>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        className="gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    </a>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User menu */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-9 h-9"
              title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            {/* Sound toggle */}
            <SoundToggle />
            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/20">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{user.points || 0} pts</span>
                </div>
                
                <NotificationPanel />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl || undefined} alt={user.name || "User"} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">Nível {user.level || 1}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <a>
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          Meu Perfil
                        </DropdownMenuItem>
                      </a>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <a>
                  <Button>Entrar</Button>
                </a>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 BeeOn.me - Plataforma de Comunidades Online
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Termos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors">Suporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
