import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, Sparkles, Loader2, MessageCircle, Users, Brain, Share2, Copy, Check, Bell, Globe, Lock, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function MindEntity() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: entity, isLoading } = trpc.entity.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: completenessData } = trpc.profile.completeness.useQuery(undefined, { enabled: isAuthenticated });

  const [shareLink, setShareLink] = useState<{
    slug: string;
    slugUrl: string;
    shareToken: string;
    tokenUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState<"slug" | "token" | null>(null);

  const synthesizeMutation = trpc.entity.synthesize.useMutation({
    onSuccess: () => {
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

  const generateShareLinkMutation = trpc.entity.generateShareLink.useMutation({
    onSuccess: (data) => {
      setShareLink(data);
      utils.entity.get.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const weeklyPromptMutation = trpc.notifications.sendWeeklyMemoryPrompt.useMutation({
    onSuccess: (data) => toast.success(`Notification sent! Prompt: "${data.prompt}"`),
    onError: (e) => toast.error(e.message),
  });

  const copyToClipboard = async (path: string, type: "slug" | "token") => {
    try {
      await navigator.clipboard.writeText(window.location.origin + path);
      setCopied(type);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const completeness = completenessData?.completeness ?? 0;
  const canSynthesize = completeness >= 20;
  const entityActive = entity?.status === "active";

  // Use existing slug/token from entity if available
  const currentSlug = shareLink?.slug ?? entity?.slug;
  const currentToken = shareLink?.shareToken ?? entity?.shareToken;

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
            {/* Active Entity Hero */}
            <Card className="bg-card/50 border-primary/20 glow-teal mb-8">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{entity?.entityName || "Your Mind"}</h2>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">{entity?.entityBio}</p>
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground mb-6 flex-wrap">
                  <span>{entity?.totalConversations ?? 0} conversations</span>
                  <span className="text-border">|</span>
                  <span className="text-green-400">Active</span>
                  {entity?.isPublic && (
                    <>
                      <span className="text-border">|</span>
                      <span className="flex items-center gap-1 text-primary"><Globe className="h-3 w-3" /> Public</span>
                    </>
                  )}
                  {entity?.inCollective && (
                    <>
                      <span className="text-border">|</span>
                      <span className="text-[oklch(0.75_0.15_280)]">In The Human Mind</span>
                    </>
                  )}
                </div>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button size="lg" onClick={() => setLocation(`/chat/${entity?.id}`)} className="glow-teal">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Talk to Your Mind
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => generateShareLinkMutation.mutate()}
                    disabled={generateShareLinkMutation.isPending}
                  >
                    {generateShareLinkMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Share2 className="mr-2 h-4 w-4" />
                    )}
                    Share My Mind
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Share Links Card */}
            {(currentSlug || currentToken) && (
              <Card className="bg-card/50 border-primary/30 mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-primary" />
                    Shareable Links
                  </CardTitle>
                  <CardDescription>
                    Send these links to family and friends so they can talk with your mind entity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Public slug link */}
                  {currentSlug && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <Label className="text-sm font-medium">Public Link</Label>
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                          {entity?.isPublic ? "Visible in Ocean" : "Link only"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm font-mono text-muted-foreground truncate">
                          {window.location.origin}/mind/{currentSlug}
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyToClipboard(`/mind/${currentSlug}`, "slug")}
                        >
                          {copied === "slug" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => window.open(`/mind/${currentSlug}`, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Anyone with this link can view your mind profile and start a conversation.
                      </p>
                    </div>
                  )}

                  {/* Private token link */}
                  {currentToken && (
                    <div className="space-y-2 pt-3 border-t border-border/30">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-amber-400" />
                        <Label className="text-sm font-medium">Private Link</Label>
                        <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                          Token-protected
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm font-mono text-muted-foreground truncate">
                          {window.location.origin}/mind/token/{currentToken}
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyToClipboard(`/mind/token/${currentToken}`, "token")}
                        >
                          {copied === "token" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Use this for trusted family members — works even if your mind isn't set to public.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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

            {/* Weekly Memory Prompt */}
            <Card className="bg-card/50 border-border/50 mb-8">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      Weekly Memory Prompt
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Send yourself a notification with a memory prompt to keep your mind entity growing.
                      Each prompt is a thoughtful question to inspire a new memory.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => weeklyPromptMutation.mutate()}
                    disabled={weeklyPromptMutation.isPending}
                    className="shrink-0"
                  >
                    {weeklyPromptMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Bell className="mr-2 h-4 w-4" />
                    )}
                    Send Prompt
                  </Button>
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
