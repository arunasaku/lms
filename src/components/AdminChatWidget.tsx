"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

interface ChatUser {
  id: string;
  name: string;
  memberId: string;
  role: string;
  email?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string | null;
  message: string;
  isRead: boolean;
  readAt?: string | null;
  disappearAfterSeconds?: number;
  createdAt: string;
  sender?: { id: string; name: string; role: string };
  receiver?: { id: string; name: string; role: string };
}

export function AdminChatWidget() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id || (session?.user as any)?.sub;
  const userRole = (session?.user as any)?.role;

  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedReceiverId, setSelectedReceiverId] = useState<string | null>(null); // null = Group Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [disappearSeconds, setDisappearSeconds] = useState<number>(300); // 300 = 5 Minutes (Default)
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if current user is Admin (case-insensitive)
  const isAuthorized = Boolean(session && userRole?.toUpperCase() === "ADMIN");

  // Listen for open-admin-chat event from Sidebar
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-admin-chat", handleOpen);
    return () => window.removeEventListener("open-admin-chat", handleOpen);
  }, []);

  // Timer tick for countdown rendering
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Admin users list
  useEffect(() => {
    if (!isAuthorized) return;
    fetch("/api/admin/chat/users")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch((err) => console.error("Failed to load chat users:", err));
  }, [isAuthorized]);

  // Fetch messages function
  const fetchMessages = async () => {
    if (!isAuthorized) return;
    try {
      const res = await fetch("/api/admin/chat");
      if (res.ok) {
        const data: ChatMessage[] = await res.json();
        setMessages(data);

        // Mark unread messages sent to me as read if drawer is open
        if (isOpen) {
          data.forEach((msg) => {
            if (!msg.isRead && msg.senderId !== currentUserId) {
              fetch(`/api/admin/chat/${msg.id}`, { method: "PATCH" });
            }
          });
        }
      }
    } catch (err) {
      console.error("Chat polling error:", err);
    }
  };

  // Poll messages every 3 seconds
  useEffect(() => {
    if (!isAuthorized) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [isAuthorized, isOpen]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isAuthorized) return null;

  // Filter messages for current chat target (Group Chat vs 1-on-1)
  const filteredMessages = messages.filter((msg) => {
    // Exclude locally expired disappearing messages
    if (msg.isRead && msg.readAt && msg.disappearAfterSeconds && msg.disappearAfterSeconds > 0) {
      const elapsed = (now - new Date(msg.readAt).getTime()) / 1000;
      if (elapsed >= msg.disappearAfterSeconds) return false;
    }

    if (!selectedReceiverId || selectedReceiverId === "") {
      // Group Chat: Messages where receiverId is null or empty
      return !msg.receiverId;
    } else {
      // 1-on-1 Chat: Messages between currentUserId and selectedReceiverId
      return (
        (msg.senderId === currentUserId && msg.receiverId === selectedReceiverId) ||
        (msg.senderId === selectedReceiverId && msg.receiverId === currentUserId)
      );
    }
  });

  // Calculate total unread messages count across all chats
  const unreadCount = messages.filter(
    (msg) => !msg.isRead && msg.senderId !== currentUserId
  ).length;

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedReceiverId || null,
          message: textToSend,
          disappearAfterSeconds: disappearSeconds
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        fetchMessages();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to send message");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete message handler
  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/chat/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const selectedUser = users.find((u) => u.id === selectedReceiverId);

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden font-sans">
      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-slate-800 p-3.5 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm">
                  {selectedReceiverId ? (selectedUser?.name || "A")[0].toUpperCase() : "👥"}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-slate-800"></span>
              </div>
              <div>
                <select
                  value={selectedReceiverId || ""}
                  onChange={(e) => setSelectedReceiverId(e.target.value || null)}
                  className="bg-slate-900 text-white text-xs rounded-md border border-slate-700 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                >
                  <option value="">👥 Group Chat (All Admins)</option>
                  {users
                    .filter((u) => u.id !== currentUserId)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        👤 {u.name} ({u.role})
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {selectedReceiverId ? selectedUser?.role : "Broadcast to all Admins & Staff"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Disappearing Timer Selector Toolbar */}
          <div className="bg-slate-950/80 px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <span>⏱️ Auto-Delete:</span>
            </span>
            <select
              value={disappearSeconds}
              onChange={(e) => setDisappearSeconds(Number(e.target.value))}
              className={`bg-slate-800 text-xs px-2 py-0.5 rounded border ${
                disappearSeconds > 0 ? "border-amber-500 text-amber-300 font-medium" : "border-slate-700 text-slate-300"
              }`}
            >
              <option value={300}>🔥 5 Minutes after Read (Default)</option>
              <option value={60}>🔥 1 Minute after Read</option>
              <option value={30}>🔥 30 Seconds after Read</option>
              <option value={10}>🔥 10 Seconds after Read</option>
              <option value={5}>🔥 5 Seconds after Read</option>
              <option value={0}>Off (Never)</option>
            </select>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-900/50">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
                <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No messages yet. Say hello!</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMe = msg.senderId === currentUserId;

                // Calculate disappearing timer countdown
                let countdown: number | null = null;
                if (
                  msg.isRead &&
                  msg.readAt &&
                  msg.disappearAfterSeconds &&
                  msg.disappearAfterSeconds > 0
                ) {
                  const elapsed = Math.floor((now - new Date(msg.readAt).getTime()) / 1000);
                  countdown = Math.max(0, msg.disappearAfterSeconds - elapsed);
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col group ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center space-x-1 mb-0.5 px-1">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {isMe ? "You" : msg.sender?.name || "Admin"}
                      </span>
                      {msg.sender?.role && (
                        <span className="text-[9px] bg-slate-800 text-indigo-400 px-1 py-0.2 rounded border border-slate-700">
                          {msg.sender.role}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 max-w-[85%]">
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1 transition cursor-pointer"
                        title="Delete message for everyone"
                      >
                        🗑️
                      </button>

                      <div
                        className={`px-3 py-2 rounded-2xl text-xs relative ${
                          isMe
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>

                        <div className="flex items-center justify-end space-x-1.5 mt-1 text-[9px] opacity-75">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>

                          {/* Disappearing Timer Badge */}
                          {msg.disappearAfterSeconds && msg.disappearAfterSeconds > 0 ? (
                            <span className="bg-amber-500/20 text-amber-300 px-1 rounded font-mono border border-amber-500/40">
                              🔥 {countdown !== null 
                                ? (countdown >= 60 ? `${Math.floor(countdown / 60)}m ${countdown % 60}s` : `${countdown}s`) 
                                : (msg.disappearAfterSeconds >= 60 ? `${Math.floor(msg.disappearAfterSeconds / 60)}m` : `${msg.disappearAfterSeconds}s`)}
                            </span>
                          ) : null}

                          {/* Read Status Checkmarks */}
                          {isMe && (
                            <span className={msg.isRead ? "text-cyan-300 font-bold" : "text-slate-400"}>
                              {msg.isRead ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Footer */}
          <form onSubmit={handleSendMessage} className="p-2.5 bg-slate-800 border-t border-slate-700 flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                disappearSeconds > 0
                  ? `Message (Auto-deletes ${disappearSeconds}s after read)...`
                  : "Type a message..."
              }
              className="flex-1 bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 rounded-xl transition"
            >
              <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
