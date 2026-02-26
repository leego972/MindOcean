import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { ArrowLeft, Brain, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const QUESTIONS = [
  { text: "I enjoy trying new and unfamiliar experiences.", trait: "O" },
  { text: "I have a vivid imagination.", trait: "O" },
  { text: "I am curious about many different things.", trait: "O" },
  { text: "I appreciate art, music, or literature deeply.", trait: "O" },
  { text: "I prefer variety over routine.", trait: "O" },
  { text: "I am always prepared and plan ahead.", trait: "C" },
  { text: "I pay attention to details.", trait: "C" },
  { text: "I follow through on my commitments.", trait: "C" },
  { text: "I like to keep things organized.", trait: "C" },
  { text: "I work hard to achieve my goals.", trait: "C" },
  { text: "I feel energized when I'm around other people.", trait: "E" },
  { text: "I am usually the one to start conversations.", trait: "E" },
  { text: "I enjoy being the center of attention.", trait: "E" },
  { text: "I have a wide circle of friends and acquaintances.", trait: "E" },
  { text: "I am talkative and expressive.", trait: "E" },
  { text: "I go out of my way to help others.", trait: "A" },
  { text: "I trust people until they give me a reason not to.", trait: "A" },
  { text: "I try to see the best in people.", trait: "A" },
  { text: "I avoid conflicts and try to find compromise.", trait: "A" },
  { text: "I feel empathy strongly when others are suffering.", trait: "A" },
  { text: "I often worry about things that might go wrong.", trait: "N" },
  { text: "I get stressed easily under pressure.", trait: "N" },
  { text: "My mood can change quickly.", trait: "N" },
  { text: "I sometimes feel overwhelmed by my emotions.", trait: "N" },
  { text: "I tend to dwell on past mistakes.", trait: "N" },
];

const SCALE = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

const LABELS: Record<string, string> = {
  O: "Openness", C: "Conscientiousness", E: "Extraversion", A: "Agreeableness", N: "Neuroticism"
};

const DESCRIPTIONS: Record<string, [string, string]> = {
  Openness: ["You embrace new experiences and ideas with curiosity.", "You prefer the familiar and proven approaches."],
  Conscientiousness: ["You are organized, disciplined, and goal-oriented.", "You are flexible and spontaneous in your approach."],
  Extraversion: ["You draw energy from social interaction and engagement.", "You recharge through solitude and reflection."],
  Agreeableness: ["You prioritize harmony, empathy, and cooperation.", "You are direct, competitive, and independent-minded."],
  Neuroticism: ["You experience emotions intensely and are sensitive to stress.", "You are emotionally stable and resilient under pressure."],
};

export default function BigFiveTest() {
  const [, setLocation] = useLocation();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<Record<string, number> | null>(null);

  const saveMutation = trpc.assessments.save.useMutation({
    onSuccess: () => { setCompleted(true); toast.success("Big Five assessment saved!"); },
    onError: (e) => toast.error(e.message),
  });

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [currentQ]: value };
    setAnswers(newAnswers);
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const traits: Record<string, number[]> = { O: [], C: [], E: [], A: [], N: [] };
      QUESTIONS.forEach((q, i) => { if (newAnswers[i] !== undefined) traits[q.trait].push(newAnswers[i]); });
      const scores: Record<string, number> = {};
      for (const [trait, vals] of Object.entries(traits)) {
        scores[LABELS[trait]] = Math.round((vals.reduce((a, b) => a + b, 0) / (vals.length * 5)) * 100);
      }
      setResults(scores);
      saveMutation.mutate({ assessmentType: "big_five", results: { scores, answers: newAnswers } });
    }
  };

  const progress = (Object.keys(answers).length / QUESTIONS.length) * 100;

  if (completed && results) {
    return (
      <div className="min-h-screen ocean-gradient">
        <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
          <div className="container flex h-16 items-center">
            <button onClick={() => setLocation("/assessments")} className="text-muted-foreground hover:text-foreground mr-3"><ArrowLeft className="h-4 w-4" /></button>
            <Brain className="h-5 w-5 text-primary mr-2" />
            <span className="text-lg font-bold">Big Five Results</span>
          </div>
        </nav>
        <div className="container py-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Assessment Complete</h2>
            <p className="text-muted-foreground">Your personality profile will shape your mind entity.</p>
          </div>
          <div className="space-y-4">
            {Object.entries(results).map(([trait, score]) => (
              <Card key={trait} className="bg-card/50 border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{trait}</span>
                    <span className="text-primary font-bold">{score}%</span>
                  </div>
                  <Progress value={score} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {score > 60 ? DESCRIPTIONS[trait]?.[0] : DESCRIPTIONS[trait]?.[1]}
                  </p>
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
            <Brain className="h-5 w-5 text-primary mr-2" />
            <span className="text-lg font-bold">Big Five Personality</span>
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
              {SCALE.map((option) => (
                <Button key={option.value} variant={answers[currentQ] === option.value ? "default" : "outline"}
                  className={`w-full py-6 text-base justify-start px-6 ${answers[currentQ] === option.value ? "glow-teal" : "border-border/50 hover:border-primary/30"}`}
                  onClick={() => handleAnswer(option.value)}>
                  <span className="w-8 h-8 rounded-full border border-current/30 flex items-center justify-center mr-4 text-sm shrink-0">{option.value}</span>
                  {option.label}
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
