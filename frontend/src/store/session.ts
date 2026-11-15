import { create } from "zustand";
import type { User } from "../api/schemas";

type SessionState = {
  token: string | null;
  user: User | null;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
};

export const useSession = create<SessionState>()((set) => ({
  token: null,
  user: null,
  signIn: (token, user) => set({ token, user }),
  signOut: () => set({ token: null, user: null }),
}));
