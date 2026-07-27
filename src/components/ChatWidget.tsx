"use client";

import { useState, useEffect, useRef } from "react";
import { HiOutlineChatBubbleLeftRight, HiOutlineXMark, HiOutlinePaperAirplane } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/locale";
import { useAuthStore } from "@/store/authStore";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [convId, setConvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const t = useT();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isOpen || !user) return;
    fetch("/api/conversations", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).then(r => r.json()).then(data => {
      const convs = data.conversations || [];
      if (convs.length > 0) {
        setConvId(convs[0].id);
        fetch(`/api/conversations/${convs[0].id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).then(r => r.json()).then(d => setMessages(d.messages || []));
      }
    }).catch(() => {});
  }, [isOpen, user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    const token = localStorage.getItem("token");
    if (!convId) {
      setLoading(true);
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ shopId: "support", content: input.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setConvId(data.conversation.id);
        setMessages(data.messages || []);
        setInput("");
      } catch { /* ignore */ } finally { setLoading(false); }
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ conversationId: convId, content: input.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, data.message]);
        setInput("");
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
      >
        {isOpen ? <HiOutlineXMark className="w-6 h-6" /> : <HiOutlineChatBubbleLeftRight className="w-6 h-6" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 glass-card shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-primary to-accent p-4 text-white">
              <h3 className="font-semibold">მხარდაჭერა</h3>
              <p className="text-sm text-white/80">მოგვწერეთ შეტყობინება</p>
            </div>
            <div className="h-80 flex flex-col">
              {user ? (
                <>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {messages.length === 0 && (
                      <p className="text-gray-400 text-sm text-center pt-8">დაწერეთ შეტყობინება</p>
                    )}
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-2.5 rounded-2xl text-sm ${msg.senderId === user.id ? "bg-primary text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={sendMessage} className="p-3 border-t border-gray-100 flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="დაწერეთ მესიჯი..."
                      className="input-field text-sm flex-1"
                      disabled={loading}
                    />
                    <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-3">
                      <HiOutlinePaperAirplane className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                  <p className="text-gray-500 mb-3">გთხოვთ შეხვიდეთ ანგარიშზე</p>
                  <a href="/login" className="btn-primary text-sm">შესვლა</a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
