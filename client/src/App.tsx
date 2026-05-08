import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Amble from "@/pages/amble";
import Account from "@/pages/account";
import Start from "@/pages/start";
import Quiz from "@/pages/quiz";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import AmbleV2 from "@/pages/amble-v2";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/start" component={Start} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/login" component={Login} />
      <Route path="/amble" component={Amble} />
      <Route path="/amble-v2" component={AmbleV2} />
      <Route path="/account" component={Account} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
