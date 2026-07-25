import { create } from "zustand";
import { ConversationType, MessageType } from "@/types";

interface ChatState {
  conversations: ConversationType[];
  activeConversation: ConversationType | null;
  messages: MessageType[];
  isOpen: boolean;
  setConversations: (conversations: ConversationType[]) => void;
  setActiveConversation: (conversation: ConversationType | null) => void;
  setMessages: (messages: MessageType[]) => void;
  addMessage: (message: MessageType) => void;
  toggleChat: () => void;
  setOpen: (open: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isOpen: false,
  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (conversation) => set({ activeConversation: conversation }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (isOpen) => set({ isOpen }),
}));
