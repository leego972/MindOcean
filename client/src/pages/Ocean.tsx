import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Waves, Brain, MessageCircle, Users } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function Ocean() {
  const [, setLocation] = useLocation();
  const { data, isLoading } = trpc.ocean.browse.useQuery();

  return (
    <div className="min-h-screen ocean-gradient">
      <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-3">
          <button onClick={() => setLocation("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Waves className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold">The Ocean</span>
        </div>
      </nav>

      <div className="container py-8 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">The Mind Ocean</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Every mind here is swimming — alive, individual, carrying the full identity of the person it represents. 
            Find a mind and start a conversation.
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-10">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{data?.swimmingMinds?.length ?? 0}</p>
            <p className="text-sm text-muted-foreground">Minds Swimming</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[oklch(0.75_0.15_280)]">{data?.collectiveCount ?? 0}</p>
            <p className="text-sm text-muted-foreground">In The Human Mind</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data?.swimmingMinds && data.swimmingMinds.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.swimmingMinds.map((mind) => (
              <Card key={mind.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => setLocation(`/chat/${mind.id}`)}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                      mind.inCollective
                        ? "bg-[oklch(0.75_0.15_280)]/20"
                        : "bg-primary/20"
                    }`}>
                      {mind.inCollective ? (
                        <Users className="h-6 w-6 text-[oklch(0.75_0.15_280)]" />
                      ) : (
                        <Brain className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{mind.name || "Anonymous Mind"}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{mind.bio || "A mind swimming in the ocean"}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {mind.conversations ?? 0}
                        </span>
                        {mind.inCollective && (
                          <span className="text-[oklch(0.75_0.15_280)]">Seated in Collective</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Waves className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">The Ocean is Quiet</h3>
            <p className="text-muted-foreground mb-6">No public minds are swimming yet. Be the first to create your mind entity and make it public.</p>
            <Button onClick={() => setLocation("/dashboard")}>Create Your Mind</Button>
          </div>
        )}

        {/* Link to Collective */}
        <div className="mt-12 text-center">
          <Card className="bg-card/30 border-[oklch(0.75_0.15_280)]/20 inline-block">
            <CardContent className="pt-6 pb-6 px-8">
              <Users className="h-8 w-8 text-[oklch(0.75_0.15_280)] mx-auto mb-3" />
              <h3 className="font-semibold mb-2">The Human Mind Collective</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Consult the democratic assembly of minds — where every voice is heard and every vote is equal.
              </p>
              <Button variant="outline" onClick={() => setLocation("/the-human-mind")}
                className="border-[oklch(0.75_0.15_280)]/30 hover:bg-[oklch(0.75_0.15_280)]/10">
                Visit The Human Mind
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
