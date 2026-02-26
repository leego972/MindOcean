import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, MessageCircle, Users, Send, ArrowLeft, Sparkles, Lock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useParams, useLocation } from "wouter";
import { Streamdown } from "streamdown";

type ChatMode = "comfort" | "advice" | "estate" | "general";

const MODE_CONFIG: Record<ChatMode, { label: string; description: string; color: string }> = {
  general: { label: "General Chat", description: "Have a natural conversation", color: "bg-primary/20 text-primary border-primary/30" },
  comfort: { label: "Seek Comfort", description: "Emotional support and warmth", color: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  advice: { label: "Ask for Advice", description: "Draw on their life wisdom", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  estate: { label: "Estate & Legacy", description: "Final wishes and messages", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
};

export default function PublicMindProfile() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const slug = params.slug;

  const { data: entity, isLoading, error } = trpc.entity.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug, retry: false }
  );

  const startConversationMutation = trpc.chat.startConversation.useMutation({
    onSuccess: (conv) => {
      setConversationId(conv.id);
      setVisitorNameSet(true);
    },
    onError: (e) => toast.error(e.message),
  });

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant" as const, content: data.content }]);
      setIsTyping(false);
    },
    onError: (e) => {
      toast.error(e.message);
      setIsTyping(false);
    },
  });

  const [conversationId, setConversationId] = useState<number | null>(null);
  const [visitorName, setVisitorName] = useState("");
  const [visitorNameSet, setVisitorNameSet] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ChatMode>("general");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleStartChat = () => {
    if (!entity) return;
    startConversationMutation.mutate({
      entityId: entity.id,
      mode: selectedMode,
      visitorName: visitorName.trim() || undefined,
    });
  };

  const handleSend = () => {
    if (!input.trim() || !conversationId || isTyping) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);
    sendMessageMutation.mutate({ conversationId, content: userMessage });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen ocean-gradient flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading mind...</p>
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="min-h-screen ocean-gradient flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Brain className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-3">Mind Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This mind entity doesn't exist or hasn't been made public yet.
          </p>
          <Button onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to MindOcean
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ocean-gradient">
      {/* Header */}
      <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">MindOcean</span>
          </button>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Mind Profile</span>
          </div>
          <div className="w-20" />
        </div>
      </nav>

      <div className="container py-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Entity Profile */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                    <Brain className="h-10 w-10 text-primary" />
                  </div>
                  <h1 className="text-xl font-bold">{entity.entityName || "Anonymous Mind"}</h1>
                  {entity.inCollective && (
                    <Badge variant="outline" className="mt-2 border-primary/30 text-primary text-xs">
                      <Users className="h-3 w-3 mr-1" /> In The Human Mind
                    </Badge>
                  )}
                </div>

                {entity.entityBio && (
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    {entity.entityBio}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-primary">{entity.totalConversations ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Conversations</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-primary capitalize">{entity.status}</p>
                    <p className="text-xs text-muted-foreground">Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mode selector */}
            {!visitorNameSet && (
              <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Choose conversation mode</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(Object.entries(MODE_CONFIG) as [ChatMode, typeof MODE_CONFIG[ChatMode]][]).map(([mode, config]) => (
                    <button
                      key={mode}
                      onClick={() => setSelectedMode(mode)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedMode === mode
                          ? config.color + " border-current"
                          : "border-border/30 hover:border-border/60 text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm font-medium">{config.label}</p>
                      <p className="text-xs opacity-70">{config.description}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Powered by */}
            <div className="text-center">
              <a href="/" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" />
                Powered by MindOcean
              </a>
            </div>
          </div>

          {/* Right: Chat */}
          <div className="lg:col-span-2">
            <Card className="bg-card/60 border-border/50 backdrop-blur-sm h-full flex flex-col" style={{ minHeight: "520px" }}>
              {!visitorNameSet ? (
                /* Pre-chat: name entry */
                <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-primary/50 mb-4" />
                  <h2 className="text-lg font-semibold mb-2">
                    Start a conversation with {entity.entityName || "this mind"}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                    You're about to speak with a digital mind entity. Introduce yourself to make the conversation more personal.
                  </p>
                  <div className="w-full max-w-sm space-y-3">
                    <Input
                      placeholder="Your name (optional)"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleStartChat()}
                      className="bg-background/50"
                    />
                    <Button
                      onClick={handleStartChat}
                      disabled={startConversationMutation.isPending}
                      className="w-full"
                    >
                      {startConversationMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <MessageCircle className="mr-2 h-4 w-4" />
                      )}
                      Begin Conversation
                    </Button>
                  </div>
                </CardContent>
              ) : (
                /* Active chat */
                <>
                  <div className="flex items-center gap-3 p-4 border-b border-border/30">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{entity.entityName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{MODE_CONFIG[selectedMode].label}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto text-xs border-green-500/30 text-green-400">
                      Active
                    </Badge>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "400px" }}>
                    {messages.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground/50">
                        <p className="text-sm">Say hello to {entity.entityName}...</p>
                      </div>
                    )}
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted/60 text-foreground rounded-bl-sm"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <Streamdown>{msg.content}</Streamdown>
                          ) : (
                            msg.content
                          )}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted/60 rounded-2xl rounded-bl-sm px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-border/30">
                    <div className="flex gap-2">
                      <Input
                        placeholder={`Message ${entity.entityName}...`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isTyping}
                        className="bg-background/50"
                      />
                      <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground/50 mt-2 text-center">
                      This is a digital mind entity. Responses are AI-generated based on the person's profile.
                    </p>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
