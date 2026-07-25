"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { ge } from "@/lib/ge";
import { formatDateTime } from "@/lib/utils";
import { HiOutlinePaperAirplane, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

export default function ChatPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetch("/api/conversations", { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => r.json()).then(data => setConversations(data.conversations || [])).catch(() => {});
  }, [user, router]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const openConversation = async (conv: any) => {
    setActiveConv(conv);
    try {
      const res = await fetch(`/api/conversations/${conv.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch { setMessages([]); }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConv) return;
    try {
      const res = await fetch("/api/messages", {
        method: "POST", headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConv.id, content: messageInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages([...messages, data.message]);
        setMessageInput("");
      }
    } catch { toast.error("შეცდომა"); }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8 h-[calc(100vh-6rem)]">
        <div className="glass-card h-full flex overflow-hidden">
          <div className="w-72 border-r border-gray-100 flex-shrink-0 hidden md:flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold">{ge.chat.title}</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">{ge.chat.noMessages}</div>
              ) : (
                conversations.map((conv) => (
                  <button key={conv.id} onClick={() => openConversation(conv)} className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${activeConv?.id === conv.id ? "bg-primary/5" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                        {conv.user?.fullName?.charAt(0) || conv.shop?.name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{conv.user?.fullName || conv.shop?.name}</p>
                        {conv.messages?.[0] && <p className="text-xs text-gray-500 truncate">{conv.messages[0].content}</p>}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            {activeConv ? (
              <>
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary">
                    {activeConv.user?.fullName?.charAt(0) || activeConv.shop?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{activeConv.user?.fullName || activeConv.shop?.name}</p>
                    <p className="text-xs text-green-500">{ge.chat.online}</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl ${msg.senderId === user?.id ? "bg-primary text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${msg.senderId === user?.id ? "text-white/60" : "text-gray-400"}`}>{formatDateTime(msg.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex gap-3">
                  <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder={ge.chat.typeMessage} className="input-field" />
                  <button type="submit" className="btn-primary px-4"><HiOutlinePaperAirplane className="w-5 h-5" /></button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <HiOutlineChatBubbleLeftRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{ge.chat.startConversation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
