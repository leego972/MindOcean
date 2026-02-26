import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { ArrowLeft, Zap, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const QUESTIONS = [
  { text: "When solving a complex problem, I prefer to:", options: ["Break it into small logical steps", "Look at the big picture first", "Go with my gut feeling", "Discuss it with others to get perspectives"], dimension: "approach" },
  { text: "When making an important decision, I rely most on:", options: ["Data and evidence", "Past experience and intuition", "How it affects the people involved", "Logical analysis of pros and cons"], dimension: "decision" },
  { text: "Under time pressure, I tend to:", options: ["Stay calm and prioritize systematically", "Act quickly on instinct", "Feel stressed but push through", "Seek help or delegate"], dimension: "pressure" },
  { text: "When I encounter information that contradicts my beliefs, I:", options: ["Examine the evidence carefully before changing my mind", "Tend to stick with what I already believe", "Feel uncomfortable but try to stay open", "Actively seek out more perspectives"], dimension: "flexibility" },
  { text: "My thinking style is best described as:", options: ["Analytical and methodical", "Creative and intuitive", "Practical and results-oriented", "Empathetic and people-focused"], dimension: "style" },
  { text: "When learning something new, I prefer to:", options: ["Read and study the theory first", "Jump in and learn by doing", "Watch someone else do it first", "Discuss and ask questions"], dimension: "learning" },
  { text: "When I disagree with someone, I usually:", options: ["Present my reasoning logically", "Try to understand their perspective first", "Avoid confrontation if possible", "Stand firm on my position"], dimension: "conflict" },
  { text: "My memory works best for:", options: ["Facts, numbers, and details", "Stories and experiences", "Faces and emotions", "Concepts and patterns"], dimension: "memory" },
  { text: "When planning for the future, I:", options: ["Create detailed plans with contingencies", "Set a general direction and adapt as I go", "Focus on what I can control today", "Imagine multiple possible scenarios"], dimension: "planning" },
  { text: "I process new ideas best when I can:", options: ["Analyze them quietly on my own", "Discuss them with others immediately", "See practical applications right away", "Connect them to things I already know"], dimension: "processing" },
];

export default function CognitiveTest() {
  const [, setLocation] = useLocation();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<any>(null);

  const saveMutation = trpc.assessments.save.useMutation({
    onSuccess: () => { setCompleted(true); toast.success("Cognitive assessment saved!"); },
    onError: (e) => toast.error(e.message),
  });

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = { ...answers, [currentQ]: optionIdx };
    setAnswers(newAnswers);
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const profile = {
        problemSolving: ["Systematic", "Holistic", "Intuitive", "Collaborative"][newAnswers[0] ?? 0],
        decisionMaking: ["Evidence-based", "Experience-driven", "Empathy-led", "Analytical"][newAnswers[1] ?? 0],
        pressureResponse: ["Composed", "Action-oriented", "Resilient", "Delegator"][newAnswers[2] ?? 0],
        mentalFlexibility: ["Evidence-responsive", "Conviction-strong", "Growth-minded", "Perspective-seeking"][newAnswers[3] ?? 0],
        thinkingStyle: ["Analytical", "Creative", "Practical", "Empathetic"][newAnswers[4] ?? 0],
        learningStyle: ["Theoretical", "Experiential", "Observational", "Collaborative"][newAnswers[5] ?? 0],
        conflictStyle: ["Logical", "Understanding", "Avoidant", "Assertive"][newAnswers[6] ?? 0],
        memoryStrength: ["Factual", "Narrative", "Emotional", "Conceptual"][newAnswers[7] ?? 0],
        planningStyle: ["Detailed", "Adaptive", "Present-focused", "Scenario-based"][newAnswers[8] ?? 0],
        processingMode: ["Independent", "Social", "Applied", "Connective"][newAnswers[9] ?? 0],
      };
      setResults(profile);
      saveMutation.mutate({ assessmentType: "cognitive", results: { profile, answers: newAnswers } });
    }
  };

  const progress = (Object.keys(answers).length / QUESTIONS.length) * 100;

  if (completed && results) {
    return (
      <div className="min-h-screen ocean-gradient">
        <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
          <div className="container flex h-16 items-center">
            <button onClick={() => setLocation("/assessments")} className="text-muted-foreground hover:text-foreground mr-3"><ArrowLeft className="h-4 w-4" /></button>
            <Zap className="h-5 w-5 text-[oklch(0.75_0.15_280)] mr-2" />
            <span className="text-lg font-bold">Cognitive Results</span>
          </div>
        </nav>
        <div className="container py-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Cognitive Profile Complete</h2>
            <p className="text-muted-foreground">Your thinking patterns have been mapped.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(results).map(([key, value]) => (
              <Card key={key} className="bg-card/50 border-border/50">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="font-semibold text-primary">{value as string}</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
            <Zap className="h-5 w-5 text-[oklch(0.75_0.15_280)] mr-2" />
            <span className="text-lg font-bold">Cognitive Style</span>
          </div>
          <span className="text-sm text-muted-foreground">{currentQ + 1} / {QUESTIONS.length}</span>
        </div>
      </nav>
      <div className="container py-8 max-w-2xl mx-auto">
        <Progress value={progress} className="h-2 mb-8" />
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-8 pb-8">
            <p className="text-xl font-medium text-center mb-8 leading-relaxed">"{QUESTIONS[currentQ].text}"</p>
            <div className="flex flex-col gap-3">
              {QUESTIONS[currentQ].options.map((option, idx) => (
                <Button key={idx} variant={answers[currentQ] === idx ? "default" : "outline"}
                  className={`w-full py-5 text-base justify-start px-6 text-left ${answers[currentQ] === idx ? "glow-teal" : "border-border/50 hover:border-primary/30"}`}
                  onClick={() => handleAnswer(idx)}>
                  <span className="w-8 h-8 rounded-full border border-current/30 flex items-center justify-center mr-4 text-sm shrink-0">{String.fromCharCode(65 + idx)}</span>
                  {option}
                </Button>
              ))}
            </div>
            {currentQ > 0 && (
              <Button variant="ghost" className="mt-4" onClick={() => setCurrentQ(currentQ - 1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
