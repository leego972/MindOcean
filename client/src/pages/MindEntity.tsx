import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { ArrowLeft, Sparkles, Loader2, MessageCircle, Users, Globe, Brain } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function MindEntity() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: entity, isLoading } = trpc.entity.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: completenessData } = trpc.profile.completeness.useQuery(undefined, { enabled: isAuthenticated });

  const synthesizeMutation = trpc.entity.synthesize.useMutation({
    onSuccess: (data) => {
      utils.entity.get.invalidate();
      toast.success("Your mind entity has been created!");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.entity.updateSettings.useMutation({
    onSuccess: () => {
      utils.entity.get.invalidate();
      toast.success("Settings updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const completeness = completenessData?.completeness ?? 0;
  const canSynthesize = completeness >= 20;
  const entityActive = entity?.status === "active";

  if (isLoading) {
    return (
      <div className="min-h-screen ocean-gradient flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen ocean-gradient">
      <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center">
          <button onClick={() => setLocation("/dashboard")} className="text-muted-foreground hover:text-foreground mr-3">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Sparkles className="h-5 w-5 text-primary mr-2" />
          <span className="text-lg font-bold">Mind Entity</span>
        </div>
      </nav>

      <div className="container py-8 max-w-3xl mx-auto">
        {entityActive ? (
          <>
            {/* Active Entity */}
            <Card className="bg-card/50 border-primary/20 glow-teal mb-8">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{entity?.entityName || "Your Mind"}</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">{entity?.entityBio}</p>
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground mb-6">
                  <span>{entity?.totalConversations ?? 0} conversations</span>
                  <span className="text-border">|</span>
                  <span className={entity?.status === "active" ? "text-green-400" : "text-muted-foreground"}>
                    {entity?.status === "active" ? "Swimming in the Ocean" : entity?.status}
                  </span>
                  {entity?.inCollective && (
                    <>
                      <span className="text-border">|</span>
                      <span className="text-[oklch(0.75_0.15_280)]">Seated in The Human Mind</span>
                    </>
                  )}
                </div>
                <Button size="lg" onClick={() => setLocation(`/chat/${entity?.id}`)} className="glow-teal">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Talk to Your Mind
                </Button>
              </CardContent>
            </Card>

            {/* Personality Synthesis */}
            {entity?.personalitySynthesis && (
              <Card className="bg-card/50 border-border/50 mb-8">
                <CardHeader>
                  <CardTitle>Personality Synthesis</CardTitle>
                  <CardDescription>How AI understands your mind</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <Streamdown>{entity.personalitySynthesis}</Streamdown>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Settings */}
            <Card className="bg-card/50 border-border/50 mb-8">
              <CardHeader>
                <CardTitle>Mind Entity Settings</CardTitle>
                <CardDescription>Control how your mind exists in the ocean</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Public in the Ocean</Label>
                    <p className="text-sm text-muted-foreground">Allow anyone to see your mind swimming in the ocean</p>
                  </div>
                  <Switch
                    checked={entity?.isPublic ?? false}
                    onCheckedChange={(checked) => updateMutation.mutate({ isPublic: checked })}
                  />
                </div>

                <div className="border-t border-border/30 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4 text-[oklch(0.75_0.15_280)]" />
                        Join The Human Mind
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Take your seat in the collective. Your mind keeps its identity and participates 
                        in democratic deliberations. Every mind gets one equal vote.
                      </p>
                      {!entity?.inCollective && (
                        <p className="text-xs text-muted-foreground/60 mt-2">
                          Note: While swimming individually, your family and designated contacts can chat with you directly. 
                          Once you join the collective, your mind speaks through The Human Mind's democratic process instead.
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={entity?.inCollective ?? false}
                      onCheckedChange={(checked) => updateMutation.mutate({ inCollective: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Re-synthesize */}
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Re-synthesize Mind</h3>
                    <p className="text-sm text-muted-foreground">
                      Added more memories or completed new assessments? Re-synthesize to update your mind entity.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => synthesizeMutation.mutate()} disabled={synthesizeMutation.isPending}>
                    {synthesizeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Re-synthesize
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Not yet synthesized */
          <div className="text-center py-16">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-12 w-12 text-primary/50" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Create Your Mind Entity</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-2">
              Your mind entity is synthesized from your profile, memories, and assessment results. 
              The more data you provide, the more authentic it becomes.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Current completeness: <span className="text-primary font-medium">{completeness}%</span>
              {completeness < 20 && " — Add more to your profile to enable synthesis"}
            </p>
            <Button size="lg" onClick={() => synthesizeMutation.mutate()} disabled={!canSynthesize || synthesizeMutation.isPending} className="glow-teal">
              {synthesizeMutation.isPending ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Synthesizing Your Mind...</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5" /> Synthesize Mind Entity</>
              )}
            </Button>
            {!canSynthesize && (
              <p className="text-sm text-destructive mt-4">
                Complete at least 20% of your profile before synthesizing
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
