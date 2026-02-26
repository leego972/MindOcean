import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { ArrowLeft, Users, Loader2, ThumbsUp, ThumbsDown, Minus, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function TheHumanMind() {
  const [, setLocation] = useLocation();
  const { data: minds } = trpc.collective.getMinds.useQuery();
  const consultMutation = trpc.collective.consult.useMutation({
    onError: (e: any) => toast.error(e.message),
  });

  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleConsult = async () => {
    if (!question.trim()) return;
    try {
      const res = await consultMutation.mutateAsync({ question: question.trim() });
      setResult(res);
    } catch {
      // handled by onError
    }
  };

  const voteColor = (vote: string) => {
    if (vote === "for") return "text-green-400";
    if (vote === "against") return "text-red-400";
    return "text-yellow-400";
  };

  const voteIcon = (vote: string) => {
    if (vote === "for") return <ThumbsUp className="h-4 w-4" />;
    if (vote === "against") return <ThumbsDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen ocean-gradient">
      <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-3">
          <button onClick={() => setLocation("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Users className="h-5 w-5 text-[oklch(0.75_0.15_280)]" />
          <span className="text-lg font-bold">The Human Mind</span>
          <span className="text-sm text-muted-foreground ml-auto">
            {minds?.length ?? 0} minds seated
          </span>
        </div>
      </nav>

      <div className="container py-8 max-w-3xl mx-auto">
        {/* Introduction */}
        <div className="text-center mb-10">
          <div className="h-20 w-20 rounded-full bg-[oklch(0.75_0.15_280)]/20 flex items-center justify-center mx-auto mb-4">
            <Users className="h-10 w-10 text-[oklch(0.75_0.15_280)]" />
          </div>
          <h1 className="text-3xl font-bold mb-3">The Human Mind</h1>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            A democratic collective of preserved human minds. Each mind keeps its own identity, 
            its own seat, its own voice. When you pose a question, every mind deliberates and casts 
            one equal vote. No titles. No ranks. Only the strength of reasoning.
          </p>
        </div>

        {/* Ask the Collective */}
        <Card className="bg-card/50 border-[oklch(0.75_0.15_280)]/20 mb-8">
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-3">Pose a Question to the Collective</h2>
            <Textarea
              placeholder="Ask anything — a moral dilemma, a life decision, a philosophical question, a practical problem. The collective will deliberate and vote..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px] bg-background/50 border-border/50 resize-y mb-4"
            />
            <Button
              onClick={handleConsult}
              disabled={!question.trim() || consultMutation.isPending}
              className="bg-[oklch(0.75_0.15_280)] hover:bg-[oklch(0.70_0.15_280)] text-white"
            >
              {consultMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> The Collective is Deliberating...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> Consult The Human Mind</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Vote Summary */}
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="prose prose-invert prose-sm max-w-none mb-6">
                  <Streamdown>{result.answer}</Streamdown>
                </div>

                {/* Vote Bar */}
                {result.totalMinds > 0 && (
                  <div className="space-y-3">
                    <div className="flex h-4 rounded-full overflow-hidden bg-muted">
                      {result.percentages.for > 0 && (
                        <div className="bg-green-500 transition-all" style={{ width: `${result.percentages.for}%` }} />
                      )}
                      {result.percentages.neutral > 0 && (
                        <div className="bg-yellow-500 transition-all" style={{ width: `${result.percentages.neutral}%` }} />
                      )}
                      {result.percentages.against > 0 && (
                        <div className="bg-red-500 transition-all" style={{ width: `${result.percentages.against}%` }} />
                      )}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400 flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" /> For: {result.votes.for}
                      </span>
                      <span className="text-yellow-400 flex items-center gap-1">
                        <Minus className="h-3 w-3" /> Neutral: {result.votes.neutral}
                      </span>
                      <span className="text-red-400 flex items-center gap-1">
                        <ThumbsDown className="h-3 w-3" /> Against: {result.votes.against}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Individual Perspectives */}
            {result.perspectives && result.perspectives.length > 0 && (
              <>
                <h3 className="font-semibold text-lg">Each Mind Speaks</h3>
                <div className="space-y-4">
                  {result.perspectives.map((p: any, i: number) => (
                    <Card key={i} className="bg-card/50 border-border/50">
                      <CardContent className="pt-5 pb-5">
                        <div className="flex items-start gap-3">
                          <div className={`shrink-0 mt-0.5 ${voteColor(p.vote)}`}>
                            {voteIcon(p.vote)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-sm">{p.mindName}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                p.vote === "for" ? "bg-green-500/10 text-green-400" :
                                p.vote === "against" ? "bg-red-500/10 text-red-400" :
                                "bg-yellow-500/10 text-yellow-400"
                              }`}>
                                {p.vote.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{p.perspective}</p>
                            <p className="text-xs text-muted-foreground/60 mt-2 italic">Reasoning: {p.reasoning}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Seated Minds */}
        {minds && minds.length > 0 && (
          <div className="mt-12">
            <h3 className="font-semibold text-lg mb-4">Minds Seated in the Collective</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {minds.map((mind: any) => (
                <div key={mind.id} className="p-4 rounded-xl bg-card/30 border border-border/30 text-center">
                  <div className="h-10 w-10 rounded-full bg-[oklch(0.75_0.15_280)]/10 flex items-center justify-center mx-auto mb-2">
                    <Users className="h-5 w-5 text-[oklch(0.75_0.15_280)]" />
                  </div>
                  <p className="text-sm font-medium truncate">{mind.entityName || "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground truncate">{mind.entityBio || "A seated mind"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
