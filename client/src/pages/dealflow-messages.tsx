import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { AlertTriangle, Loader2, MessageSquare, Search, Send, User } from "lucide-react";

import { MarketplaceLayout } from "@/components/marketplace-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useSEO } from "@/hooks/use-seo";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ConversationSummary {
  id: string;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unread: boolean;
}

const MEMBER_ID_PATTERN = /^[a-zA-Z0-9_-]{1,100}$/;

function safeRecipient(value: string | null, viewerId?: string | null) {
  const candidate = value?.trim() ?? "";
  if (!MEMBER_ID_PATTERN.test(candidate) || candidate === viewerId) return null;
  return candidate;
}

function memberLabel(memberId: string) {
  return `Member ${memberId.slice(0, 12)}`;
}

export default function DealflowMessages() {
  useSEO({
    title: "MarketFlow Messages",
    description: "Private MarketFlow messages surface.",
    noIndex: true,
  });

  const search = useSearch();
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const requestedRecipient = safeRecipient(
    new URLSearchParams(search).get("to"),
    user?.id,
  );
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const activeConversation = selectedConversation ?? requestedRecipient;

  const {
    data: messages = [],
    isLoading,
    isError: messagesUnavailable,
  } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const {
    data: conversationMessages = [],
    isLoading: conversationLoading,
    isError: conversationUnavailable,
  } = useQuery<Message[]>({
    queryKey: ["/api/messages/conversation", activeConversation],
    enabled: Boolean(activeConversation),
  });

  const conversations = useMemo(() => {
    const byMember = new Map<string, ConversationSummary>();
    for (const message of messages) {
      const otherUserId = message.senderId === user?.id
        ? message.receiverId
        : message.senderId;
      if (!otherUserId || otherUserId === user?.id || byMember.has(otherUserId)) {
        continue;
      }
      byMember.set(otherUserId, {
        id: otherUserId,
        lastMessage: message.content,
        lastMessageTime: message.createdAt,
        unread: !message.isRead && message.receiverId === user?.id,
      });
    }

    if (activeConversation && !byMember.has(activeConversation)) {
      byMember.set(activeConversation, {
        id: activeConversation,
        lastMessage: null,
        lastMessageTime: null,
        unread: false,
      });
    }

    return Array.from(byMember.values()).sort((left, right) => {
      const leftTime = left.lastMessageTime ? new Date(left.lastMessageTime).getTime() : 0;
      const rightTime = right.lastMessageTime ? new Date(right.lastMessageTime).getTime() : 0;
      return rightTime - leftTime;
    });
  }, [activeConversation, messages, user?.id]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) =>
      conversation.id.toLocaleLowerCase().includes(query) ||
      conversation.lastMessage?.toLocaleLowerCase().includes(query),
    );
  }, [conversations, searchQuery]);

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!activeConversation) throw new Error("Choose a conversation first.");
      const content = newMessage.trim();
      if (!content) throw new Error("Write a message first.");
      const response = await apiRequest("POST", "/api/messages", {
        receiverId: activeConversation,
        content,
      });
      return response.json() as Promise<Message>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/messages/conversation", activeConversation],
      });
      setNewMessage("");
      toast({ title: "Message sent" });
    },
    onError: () => {
      toast({
        title: "Message not sent",
        description: "Your message was not saved. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (newMessage.trim() && activeConversation && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate();
    }
  };

  return (
    <MarketplaceLayout>
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <Badge variant="outline" className="mb-3">Controlled pilot</Badge>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Messages</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Private conversations saved to your MarketFlow account. Start from an authorized member profile or record.
          </p>
        </div>

        <div className="grid min-h-[620px] grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="flex min-h-[420px] flex-col lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Conversations</CardTitle>
              <div className="relative mt-2">
                <Label htmlFor="conversation-search" className="sr-only">
                  Search conversations
                </Label>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="conversation-search"
                  type="search"
                  placeholder="Search conversations"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-10"
                  data-testid="input-search-conversations"
                />
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full max-h-[520px]">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8" role="status">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                    <span className="sr-only">Loading conversations</span>
                  </div>
                ) : messagesUnavailable ? (
                  <div className="p-8 text-center text-muted-foreground" role="alert">
                    <AlertTriangle className="mx-auto mb-3 h-8 w-8" aria-hidden="true" />
                    <p className="text-sm font-medium text-foreground">Conversations unavailable</p>
                    <p className="mt-1 text-xs">No messages were loaded. Try again later.</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="mx-auto mb-4 h-10 w-10 opacity-50" aria-hidden="true" />
                    <p className="text-sm font-medium text-foreground">No conversations</p>
                    <p className="mt-1 text-xs leading-5">
                      Open an authorized member profile to start one.
                    </p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p className="text-sm font-medium text-foreground">No matching conversations</p>
                    <p className="mt-1 text-xs">Try a member ID or words from a recent message.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => setSelectedConversation(conversation.id)}
                        aria-pressed={activeConversation === conversation.id}
                        className={`w-full p-4 text-left transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                          activeConversation === conversation.id ? "bg-secondary" : ""
                        }`}
                        data-testid={`conversation-${conversation.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              <User className="h-4 w-4" aria-hidden="true" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-medium">{memberLabel(conversation.id)}</p>
                              {conversation.unread ? (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread messages" />
                              ) : null}
                            </div>
                            <p className="truncate text-xs text-muted-foreground">
                              {conversation.lastMessage || "No messages yet"}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="flex min-h-[520px] flex-col lg:col-span-2">
            {!activeConversation ? (
              <CardContent className="flex flex-1 items-center justify-center">
                <div className="max-w-sm text-center text-muted-foreground">
                  <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" aria-hidden="true" />
                  <h2 className="text-lg font-semibold text-foreground">Select a conversation</h2>
                  <p className="mt-2 text-sm leading-6">
                    Choose an existing conversation, or open a member profile to start one.
                  </p>
                </div>
              </CardContent>
            ) : (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <User className="h-4 w-4" aria-hidden="true" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-base font-semibold">
                        {memberLabel(activeConversation)}
                      </h2>
                      <p className="text-xs text-muted-foreground">Private MarketFlow conversation</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full max-h-[450px] p-4">
                    {conversationLoading ? (
                      <div className="flex items-center justify-center py-12" role="status">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                        <span className="sr-only">Loading messages</span>
                      </div>
                    ) : conversationUnavailable ? (
                      <div className="py-12 text-center text-muted-foreground" role="alert">
                        <AlertTriangle className="mx-auto mb-3 h-8 w-8" aria-hidden="true" />
                        <p className="text-sm font-medium text-foreground">Conversation unavailable</p>
                        <p className="mt-1 text-xs">No messages were loaded. Nothing has been sent.</p>
                      </div>
                    ) : conversationMessages.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground">
                        <p className="text-sm font-medium text-foreground">No messages yet</p>
                        <p className="mt-1 text-xs">Your first message will create this conversation.</p>
                      </div>
                    ) : (
                      <div className="space-y-4" aria-live="polite">
                        {conversationMessages.map((message) => {
                          const isMine = message.senderId === user?.id;
                          return (
                            <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[82%] rounded-md px-4 py-3 sm:max-w-[70%] ${
                                isMine ? "bg-primary text-primary-foreground" : "bg-secondary"
                              }`}>
                                <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                                <p className={`mt-1 text-xs ${
                                  isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}>
                                  {new Date(message.createdAt).toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Label htmlFor="message-composer" className="sr-only">Message</Label>
                    <Input
                      id="message-composer"
                      placeholder="Write a message"
                      value={newMessage}
                      onChange={(event) => setNewMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      maxLength={4000}
                      data-testid="input-message"
                    />
                    <Button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={sendMessageMutation.isPending || !newMessage.trim()}
                      aria-label="Send message"
                      data-testid="button-send-message"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Send className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Messages are stored on your account; delivery outside MarketFlow is not promised.
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </MarketplaceLayout>
  );
}
