import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SkipToContent } from "./components/SkipToContent";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Eager load critical pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";

// Lazy load non-critical pages
const NotFound = lazy(() => import("./pages/NotFound"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Followers = lazy(() => import("./pages/Followers"));
const Following = lazy(() => import("./pages/Following"));
const Messages = lazy(() => import("./pages/Messages"));
const Profile = lazy(() => import("./pages/Profile"));
const Communities = lazy(() => import("./pages/Communities"));
const CommunityDetail = lazy(() => import("./pages/CommunityDetail"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Invites = lazy(() => import("./pages/Invites"));
const Moderation = lazy(() => import("./pages/Moderation"));
const Search = lazy(() => import("./pages/Search"));
const AdvancedSearch = lazy(() => import("./pages/AdvancedSearch"));
const PostView = lazy(() => import("./pages/PostView"));
const HashtagPage = lazy(() => import("./pages/HashtagPage"));
const CommunityStats = lazy(() => import("./pages/CommunityStats"));
const Notifications = lazy(() => import("./pages/Notifications"));
const BanAppeal = lazy(() => import("./pages/BanAppeal"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const ModerationAnalytics = lazy(() => import("./pages/ModerationAnalytics"));
const ResponseTemplates = lazy(() => import("./pages/ResponseTemplates"));
const UserInsights = lazy(() => import("./pages/UserInsights"));
const CommunityRevenue = lazy(() => import("./pages/CommunityRevenue"));
const PaymentHistory = lazy(() => import("./pages/PaymentHistory"));
const ManagePlans = lazy(() => import("./pages/ManagePlans"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container max-w-6xl space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/login" component={Login} />
        <Route path="/profile" component={Profile} />
        <Route path="/profile/payments" component={PaymentHistory} />
        <Route path="/communities" component={Communities} />
        <Route path="/community/:id" component={CommunityDetail} />
        <Route path="/community/:id/stats" component={CommunityStats} />
        <Route path="/community/:id/revenue" component={CommunityRevenue} />
        <Route path="/community/:id/plans" component={ManagePlans} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/invites" component={Invites} />
        <Route path="/search" component={Search} />
        <Route path="/search/advanced" component={AdvancedSearch} />
        <Route path="/post/:id" component={PostView} />
        <Route path="/hashtag/:tag" component={HashtagPage} />
        <Route path="/user/:userId" component={UserProfile} />
        <Route path="/user/:userId/followers" component={Followers} />
        <Route path="/user/:userId/following" component={Following} />
        <Route path="/messages" component={Messages} />
        <Route path="/moderation" component={Moderation} />
        <Route path="/moderation/appeals" component={BanAppeal} />
        <Route path="/moderation/audit-logs" component={AuditLogs} />
        <Route path="/moderation/analytics" component={ModerationAnalytics} />
        <Route path="/moderation/templates" component={ResponseTemplates} />
        <Route path="/moderation/user-insights" component={UserInsights} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <SkipToContent />
      <OfflineIndicator />
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
