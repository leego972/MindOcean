import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/ProfileSetup";
import Memories from "./pages/Memories";
import Assessments from "./pages/Assessments";
import BigFiveTest from "./pages/BigFiveTest";
import CognitiveTest from "./pages/CognitiveTest";
import CompetencyTest from "./pages/CompetencyTest";
import MindEntity from "./pages/MindEntity";
import ChatWithMind from "./pages/ChatWithMind";
import TheHumanMind from "./pages/TheHumanMind";
import Ocean from "./pages/Ocean";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={ProfileSetup} />
      <Route path="/memories" component={Memories} />
      <Route path="/assessments" component={Assessments} />
      <Route path="/assessments/big-five" component={BigFiveTest} />
      <Route path="/assessments/cognitive" component={CognitiveTest} />
      <Route path="/assessments/competency" component={CompetencyTest} />
      <Route path="/mind-entity" component={MindEntity} />
      <Route path="/chat/:id" component={ChatWithMind} />
      <Route path="/the-human-mind" component={TheHumanMind} />
      <Route path="/ocean" component={Ocean} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
