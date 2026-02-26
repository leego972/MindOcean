import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, ClipboardCheck, Brain, Zap, Target, CheckCircle2, ChevronRight } from "lucide-react";

export default function Assessments() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: assessments } = trpc.assessments.list.useQuery(undefined, { enabled: isAuthenticated });

  const types = assessments?.map(a => a.assessmentType) ?? [];
  const hasBigFive = types.includes("big_five");
  const hasCognitive = types.includes("cognitive");
  const hasCompetency = types.includes("competency");

  const tests = [
    {
      id: "big-five",
      title: "Big Five Personality",
      description: "Measures your Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism — the gold standard in personality psychology.",
      icon: Brain,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "hover:border-primary/30",
      completed: hasBigFive,
      time: "5-8 minutes",
    },
    {
      id: "cognitive",
      title: "Cognitive Style",
      description: "Evaluates how you process information, solve problems, and make decisions. Maps your thinking patterns and reasoning approach.",
      icon: Zap,
      color: "text-[oklch(0.75_0.15_280)]",
      bgColor: "bg-[oklch(0.75_0.15_280)]/10",
      borderColor: "hover:border-[oklch(0.75_0.15_280)]/30",
      completed: hasCognitive,
      time: "5-8 minutes",
    },
    {
      id: "competency",
      title: "Competency & Strengths",
      description: "Identifies your areas of expertise, natural talents, and the domains where your advice carries the weight of real experience.",
      icon: Target,
      color: "text-[oklch(0.80_0.14_60)]",
      bgColor: "bg-[oklch(0.80_0.14_60)]/10",
      borderColor: "hover:border-[oklch(0.80_0.14_60)]/30",
      completed: hasCompetency,
      time: "5-8 minutes",
    },
  ];

  return (
    <div className="min-h-screen ocean-gradient">
      <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center">
          <button onClick={() => setLocation("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors mr-3">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <ClipboardCheck className="h-5 w-5 text-[oklch(0.75_0.15_280)] mr-2" />
          <span className="text-lg font-bold">Assessments</span>
        </div>
      </nav>

      <div className="container py-8 max-w-3xl mx-auto">
        <p className="text-muted-foreground mb-8">
          These scientifically-grounded assessments map how you think, feel, and relate to the world. 
          Each one adds a critical dimension to your mind entity — making it think and decide the way you actually do, 
          not just repeat what you've said.
        </p>

        <div className="space-y-6">
          {tests.map((test) => (
            <Card key={test.id} className={`bg-card/50 border-border/50 ${test.borderColor} transition-all cursor-pointer group`} onClick={() => setLocation(`/assessments/${test.id}`)}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                  <div className={`h-14 w-14 rounded-xl ${test.bgColor} flex items-center justify-center shrink-0`}>
                    <test.icon className={`h-7 w-7 ${test.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{test.title}</h3>
                      {test.completed && (
                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Completed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{test.description}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">Estimated time: {test.time}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-6 rounded-xl bg-card/30 border border-border/30">
          <h3 className="font-medium mb-2">Why these tests matter</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your profile tells us what you think and believe. Your memories tell us what you've experienced. 
            But these assessments tell us <em>how</em> you think — your cognitive patterns, emotional responses, 
            and natural strengths. Together, they create a mind entity that doesn't just know your opinions, 
            but actually reasons the way you do.
          </p>
        </div>
      </div>
    </div>
  );
}
