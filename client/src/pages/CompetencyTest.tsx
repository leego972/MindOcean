import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { ArrowLeft, Target, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DOMAINS = [
  "Leadership & Management", "Technical / Engineering", "Creative Arts & Design",
  "Science & Research", "Healthcare & Medicine", "Education & Teaching",
  "Business & Finance", "Law & Governance", "Trades & Craftsmanship",
  "Communication & Writing", "Social Work & Counseling", "Agriculture & Environment",
  "Sports & Physical Skills", "Cooking & Culinary Arts", "Parenting & Family",
  "Spirituality & Philosophy", "Technology & Computing", "Sales & Negotiation",
];

const STRENGTHS = [
  "Problem Solving", "Emotional Intelligence", "Strategic Thinking",
  "Creativity", "Patience", "Attention to Detail",
  "Communication", "Adaptability", "Resilience",
  "Mentoring Others", "Physical Endurance", "Analytical Thinking",
  "Empathy", "Organization", "Risk Assessment",
  "Conflict Resolution", "Innovation", "Storytelling",
];

export default function CompetencyTest() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"domains" | "strengths" | "done">("domains");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [domainLevels, setDomainLevels] = useState<Record<string, number>>({});
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);

  const saveMutation = trpc.assessments.save.useMutation({
    onSuccess: () => { setStep("done"); toast.success("Competency assessment saved!"); },
    onError: (e) => toast.error(e.message),
  });

  const toggleDomain = (d: string) => {
    setSelectedDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : prev.length < 6 ? [...prev, d] : prev);
  };

  const toggleStrength = (s: string) => {
    setSelectedStrengths(prev => prev.includes(s) ? prev.filter(x => x !== s) : prev.length < 8 ? [...prev, s] : prev);
  };

  const handleDomainsNext = () => {
    if (selectedDomains.length === 0) { toast.error("Select at least one domain"); return; }
    setStep("strengths");
  };

  const handleFinish = () => {
    if (selectedStrengths.length === 0) { toast.error("Select at least one strength"); return; }
    const res = { domains: selectedDomains.map(d => ({ name: d, level: domainLevels[d] || 3 })), strengths: selectedStrengths };
    setResults(res);
    saveMutation.mutate({ assessmentType: "competency", results: res });
  };

  if (step === "done" && results) {
    return (
      <div className="min-h-screen ocean-gradient">
        <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
          <div className="container flex h-16 items-center">
            <button onClick={() => setLocation("/assessments")} className="text-muted-foreground hover:text-foreground mr-3"><ArrowLeft className="h-4 w-4" /></button>
            <Target className="h-5 w-5 text-[oklch(0.80_0.14_60)] mr-2" />
            <span className="text-lg font-bold">Competency Results</span>
          </div>
        </nav>
        <div className="container py-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Competency Profile Complete</h2>
            <p className="text-muted-foreground">Your expertise and strengths have been mapped.</p>
          </div>
          <Card className="bg-card/50 border-border/50 mb-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Expertise Domains</h3>
              <div className="flex flex-wrap gap-2">
                {results.domains.map((d: any) => (
                  <span key={d.name} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                    {d.name} ({["", "Novice", "Familiar", "Competent", "Expert", "Master"][d.level]})
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Core Strengths</h3>
              <div className="flex flex-wrap gap-2">
                {results.strengths.map((s: string) => (
                  <span key={s} className="px-3 py-1.5 rounded-full bg-[oklch(0.80_0.14_60)]/10 text-[oklch(0.80_0.14_60)] text-sm">{s}</span>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="mt-8 flex justify-center">
            <Button onClick={() => setLocation("/assessments")}>Back to Assessments</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ocean-gradient">
      <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => setLocation("/assessments")} className="text-muted-foreground hover:text-foreground mr-3"><ArrowLeft className="h-4 w-4" /></button>
            <Target className="h-5 w-5 text-[oklch(0.80_0.14_60)] mr-2" />
            <span className="text-lg font-bold">Competency & Strengths</span>
          </div>
          <span className="text-sm text-muted-foreground">Step {step === "domains" ? "1" : "2"} of 2</span>
        </div>
      </nav>
      <div className="container py-8 max-w-2xl mx-auto">
        {step === "domains" ? (
          <>
            <h2 className="text-xl font-bold mb-2">Your Areas of Expertise</h2>
            <p className="text-muted-foreground mb-6">Select up to 6 domains where you have real knowledge or experience. Then rate your level in each.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {DOMAINS.map(d => (
                <button key={d} onClick={() => toggleDomain(d)}
                  className={`p-3 rounded-xl text-sm text-left transition-all border ${selectedDomains.includes(d) ? "bg-primary/10 border-primary/30 text-primary" : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/20"}`}>
                  {d}
                </button>
              ))}
            </div>
            {selectedDomains.length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="font-medium text-sm">Rate your level in each:</h3>
                {selectedDomains.map(d => (
                  <div key={d} className="flex items-center gap-4">
                    <span className="text-sm w-48 shrink-0">{d}</span>
                    <input type="range" min={1} max={5} value={domainLevels[d] || 3}
                      onChange={(e) => setDomainLevels(prev => ({ ...prev, [d]: parseInt(e.target.value) }))}
                      className="flex-1 accent-primary" />
                    <span className="text-xs text-muted-foreground w-20 text-right">
                      {["", "Novice", "Familiar", "Competent", "Expert", "Master"][domainLevels[d] || 3]}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Button onClick={handleDomainsNext} disabled={selectedDomains.length === 0}>
              Next: Core Strengths
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-2">Your Core Strengths</h2>
            <p className="text-muted-foreground mb-6">Select up to 8 strengths that best describe your natural abilities.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {STRENGTHS.map(s => (
                <button key={s} onClick={() => toggleStrength(s)}
                  className={`p-3 rounded-xl text-sm text-left transition-all border ${selectedStrengths.includes(s) ? "bg-[oklch(0.80_0.14_60)]/10 border-[oklch(0.80_0.14_60)]/30 text-[oklch(0.80_0.14_60)]" : "bg-card/50 border-border/50 text-muted-foreground hover:border-[oklch(0.80_0.14_60)]/20"}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("domains")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleFinish} disabled={selectedStrengths.length === 0 || saveMutation.isPending}>
                Complete Assessment
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
