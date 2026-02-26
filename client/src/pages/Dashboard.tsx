import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  Brain, User, BookOpen, ClipboardCheck, Sparkles, MessageCircle,
  Users, ChevronRight, ArrowLeft, Waves
} from "lucide-react";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: completenessData } = trpc.profile.completeness.useQuery(undefined, { enabled: isAuthenticated });
  const { data: memories } = trpc.memories.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: assessments } = trpc.assessments.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: entity } = trpc.entity.get.useQuery(undefined, { enabled: isAuthenticated });

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen ocean-gradient flex items-center justify-center">
        <div className="animate-pulse-slow">
          <Brain className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  const completeness = completenessData?.completeness ?? 0;
  const memoryCount = memories?.length ?? 0;
  const assessmentTypes = assessments?.map(a => a.assessmentType) ?? [];
  const hasBigFive = assessmentTypes.includes("big_five");
  const hasCognitive = assessmentTypes.includes("cognitive");
  const hasCompetency = assessmentTypes.includes("competency");
  const entityActive = entity?.status === "active";

  return (
    <div className="min-h-screen ocean-gradient">
      {/* Top bar */}
      <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold">My Mind</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Welcome, {user?.name || "Explorer"}</span>
            {entityActive && (
              <Button size="sm" variant="outline" onClick={() => setLocation(`/chat/${entity?.id}`)}>
                <MessageCircle className="mr-1 h-4 w-4" /> Talk to My Mind
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="container py-8">
        {/* Completeness Overview */}
        <Card className="mb-8 bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Mind Entity Progress</h2>
                <p className="text-muted-foreground mt-1">
                  {completeness < 30 ? "Just getting started — tell us about yourself" :
                   completeness < 60 ? "Good progress — keep adding depth to your mind" :
                   completeness < 90 ? "Almost there — a few more pieces to complete your mind" :
                   "Your mind is ready to be synthesized!"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-primary">{completeness}%</span>
              </div>
            </div>
            <Progress value={completeness} className="h-3" />
          </CardContent>
        </Card>

        {/* Action Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile */}
          <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-pointer group" onClick={() => setLocation("/profile")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <CardTitle className="mt-4">Your Profile</CardTitle>
              <CardDescription>
                {profile ? "Edit your life story, values, and personality details" : "Start by telling us who you are"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {profile ? (
                  <span className="text-primary">Profile created — tap to enhance</span>
                ) : (
                  <span>Not started yet</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Memories */}
          <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-pointer group" onClick={() => setLocation("/memories")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-[oklch(0.80_0.14_60)]/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-[oklch(0.80_0.14_60)]" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <CardTitle className="mt-4">Memories</CardTitle>
              <CardDescription>
                Record the moments that shaped who you are
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <span className="text-primary font-medium">{memoryCount}</span>
                <span className="text-muted-foreground"> memories recorded</span>
              </div>
            </CardContent>
          </Card>

          {/* Assessments */}
          <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-pointer group" onClick={() => setLocation("/assessments")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-[oklch(0.75_0.15_280)]/10 flex items-center justify-center">
                  <ClipboardCheck className="h-5 w-5 text-[oklch(0.75_0.15_280)]" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <CardTitle className="mt-4">Assessments</CardTitle>
              <CardDescription>
                Psychological, cognitive, and competency evaluations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 text-sm">
                <span className={hasBigFive ? "text-primary" : "text-muted-foreground"}>
                  {hasBigFive ? "✓" : "○"} Big Five
                </span>
                <span className={hasCognitive ? "text-primary" : "text-muted-foreground"}>
                  {hasCognitive ? "✓" : "○"} Cognitive
                </span>
                <span className={hasCompetency ? "text-primary" : "text-muted-foreground"}>
                  {hasCompetency ? "✓" : "○"} Competency
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Mind Entity */}
          <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-pointer group" onClick={() => setLocation("/mind-entity")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center glow-teal">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <CardTitle className="mt-4">Mind Entity</CardTitle>
              <CardDescription>
                {entityActive ? "Your mind entity is alive and active" : "Synthesize your data into a living mind"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {entityActive ? (
                  <span className="text-primary font-medium">Active — {entity?.totalConversations ?? 0} conversations</span>
                ) : (
                  <span className="text-muted-foreground">
                    {completeness >= 30 ? "Ready to synthesize" : "Complete more of your profile first"}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* The Human Mind */}
          <Card className="bg-card/50 border-border/50 hover:border-[oklch(0.75_0.15_280)]/30 transition-all cursor-pointer group" onClick={() => setLocation("/the-human-mind")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-[oklch(0.75_0.15_280)]/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-[oklch(0.75_0.15_280)]" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[oklch(0.75_0.15_280)] transition-colors" />
              </div>
              <CardTitle className="mt-4">The Human Mind</CardTitle>
              <CardDescription>
                The democratic collective of preserved minds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {entity?.inCollective ? (
                  <span className="text-[oklch(0.75_0.15_280)] font-medium">You have taken your seat</span>
                ) : (
                  <span>Join the collective assembly</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* The Ocean */}
          <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-pointer group" onClick={() => setLocation("/ocean")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Waves className="h-5 w-5 text-primary" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <CardTitle className="mt-4">The Ocean</CardTitle>
              <CardDescription>
                Browse minds swimming in the MindOcean
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Explore public mind entities
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
