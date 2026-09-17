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
  imageUrl?: string | null;
  messageType?: string | null;
  callSignal?: string | null;
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [disappearSeconds, setDisappearSeconds] = useState<number>(5); // 5 = 5 Seconds (Default)
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // WebRTC Audio/Video Call state
  const [callState, setCallState] = useState<"IDLE" | "CALLING" | "RINGING" | "CONNECTED">("IDLE");
  const [activePeer, setActivePeer] = useState<{ id: string; name: string; role?: string } | null>(null);
  const [pendingSignal, setPendingSignal] = useState<any>(null);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const handledSignalIds = useRef<Set<string>>(new Set());

  const EMOJIS = ["😊", "👍", "❤️", "📚", "🔥", "✅", "🙏", "🎉", "💡", "📌", "😄", "👏", "🎯", "🚀", "💬", "⚠️", "❌", "👋", "👌", "⭐"];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Check if current user is Admin (case-insensitive)
  const isAuthorized = Boolean(session && userRole?.toUpperCase() === "ADMIN");

  // Listen for open-admin-chat event from Sidebar
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-admin-chat", handleOpen);
    return () => window.removeEventListener("open-admin-chat", handleOpen);
  }, []);

  // Timer tick for countdown rendering & call duration
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timer: any;
    if (callState === "CONNECTED") {
      timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

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

  // Send Call Signaling Message
  const sendSignalMessage = async (targetId: string, type: string, signalData?: any, textMsg?: string) => {
    try {
      await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: targetId,
          message: textMsg || `Call signal: ${type}`,
          messageType: type,
          callSignal: signalData ? JSON.stringify(signalData) : null,
          disappearAfterSeconds: 0
        })
      });
    } catch (err) {
      console.error("Failed to send call signal:", err);
    }
  };

  // Clean up media tracks & peer connection
  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;

    setCallState("IDLE");
    setActivePeer(null);
    setPendingSignal(null);
    setIsMuted(false);
    setIsVideoCall(false);
    setIsVideoOff(false);
    setCallDuration(0);
  };

  // Start outgoing Audio/Video call
  const startCall = async (targetUser: { id: string; name: string; role?: string }, video: boolean = false) => {
    try {
      setIsOpen(true);
      setCallState("CALLING");
      setActivePeer(targetUser);
      setIsVideoCall(video);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
      localStreamRef.current = stream;

      setTimeout(() => {
        if (video && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }, 100);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }]
      });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (event.streams[0]) {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
            remoteAudioRef.current.play().catch(console.error);
          }
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            remoteVideoRef.current.play().catch(console.error);
          }
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalMessage(targetUser.id, "ICE_CANDIDATE", event.candidate);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const signalPayload = { offer, isVideo: video };
      sendSignalMessage(
        targetUser.id,
        "CALL_OFFER",
        signalPayload,
        `${video ? "📹 Incoming Video Call" : "📞 Incoming Audio Call"} from ${session?.user?.name || "Admin"}`
      );
    } catch (err: any) {
      console.error("Failed to start call:", err);
      alert(err.message || "Microphone/Camera access denied or call failed.");
      cleanupCall();
    }
  };

  // Accept incoming call
  const acceptIncomingCall = async () => {
    if (!activePeer || !pendingSignal) return;
    try {
      const offerData = pendingSignal.offer || pendingSignal;
      const isVid = Boolean(pendingSignal.isVideo);
      setIsVideoCall(isVid);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVid });
      localStreamRef.current = stream;

      setTimeout(() => {
        if (isVid && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }, 100);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }]
      });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (event.streams[0]) {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
            remoteAudioRef.current.play().catch(console.error);
          }
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            remoteVideoRef.current.play().catch(console.error);
          }
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalMessage(activePeer.id, "ICE_CANDIDATE", event.candidate);
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offerData));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      sendSignalMessage(activePeer.id, "CALL_ANSWER", answer);
      setCallState("CONNECTED");
    } catch (err: any) {
      console.error("Failed to accept call:", err);
      alert(err.message || "Microphone/Camera access failed.");
      cleanupCall();
    }
  };

  // Reject incoming call
  const rejectIncomingCall = () => {
    if (activePeer) {
      sendSignalMessage(activePeer.id, "CALL_REJECT");
    }
    cleanupCall();
  };

  // End active call
  const endCall = () => {
    if (activePeer) {
      sendSignalMessage(activePeer.id, "CALL_END");
    }
    cleanupCall();
  };

  // Toggle Mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle Video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Fetch messages function & signaling listener
  const fetchMessages = async () => {
    if (!isAuthorized) return;
    try {
      const res = await fetch("/api/admin/chat");
      if (res.ok) {
        const data: ChatMessage[] = await res.json();
        setMessages(data);

        // Process WebRTC call signals
        data.forEach((msg) => {
          if (
            msg.senderId !== currentUserId &&
            msg.messageType &&
            msg.messageType !== "TEXT" &&
            !handledSignalIds.current.has(msg.id)
          ) {
            handledSignalIds.current.add(msg.id);

            if (msg.messageType === "CALL_OFFER" && msg.callSignal) {
              const sig = JSON.parse(msg.callSignal);
              setPendingSignal(sig);
              setIsVideoCall(Boolean(sig.isVideo));
              setActivePeer({
                id: msg.senderId,
                name: msg.sender?.name || "Admin",
                role: msg.sender?.role
              });
              setCallState("RINGING");
              setIsOpen(true);
            } else if (msg.messageType === "CALL_ANSWER" && msg.callSignal) {
              if (pcRef.current) {
                pcRef.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.callSignal)));
                setCallState("CONNECTED");
              }
            } else if (msg.messageType === "ICE_CANDIDATE" && msg.callSignal) {
              if (pcRef.current && pcRef.current.remoteDescription) {
                pcRef.current.addIceCandidate(new RTCIceCandidate(JSON.parse(msg.callSignal))).catch(console.error);
              }
            } else if (msg.messageType === "CALL_END" || msg.messageType === "CALL_REJECT") {
              cleanupCall();
            }
          }
        });

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
    // Hide signaling messages from text feed
    if (msg.messageType && msg.messageType !== "TEXT") return false;

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
    (msg) => !msg.isRead && msg.senderId !== currentUserId && (!msg.messageType || msg.messageType === "TEXT")
  ).length;

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    const textToSend = inputText;
    const imageToSend = selectedImage;
    setInputText("");
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setLoading(true);

    try {
      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedReceiverId || null,
          message: textToSend,
          imageUrl: imageToSend,
          messageType: "TEXT",
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

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden font-sans">
      <audio ref={remoteAudioRef} autoPlay className="hidden" />

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
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
                  className="bg-slate-900 text-white text-xs rounded-md border border-slate-700 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold max-w-[150px] truncate"
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

            <div className="flex items-center space-x-1">
              {/* Call Buttons in 1-on-1 Chat */}
              {selectedReceiverId && selectedUser && (
                <>
                  <button
                    type="button"
                    onClick={() => startCall(selectedUser, false)}
                    disabled={callState !== "IDLE"}
                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 cursor-pointer text-xs"
                    title={`Audio Call ${selectedUser.name}`}
                  >
                    📞
                  </button>
                  <button
                    type="button"
                    onClick={() => startCall(selectedUser, true)}
                    disabled={callState !== "IDLE"}
                    className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 cursor-pointer text-xs"
                    title={`Video Call ${selectedUser.name}`}
                  >
                    📹
                  </button>
                </>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* WebRTC Video Stream Modal Layer */}
          {callState === "CONNECTED" && isVideoCall && (
            <div className="relative w-full h-[220px] bg-black border-b border-slate-800 flex items-center justify-center overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Local Video Picture-in-Picture */}
              <div className="absolute bottom-2 right-2 w-24 h-32 bg-slate-900 rounded-lg overflow-hidden border-2 border-indigo-500 shadow-xl">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isVideoOff ? "hidden" : "block"}`}
                />
                {isVideoOff && (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                    Cam Off
                  </div>
                )}
              </div>

              {/* Video Call Quick Controls */}
              <div className="absolute top-2 left-2 flex items-center space-x-1 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-slate-700 text-xs">
                <span>📹 Video Call</span>
                <span className="text-[10px] text-emerald-400 font-mono">⏱️ {formatDuration(callDuration)}</span>
              </div>
            </div>
          )}

          {/* WebRTC Audio/Video Call Status Bar */}
          {callState !== "IDLE" && (!isVideoCall || callState !== "CONNECTED") && (
            <div className="bg-indigo-950/90 border-b border-indigo-800 p-3 flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs animate-pulse">
                  {isVideoCall ? "📹" : "📞"}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">
                    {callState === "CALLING" && `Calling ${activePeer?.name}...`}
                    {callState === "RINGING" && `Incoming ${isVideoCall ? "Video" : "Audio"} Call from ${activePeer?.name}`}
                    {callState === "CONNECTED" && `Call with ${activePeer?.name}`}
                  </p>
                  <p className="text-[10px] text-indigo-300 font-mono">
                    {callState === "CALLING" && "Ringing..."}
                    {callState === "RINGING" && "Click Answer to connect"}
                    {callState === "CONNECTED" && `⏱️ ${formatDuration(callDuration)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                {callState === "RINGING" && (
                  <>
                    <button
                      type="button"
                      onClick={acceptIncomingCall}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1"
                    >
                      Answer {isVideoCall ? "📹" : "📞"}
                    </button>
                    <button
                      type="button"
                      onClick={rejectIncomingCall}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                    >
                      Reject 🚫
                    </button>
                  </>
                )}

                {callState === "CONNECTED" && (
                  <>
                    <button
                      type="button"
                      onClick={toggleMute}
                      className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                        isMuted ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                      title={isMuted ? "Unmute Mic" : "Mute Mic"}
                    >
                      {isMuted ? "🔇" : "🎙️"}
                    </button>

                    {isVideoCall && (
                      <button
                        type="button"
                        onClick={toggleVideo}
                        className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                          isVideoOff ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                        title={isVideoOff ? "Turn Cam On" : "Turn Cam Off"}
                      >
                        {isVideoOff ? "📷 Off" : "📹 Cam"}
                      </button>
                    )}
                  </>
                )}

                {(callState === "CALLING" || callState === "CONNECTED") && (
                  <button
                    type="button"
                    onClick={endCall}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    End 🛑
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Disappearing Timer Selector Toolbar */}
          <div className="bg-slate-950/80 px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-end text-[11px] text-slate-400">
            <div className="relative inline-flex items-center">
              <select
                value={disappearSeconds}
                onChange={(e) => setDisappearSeconds(Number(e.target.value))}
                title="Select auto-delete time"
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              >
                <option value={5}>🔥 5 Seconds after Read (Default)</option>
                <option value={10}>🔥 10 Seconds after Read</option>
                <option value={30}>🔥 30 Seconds after Read</option>
                <option value={60}>🔥 1 Minute after Read</option>
                <option value={300}>🔥 5 Minutes after Read</option>
                <option value={0}>Off (Never)</option>
              </select>
              <div className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1 px-1.5 rounded border border-slate-700 flex items-center justify-center space-x-1">
                <span className="text-xs">⏱️</span>
                <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
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
                        className="text-slate-400 hover:text-red-400 p-1 transition cursor-pointer hover:scale-110"
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
                        {msg.imageUrl && (
                          <div className="mb-1.5 rounded-lg overflow-hidden border border-slate-700/60 max-w-[220px]">
                            <img 
                              src={msg.imageUrl} 
                              alt="Attached image" 
                              className="w-full h-auto max-h-[180px] object-cover cursor-pointer hover:opacity-90 transition"
                              onClick={() => window.open(msg.imageUrl!, "_blank")}
                            />
                          </div>
                        )}
                        {msg.message && <p className="whitespace-pre-wrap break-words">{msg.message}</p>}

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

          {/* Image Preview Bar */}
          {selectedImage && (
            <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img src={selectedImage} alt="Preview" className="w-8 h-8 rounded object-cover border border-slate-700" />
                <span className="text-[11px] text-slate-300">Image attached</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-slate-400 hover:text-red-400 text-xs px-1 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <div className="p-2 bg-slate-950 border-t border-slate-800 grid grid-cols-10 gap-1 text-base select-none">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setInputText((prev) => prev + emoji);
                  }}
                  className="hover:bg-slate-800 p-1 rounded text-center transition hover:scale-125 cursor-pointer text-sm"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Message Input Footer */}
          <form onSubmit={handleSendMessage} className="p-2.5 bg-slate-800 border-t border-slate-700 flex items-center space-x-1.5">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageSelect} 
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-700 transition text-sm cursor-pointer"
              title="Attach Image"
            >
              📷
            </button>

            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className={`p-1.5 rounded-lg transition text-sm ${
                showEmojiPicker ? "bg-slate-700 text-amber-400" : "text-slate-400 hover:text-amber-400 hover:bg-slate-700"
              }`}
              title="Add Emoji"
            >
              😊
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={selectedImage ? "Add a caption..." : "Type a message..."}
              className="flex-1 bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />

            <button
              type="submit"
              disabled={loading || (!inputText.trim() && !selectedImage)}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 rounded-xl transition cursor-pointer"
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
