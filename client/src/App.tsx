import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import UserProfile from "@/pages/UserProfile";
import Followers from "@/pages/Followers";
import Following from "@/pages/Following";
import Messages from "@/pages/Messages";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SkipToContent } from "./components/SkipToContent";
import { OfflineIndicator } from "./components/OfflineIndicator";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Communities from "./pages/Communities";
import CommunityDetail from "./pages/CommunityDetail";
import Leaderboard from "./pages/Leaderboard";
import Invites from "./pages/Invites";
import Moderation from "./pages/Moderation";
import Search from "./pages/Search";
import AdvancedSearch from "./pages/AdvancedSearch";
import PostView from "./pages/PostView";
import HashtagPage from "./pages/HashtagPage";
import Onboarding from "./pages/Onboarding";
import CommunityStats from "./pages/CommunityStats";
import Notifications from "./pages/Notifications";
import BanAppeal from "./pages/BanAppeal";
import AuditLogs from "./pages/AuditLogs";
import ModerationAnalytics from "./pages/ModerationAnalytics";
import ResponseTemplates from "./pages/ResponseTemplates";
import UserInsights from "./pages/UserInsights";
import CommunityRevenue from "./pages/CommunityRevenue";
import PaymentHistory from "./pages/PaymentHistory";
import ManagePlans from "./pages/ManagePlans";

function Router() {
  return (
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
