import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, Trash2, Loader2, BookOpen, Sparkles, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "childhood", label: "Childhood" },
  { value: "family", label: "Family" },
  { value: "career", label: "Career" },
  { value: "relationship", label: "Relationship" },
  { value: "achievement", label: "Achievement" },
  { value: "challenge", label: "Challenge" },
  { value: "lesson", label: "Life Lesson" },
  { value: "tradition", label: "Tradition" },
  { value: "travel", label: "Travel" },
  { value: "friendship", label: "Friendship" },
  { value: "loss", label: "Loss" },
  { value: "joy", label: "Joy" },
  { value: "other", label: "Other" },
] as const;

type CategoryValue = typeof CATEGORIES[number]["value"];

export default function Memories() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: memories, isLoading } = trpc.memories.list.useQuery(undefined, { enabled: isAuthenticated });
  const addMutation = trpc.memories.add.useMutation({
    onSuccess: () => { utils.memories.list.invalidate(); toast.success("Memory saved"); setOpen(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.memories.delete.useMutation({
    onSuccess: () => { utils.memories.list.invalidate(); toast.success("Memory removed"); },
  });

  const importMutation = trpc.memories.importFromText.useMutation({
    onSuccess: (data) => {
      utils.memories.list.invalidate();
      toast.success(`${data.imported} ${data.imported === 1 ? "memory" : "memories"} imported successfully`);
      setImportOpen(false);
      setImportText("");
    },
    onError: (e) => toast.error(e.message),
  });

  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<CategoryValue>("other");
  const [emotionalTone, setEmotionalTone] = useState("");
  const [yearApprox, setYearApprox] = useState<number | undefined>();
  const [importance, setImportance] = useState(5);

  const resetForm = () => { setTitle(""); setContent(""); setCategory("other"); setEmotionalTone(""); setYearApprox(undefined); setImportance(5); };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { toast.error("File too large. Please use files under 500KB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setImportText((ev.target?.result as string) || "");
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!importText.trim()) { toast.error("Please paste or upload some text first"); return; }
    importMutation.mutate({ text: importText });
  };

  const handleAdd = () => {
    if (!content.trim()) { toast.error("Please write your memory"); return; }
    addMutation.mutate({ title: title || undefined, content, category, emotionalTone: emotionalTone || undefined, yearApprox, importance });
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      childhood: "bg-yellow-500/20 text-yellow-300", family: "bg-pink-500/20 text-pink-300",
      career: "bg-blue-500/20 text-blue-300", relationship: "bg-red-500/20 text-red-300",
      achievement: "bg-green-500/20 text-green-300", challenge: "bg-orange-500/20 text-orange-300",
      lesson: "bg-purple-500/20 text-purple-300", tradition: "bg-amber-500/20 text-amber-300",
      travel: "bg-cyan-500/20 text-cyan-300", friendship: "bg-indigo-500/20 text-indigo-300",
      loss: "bg-gray-500/20 text-gray-300", joy: "bg-emerald-500/20 text-emerald-300",
    };
    return colors[cat] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen ocean-gradient">
      <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <BookOpen className="h-5 w-5 text-[oklch(0.80_0.14_60)]" />
            <span className="text-lg font-bold">Memories</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Import from Text */}
            <Dialog open={importOpen} onOpenChange={(v) => { setImportOpen(v); if (!v) setImportText(""); }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Sparkles className="mr-2 h-4 w-4" /> Import with AI</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border/50 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Import Memories with AI</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-muted-foreground">Paste a life story, journal entry, letter, or any personal text. The AI will automatically extract and categorise individual memories from it — preserving your voice.</p>
                  <div className="border-2 border-dashed border-border/50 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload a <strong>.txt</strong> or <strong>.md</strong> file</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Max 500KB</p>
                    <input ref={fileInputRef} type="file" accept=".txt,.md,.text" className="hidden" onChange={handleFileUpload} />
                  </div>
                  <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/30" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or paste text</span></div></div>
                  <div className="space-y-2">
                    <Label>Your story, journal, or memories</Label>
                    <Textarea placeholder="Paste your life story, a journal entry, a letter, or any personal text here. The AI will extract individual memories from it..." value={importText} onChange={(e) => setImportText(e.target.value)} className="min-h-[200px] bg-background/50 resize-y font-mono text-sm" />
                    <p className="text-xs text-muted-foreground text-right">{importText.length.toLocaleString()} / 50,000 characters</p>
                  </div>
                  {importText.length > 0 && <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm text-muted-foreground"><Sparkles className="h-4 w-4 text-primary inline mr-2" />The AI will extract up to <strong>20 memories</strong> from your text, automatically assigning categories, emotional tones, and importance ratings.</div>}
                  <div className="flex gap-3">
                    <Button onClick={handleImport} disabled={importMutation.isPending || !importText.trim()} className="flex-1">
                      {importMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Extracting memories...</> : <><Sparkles className="mr-2 h-4 w-4" />Extract &amp; Import Memories</>}
                    </Button>
                    <Button variant="outline" onClick={() => { setImportOpen(false); setImportText(""); }}>Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Memory */}
            <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Memory</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50 max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record a Memory</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Title (optional)</Label>
                  <Input placeholder="Give this memory a name" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>The Memory *</Label>
                  <Textarea placeholder="Tell this story. What happened? How did it make you feel? Why does it matter to you? The more detail, the better your mind entity will remember it..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[150px] bg-background/50 resize-y" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as CategoryValue)}>
                      <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Approximate Year</Label>
                    <Input type="number" placeholder="e.g. 1998" value={yearApprox || ""} onChange={(e) => setYearApprox(parseInt(e.target.value) || undefined)} className="bg-background/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Emotional Tone</Label>
                  <Input placeholder="e.g. bittersweet, triumphant, peaceful, heartbreaking" value={emotionalTone} onChange={(e) => setEmotionalTone(e.target.value)} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Importance (1-10): {importance}</Label>
                  <input type="range" min={1} max={10} value={importance} onChange={(e) => setImportance(parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
                <Button onClick={handleAdd} disabled={addMutation.isPending} className="w-full">
                  {addMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Memory
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </nav>

      <div className="container py-8 max-w-3xl mx-auto">
        <p className="text-muted-foreground mb-8">
          Each memory adds depth to your mind entity. The stories you tell here become part of how your digital mind 
          thinks, advises, and comforts your loved ones.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : memories && memories.length > 0 ? (
          <div className="space-y-4">
            {memories.map((memory) => (
              <Card key={memory.id} className="bg-card/50 border-border/50 group">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {memory.title && <h3 className="font-semibold">{memory.title}</h3>}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(memory.category || "other")}`}>
                          {memory.category}
                        </span>
                        {memory.yearApprox && <span className="text-xs text-muted-foreground">~{memory.yearApprox}</span>}
                        {memory.importance && memory.importance >= 8 && <Badge variant="outline" className="text-xs border-primary/30 text-primary">High importance</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{memory.content}</p>
                      {memory.emotionalTone && (
                        <p className="text-xs text-primary/70 mt-2 italic">Feeling: {memory.emotionalTone}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate({ id: memory.id })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No memories yet</h3>
            <p className="text-muted-foreground mb-6">Start recording the moments that made you who you are</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Your First Memory</Button>
              <Button variant="outline" onClick={() => setImportOpen(true)}><Sparkles className="mr-2 h-4 w-4" /> Import with AI</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
