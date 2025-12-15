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
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Communities from "./pages/Communities";
import CommunityDetail from "./pages/CommunityDetail";
import Leaderboard from "./pages/Leaderboard";
import Invites from "./pages/Invites";
import Moderation from "./pages/Moderation";
import Search from "./pages/Search";
import HashtagPage from "./pages/HashtagPage";
import Onboarding from "./pages/Onboarding";
import CommunityStats from "./pages/CommunityStats";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/login" component={Login} />
      <Route path="/profile" component={Profile} />
      <Route path="/communities" component={Communities} />
      <Route path="/community/:id" component={CommunityDetail} />
      <Route path="/community/:id/stats" component={CommunityStats} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/invites" component={Invites} />
      <Route path="/search" component={Search} />
      <Route path="/hashtag/:tag" component={HashtagPage} />
      <Route path="/user/:userId" component={UserProfile} />
      <Route path="/user/:userId/followers" component={Followers} />
      <Route path="/user/:userId/following" component={Following} />
      <Route path="/messages" component={Messages} />
      <Route path="/moderation" component={Moderation} />
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
