import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { ArrowLeft, Brain, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ProfileSetup() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile, isLoading } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const saveMutation = trpc.profile.save.useMutation({
    onSuccess: () => toast.success("Profile saved successfully"),
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({
    displayName: "", birthYear: 0, location: "", occupation: "",
    lifeStory: "", coreValues: "", beliefs: "",
    likesAndJoys: "", dislikesAndFears: "",
    communicationStyle: "", humorStyle: "",
    importantPeople: "", legacyMessage: "", estateWishes: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || "",
        birthYear: profile.birthYear || 0,
        location: profile.location || "",
        occupation: profile.occupation || "",
        lifeStory: profile.lifeStory || "",
        coreValues: profile.coreValues || "",
        beliefs: profile.beliefs || "",
        likesAndJoys: profile.likesAndJoys || "",
        dislikesAndFears: profile.dislikesAndFears || "",
        communicationStyle: profile.communicationStyle || "",
        humorStyle: profile.humorStyle || "",
        importantPeople: profile.importantPeople || "",
        legacyMessage: profile.legacyMessage || "",
        estateWishes: profile.estateWishes || "",
      });
    }
  }, [profile]);

  const handleSave = () => {
    saveMutation.mutate({
      ...form,
      birthYear: form.birthYear || undefined,
    });
  };

  const updateField = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen ocean-gradient flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sections = [
    {
      title: "Identity",
      description: "The basics of who you are",
      fields: [
        { key: "displayName", label: "Your Name", type: "input", placeholder: "How you want to be known" },
        { key: "birthYear", label: "Birth Year", type: "number", placeholder: "e.g. 1965" },
        { key: "location", label: "Where You Call Home", type: "input", placeholder: "City, country, or wherever feels like home" },
        { key: "occupation", label: "What You Do / Did", type: "input", placeholder: "Your profession, craft, or calling" },
      ],
    },
    {
      title: "Your Story",
      description: "The narrative of your life — go as deep as you want",
      fields: [
        { key: "lifeStory", label: "Life Story", type: "textarea", placeholder: "Tell your story. Where did you grow up? What shaped you? What are the chapters of your life? The more detail, the more authentic your mind entity becomes..." },
        { key: "coreValues", label: "Core Values", type: "textarea", placeholder: "What do you stand for? What principles guide your decisions? What would you never compromise on?" },
        { key: "beliefs", label: "Beliefs & Worldview", type: "textarea", placeholder: "Your beliefs about life, spirituality, politics, human nature — whatever matters to you" },
      ],
    },
    {
      title: "Personality",
      description: "What makes you, you",
      fields: [
        { key: "likesAndJoys", label: "Likes & Joys", type: "textarea", placeholder: "What makes you happy? What do you love? Hobbies, foods, music, places, simple pleasures..." },
        { key: "dislikesAndFears", label: "Dislikes & Fears", type: "textarea", placeholder: "What bothers you? What do you avoid? What are you afraid of? Be honest — it makes your mind more real." },
        { key: "communicationStyle", label: "How You Talk", type: "textarea", placeholder: "Are you direct or gentle? Do you use humor? Do you tell stories? Are you formal or casual? Do you have catchphrases?" },
        { key: "humorStyle", label: "Your Humor", type: "textarea", placeholder: "What makes you laugh? Do you tell jokes? Sarcastic? Dry wit? Dad jokes? Describe how you use humor." },
      ],
    },
    {
      title: "Relationships & Legacy",
      description: "The people who matter and what you want to leave behind",
      fields: [
        { key: "importantPeople", label: "Important People", type: "textarea", placeholder: "Who are the most important people in your life? Describe your relationships — spouse, children, parents, friends, mentors..." },
        { key: "legacyMessage", label: "Legacy Message", type: "textarea", placeholder: "If you could leave one message for your loved ones, what would it be? What do you want them to know?" },
        { key: "estateWishes", label: "Estate & Final Wishes", type: "textarea", placeholder: "Your wishes regarding your estate, possessions, arrangements. Be specific — your mind entity can reference this to prevent disputes." },
      ],
    },
  ];

  return (
    <div className="min-h-screen ocean-gradient">
      <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <Brain className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">Your Profile</span>
          </div>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Profile
          </Button>
        </div>
      </nav>

      <div className="container py-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-muted-foreground">
            The more you share, the more authentic your mind entity becomes. There are no wrong answers — 
            just be yourself. You can always come back and add more.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <Card key={section.title} className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.key}
                        placeholder={field.placeholder}
                        value={(form as any)[field.key] || ""}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        className="min-h-[120px] bg-background/50 border-border/50 resize-y"
                      />
                    ) : field.type === "number" ? (
                      <Input
                        id={field.key}
                        type="number"
                        placeholder={field.placeholder}
                        value={(form as any)[field.key] || ""}
                        onChange={(e) => updateField(field.key, parseInt(e.target.value) || 0)}
                        className="bg-background/50 border-border/50"
                      />
                    ) : (
                      <Input
                        id={field.key}
                        placeholder={field.placeholder}
                        value={(form as any)[field.key] || ""}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        className="bg-background/50 border-border/50"
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button size="lg" onClick={handleSave} disabled={saveMutation.isPending} className="glow-teal">
            {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
