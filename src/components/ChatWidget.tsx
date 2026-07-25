"use client";

import { useState } from "react";
import Link from "next/link";
import { HiOutlineChatBubbleLeftRight, HiOutlineXMark } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/locale";
import { useAuthStore } from "@/store/authStore";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const t = useT();

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
              <h3 className="font-semibold">{t.chat.title}</h3>
              <p className="text-sm text-white/80">{t.chat.startConversation}</p>
            </div>
            <div className="h-80 flex flex-col">
              {user ? (
                <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
                  <p className="text-gray-400 mb-4">{t.chat.noMessages}</p>
                  <Link href="/chat" onClick={() => setIsOpen(false)} className="btn-primary text-sm">
                    {t.chat.startConversation}
                  </Link>
                </div>
              ) : (
                <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
                  <p className="text-gray-500 mb-4">{t.nav.login}</p>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="btn-primary text-sm">
                    {t.nav.login}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
