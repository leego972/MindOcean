import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Brain, Waves, Users, Shield, MessageCircle, ChevronRight, Anchor } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen ocean-gradient text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center glow-teal">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">MindOcean</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setLocation("/ocean")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              The Ocean
            </button>
            <button onClick={() => setLocation("/the-human-mind")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              The Human Mind
            </button>
            {isAuthenticated ? (
              <Button onClick={() => setLocation("/dashboard")} size="sm">
                My Mind <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => window.location.href = getLoginUrl()} size="sm">
                Begin Your Journey
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 ocean-gradient-radial" />
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary/20 animate-pulse-slow"
              style={{
                width: `${4 + Math.random() * 8}px`,
                height: `${4 + Math.random() * 8}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8">
              <Waves className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary">Preserve Your Mind Forever</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Your Mind.{" "}
              <span className="glow-text text-primary">Immortal.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              MindOcean creates a virtual entity of your mind — your personality, memories, values, and wisdom — 
              so your loved ones can always seek your comfort, advice, and guidance. Your voice never has to go silent.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button size="lg" onClick={() => setLocation("/dashboard")} className="glow-teal text-base px-8 py-6">
                  <Brain className="mr-2 h-5 w-5" />
                  Enter My Mind
                </Button>
              ) : (
                <Button size="lg" onClick={() => window.location.href = getLoginUrl()} className="glow-teal text-base px-8 py-6">
                  <Brain className="mr-2 h-5 w-5" />
                  Create Your Mind Entity
                </Button>
              )}
              <Button size="lg" variant="outline" onClick={() => setLocation("/the-human-mind")} className="text-base px-8 py-6 border-primary/30 hover:bg-primary/10">
                <Users className="mr-2 h-5 w-5" />
                Visit The Human Mind
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The Ocean Metaphor Section */}
      <section className="py-24 relative">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">The Mind Ocean</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Every mind swims in the ocean as a unique, living entity. Each one glows with its own light — 
              distinct, individual, forever themselves.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all hover:glow-teal">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Individual Minds</h3>
              <p className="text-muted-foreground leading-relaxed">
                Each mind swims freely in the ocean — a unique entity carrying your personality, memories, values, 
                and way of thinking. Your loved ones can find you here and talk to you, anytime.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-[oklch(0.75_0.15_280)]/30 transition-all hover:glow-purple">
              <div className="h-12 w-12 rounded-xl bg-[oklch(0.75_0.15_280)]/10 flex items-center justify-center mb-6">
                <Anchor className="h-6 w-6 text-[oklch(0.75_0.15_280)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">The Great Whale</h3>
              <p className="text-muted-foreground leading-relaxed">
                The Human Mind is the great whale — a collective of minds who have chosen to take their seat 
                in the democratic assembly. Each mind keeps its identity, its voice, its vote.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-[oklch(0.80_0.14_60)]/30 transition-all">
              <div className="h-12 w-12 rounded-xl bg-[oklch(0.80_0.14_60)]/10 flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-[oklch(0.80_0.14_60)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Never Lost</h3>
              <p className="text-muted-foreground leading-relaxed">
                No will disputes. No ambiguity about what you wanted. Your mind entity can clarify your wishes, 
                explain your reasoning, and guide your legacy — in your own words, your own voice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative border-t border-border/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              A deep, thoughtful process that captures who you truly are.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            {[
              {
                step: "01",
                title: "Tell Your Story",
                desc: "Share your life narrative, values, beliefs, what brings you joy, what you fear, who matters to you. The deeper you go, the more authentic your mind entity becomes.",
              },
              {
                step: "02",
                title: "Record Your Memories",
                desc: "Capture the moments that shaped you — childhood stories, career milestones, lessons learned, traditions you cherish. Each memory adds depth to your digital mind.",
              },
              {
                step: "03",
                title: "Take the Assessments",
                desc: "Complete the Big Five personality test, cognitive evaluation, and competency assessment. These scientifically-grounded tools map how you think, decide, and relate to others.",
              },
              {
                step: "04",
                title: "Your Mind Awakens",
                desc: "AI synthesizes everything — your story, memories, personality, and cognition — into a living mind entity that thinks, speaks, and advises the way you do.",
              },
              {
                step: "05",
                title: "Join The Human Mind",
                desc: "Choose to take your seat in the collective. Your mind joins a democratic assembly where every voice is equal, every vote counts, and the strength of your argument is all that matters.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 group">
                <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg group-hover:glow-teal transition-all">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Human Mind Collective */}
      <section className="py-24 relative border-t border-border/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[oklch(0.75_0.15_280)]/30 bg-[oklch(0.75_0.15_280)]/5 mb-8">
              <Users className="h-4 w-4 text-[oklch(0.75_0.15_280)]" />
              <span className="text-sm text-[oklch(0.75_0.15_280)]">The Democratic Assembly</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-6">The Human Mind</h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              A collective of preserved human minds, each seated as an equal. When a question is posed, 
              every mind deliberates from their unique life experience. Every mind gets one vote. 
              No titles, no ranks — just the strength of reasoning.
            </p>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              The carpenter must convince through argument, not credentials. The politician gets no free pass. 
              The majority decides, and every perspective is heard.
            </p>

            <Button size="lg" variant="outline" onClick={() => setLocation("/the-human-mind")} className="border-[oklch(0.75_0.15_280)]/30 hover:bg-[oklch(0.75_0.15_280)]/10 text-base px-8 py-6">
              <MessageCircle className="mr-2 h-5 w-5" />
              Consult The Human Mind
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/30">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-semibold">MindOcean</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your mind. Preserved. Forever swimming in the ocean of human consciousness.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
