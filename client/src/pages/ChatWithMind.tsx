import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Brain, Send, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWithMind() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const entityId = parseInt(params.id || "0");

  const { data: entity } = trpc.entity.getById.useQuery(
    { id: entityId },
    { enabled: entityId > 0 }
  );

  const startMutation = trpc.chat.startConversation.useMutation();
  const sendMutation = trpc.chat.sendMessage.useMutation();

  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"general" | "comfort" | "advice" | "estate">("general");
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStart = async () => {
    try {
      const conv = await startMutation.mutateAsync({ entityId, mode });
      setConversationId(conv.id);
      setStarted(true);
      inputRef.current?.focus();
    } catch (e: any) {
      toast.error(e.message || "Failed to start conversation");
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !conversationId || sendMutation.isPending) return;

    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");

    try {
      const result = await sendMutation.mutateAsync({ conversationId, content: text });
      setMessages(prev => [...prev, { role: "assistant", content: result.content }]);
    } catch (e: any) {
      toast.error(e.message || "Failed to get response");
    }

    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen ocean-gradient flex flex-col">
        <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl shrink-0">
          <div className="container flex h-16 items-center gap-3">
            <button onClick={() => setLocation("/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <Brain className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">Talk to {entity?.entityName || "Mind"}</span>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
              <Brain className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{entity?.entityName || "Mind Entity"}</h2>
            {entity?.entityBio && <p className="text-muted-foreground mb-6">{entity.entityBio}</p>}
            <div className="mb-6">
              <label className="text-sm text-muted-foreground mb-2 block">What brings you here?</label>
              <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                <SelectTrigger className="bg-card/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Conversation</SelectItem>
                  <SelectItem value="comfort">Seeking Comfort</SelectItem>
                  <SelectItem value="advice">Seeking Advice</SelectItem>
                  <SelectItem value="estate">Estate & Wishes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="lg" onClick={handleStart} disabled={startMutation.isPending} className="glow-teal">
              {startMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Brain className="mr-2 h-5 w-5" />}
              Begin Conversation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen ocean-gradient flex flex-col">
      <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl shrink-0">
        <div className="container flex h-16 items-center gap-3">
          <button onClick={() => setLocation("/dashboard")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-sm leading-tight">{entity?.entityName || "Mind Entity"}</h1>
            <p className="text-xs text-muted-foreground">Swimming in the Ocean</p>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="container max-w-3xl mx-auto py-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                The conversation is ready. Say something — this mind will respond as the person it represents.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%]">
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <Brain className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">{entity?.entityName || "Mind"}</span>
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card/70 border border-border/50"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {sendMutation.isPending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card/70 border border-border/50">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/30 bg-background/80 backdrop-blur-xl shrink-0">
        <div className="container max-w-3xl mx-auto py-4">
          <div className="flex gap-3">
            <Input
              ref={inputRef}
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-card/50 border-border/50"
              disabled={sendMutation.isPending}
            />
            <Button onClick={handleSend} disabled={!input.trim() || sendMutation.isPending} className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
