import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { messageService, userService } from "@/api/firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Send, User, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [newRecipient, setNewRecipient] = useState("");

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", user?.uid],
    queryFn: () => messageService.getMessagesForUser(user.uid),
    enabled: !!user?.uid,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => userService.getAllUsers(),
  });

  const { data: conversation = [] } = useQuery({
    queryKey: ["conversation", user?.uid, selectedUser?.uid],
    queryFn: () => messageService.getConversation(user.uid, selectedUser.uid),
    enabled: !!user?.uid && !!selectedUser?.uid,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      await messageService.sendMessage(messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", user?.uid] });
      queryClient.invalidateQueries({ queryKey: ["conversation", user?.uid, selectedUser?.uid] });
      setMessageText("");
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId) => {
      await messageService.markAsRead(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", user?.uid] });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId) => {
      await messageService.deleteMessage(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", user?.uid] });
      queryClient.invalidateQueries({ queryKey: ["conversation", user?.uid, selectedUser?.uid] });
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedUser) return;

    sendMessageMutation.mutate({
      sender_id: user.uid,
      sender_username: user.username,
      recipient_id: selectedUser.uid,
      recipient_username: selectedUser.username,
      content: messageText.trim(),
    });
  };

  const handleStartConversation = () => {
    const recipient = allUsers.find(u => u.username === newRecipient || u.email === newRecipient);
    if (recipient && recipient.uid !== user.uid) {
      setSelectedUser(recipient);
      setNewRecipient("");
    } else {
      toast({
        title: "User not found",
        description: "Please enter a valid username or email.",
        variant: "destructive",
      });
    }
  };

  const getUniqueConversations = () => {
    const conversations = {};
    messages.forEach(message => {
      const otherUserId = message.sender_id === user.uid ? message.recipient_id : message.sender_id;
      const otherUsername = message.sender_id === user.uid ? message.recipient_username : message.sender_username;

      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          uid: otherUserId,
          username: otherUsername,
          lastMessage: message,
          unreadCount: message.sender_id !== user.uid && !message.read ? 1 : 0
        };
      } else {
        if (message.createdAt > conversations[otherUserId].lastMessage.createdAt) {
          conversations[otherUserId].lastMessage = message;
        }
        if (message.sender_id !== user.uid && !message.read) {
          conversations[otherUserId].unreadCount++;
        }
      }
    });
    return Object.values(conversations);
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Please log in to view your messages.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
        <p className="text-slate-400">Send and receive private messages with other users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800/30 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <Input
                  placeholder="Start conversation with username or email"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
                <Button
                  onClick={handleStartConversation}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Start Conversation
                </Button>
              </div>

              <div className="space-y-2">
                {getUniqueConversations().map((conv) => (
                  <div
                    key={conv.uid}
                    onClick={() => setSelectedUser(conv)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.uid === conv.uid
                        ? "bg-orange-500/20 border border-orange-500/30"
                        : "bg-slate-900/50 hover:bg-slate-900/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-white font-medium">{conv.username}</span>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm truncate mt-1">
                      {conv.lastMessage.content}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      {format(new Date(conv.lastMessage.createdAt), "MMM d, HH:mm")}
                    </p>
                  </div>
                ))}
                {getUniqueConversations().length === 0 && (
                  <p className="text-slate-500 text-center py-4">No conversations yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversation View */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <Card className="bg-slate-800/30 border-slate-700/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Conversation with {selectedUser.username}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Messages */}
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {conversation.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user.uid ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === user.uid
                            ? "bg-orange-600 text-white"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === user.uid ? "text-orange-200" : "text-slate-400"
                        }`}>
                          {format(new Date(message.createdAt), "MMM d, HH:mm")}
                        </p>
                        {message.sender_id !== user.uid && !message.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsReadMutation.mutate(message.id)}
                            className="text-xs mt-1 h-auto p-0 text-slate-400 hover:text-white"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                      {message.sender_id === user.uid && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMessageMutation.mutate(message.id)}
                          className="ml-2 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Send Message */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-800/30 border-slate-700/30">
              <CardContent className="text-center py-20">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Select a conversation to start messaging</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}