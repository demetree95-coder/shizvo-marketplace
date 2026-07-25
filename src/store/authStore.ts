import { create } from "zustand";
import { UserType } from "@/types";
import { api } from "@/lib/api";

function useFirebase(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("firebase") === "true"
    || process.env.NEXT_PUBLIC_AUTH_PROVIDER === "firebase";
}

interface AuthState {
  user: UserType | null;
  isLoading: boolean;
  setUser: (user: UserType | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),

  initAuth: () => {
    if (typeof window === "undefined") return;

    if (useFirebase()) {
      import("@/lib/firebase").then(({ auth }) => {
        import("firebase/auth").then(({ onAuthStateChanged }) => {
          onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
              try {
                const token = await fbUser.getIdToken();
                const res = await api("/api/auth/login", {
                  method: "POST",
                  body: JSON.stringify({ token }),
                });
                if (res.ok) {
                  const data = await res.json();
                  set({ user: data.user, isLoading: false });
                  return;
                }
              } catch { /* ignore */ }
            }
            set({ user: null, isLoading: false });
          });
        });
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      get().refreshUser();
    } else {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    if (useFirebase()) {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      const res = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      set({ user: data.user, isLoading: false });
    } else {
      const res = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem("token", data.token);
      set({ user: data.user, isLoading: false });
    }
  },

  register: async ({ email, password, fullName, phone }) => {
    if (useFirebase()) {
      const { createUserWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      const res = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ token, fullName, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        await cred.user.delete().catch(() => {});
        throw new Error(data.message);
      }
      set({ user: data.user, isLoading: false });
    } else {
      const res = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, fullName, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem("token", data.token);
      set({ user: data.user, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, isLoading: false });
  },

  refreshUser: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        set({ user: null, isLoading: false });
        return;
      }
      const res = await api("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        localStorage.removeItem("token");
        set({ user: null, isLoading: false });
        return;
      }
      const user = await res.json();
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
