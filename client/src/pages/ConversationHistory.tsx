import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Streamdown } from "streamdown";
import {
  ArrowLeft,
  Brain,
  Clock,
  MessageCircle,
  User,
  Bot,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const MODE_LABELS: Record<string, string> = {
  general: "General",
  comfort: "Comfort",
  advice: "Advice",
  estate: "Estate",
};

const MODE_COLORS: Record<string, string> = {
  general: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  comfort: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  advice: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  estate: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ConversationHistory() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: convList, isLoading: listLoading } =
    trpc.conversations.list.useQuery(undefined, { enabled: isAuthenticated });

  const { data: thread, isLoading: threadLoading } =
    trpc.conversations.getMessages.useQuery(
      { conversationId: selectedId! },
      { enabled: selectedId !== null }
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050d1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050d1a] flex items-center justify-center">
        <Card className="bg-[#0a1628] border-teal-500/20 text-white max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <Brain className="w-12 h-12 text-teal-400 mx-auto" />
            <h2 className="text-xl font-semibold">Sign in to view conversations</h2>
            <a href={getLoginUrl()}>
              <Button className="bg-teal-500 hover:bg-teal-400 text-black font-semibold w-full">
                Sign In
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050d1a] text-white">
      {/* Header */}
      <header className="border-b border-teal-500/20 bg-[#050d1a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white gap-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-5 bg-teal-500/20" />
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-teal-400" />
            <h1 className="text-lg font-semibold">Conversation History</h1>
          </div>
          {convList && (
            <span className="ml-auto text-sm text-gray-400">
              {convList.length} conversation{convList.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          {/* Conversation List */}
          <div className="lg:col-span-1">
            <Card className="bg-[#0a1628] border-teal-500/20 h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  All Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                {listLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !convList || convList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center px-6 gap-3">
                    <Inbox className="w-10 h-10 text-gray-600" />
                    <p className="text-gray-500 text-sm">
                      No conversations yet. Share your mind link so loved ones can start chatting.
                    </p>
                    <Link href="/mind-entity">
                      <Button size="sm" variant="outline" className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10">
                        Get Share Link
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="divide-y divide-teal-500/10">
                      {convList.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedId(conv.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-teal-500/5 transition-colors group ${
                            selectedId === conv.id ? "bg-teal-500/10 border-l-2 border-teal-400" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-white truncate">
                                  {conv.visitorName || "Anonymous visitor"}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-xs shrink-0 ${MODE_COLORS[conv.mode ?? "general"]}`}
                                >
                                  {MODE_LABELS[conv.mode ?? "general"]}
                                </Badge>
                              </div>
                              {conv.lastMessage && (
                                <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                              )}
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" />
                                  {conv.messageCount} messages
                                </span>
                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(conv.createdAt)}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-teal-400 shrink-0 mt-1" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Thread Viewer */}
          <div className="lg:col-span-2">
            <Card className="bg-[#0a1628] border-teal-500/20 h-full flex flex-col">
              {!selectedId ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 p-8">
                  <MessageCircle className="w-16 h-16 text-gray-700" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-400">Select a conversation</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Choose a conversation from the left to read the full exchange.
                    </p>
                  </div>
                </div>
              ) : threadLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : thread ? (
                <>
                  {/* Thread Header */}
                  <CardHeader className="border-b border-teal-500/20 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-teal-400" />
                          <span className="font-semibold text-white">
                            {thread.conversation.visitorName || "Anonymous visitor"}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${MODE_COLORS[thread.conversation.mode ?? "general"]}`}
                          >
                            {MODE_LABELS[thread.conversation.mode ?? "general"]} mode
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          with <span className="text-teal-400">{thread.entity.entityName}</span> ·{" "}
                          {formatDate(thread.conversation.createdAt)} · {thread.messages.length} messages
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full p-4">
                      <div className="space-y-4">
                        {thread.messages
                          .filter((m) => m.role !== "system")
                          .map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              {msg.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 mt-1">
                                  <Bot className="w-4 h-4 text-teal-400" />
                                </div>
                              )}
                              <div
                                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                                  msg.role === "user"
                                    ? "bg-teal-500/20 border border-teal-500/30 text-white rounded-tr-sm"
                                    : "bg-[#0f1f35] border border-white/5 text-gray-200 rounded-tl-sm"
                                }`}
                              >
                                {msg.role === "assistant" ? (
                                  <Streamdown>{msg.content}</Streamdown>
                                ) : (
                                  <p>{msg.content}</p>
                                )}
                                <p className="text-xs text-gray-600 mt-1 text-right">
                                  {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              {msg.role === "user" && (
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-1">
                                  <User className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </>
              ) : null}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
