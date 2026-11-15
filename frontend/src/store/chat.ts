import { create } from "zustand";
import type { ChatMode, TimeOffDraft, TimeOffRequest } from "../api/schemas";

export type DraftState = "open" | "sent" | "cancelled";

export type ChatEntry =
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "bot"; text: string; sources: string[] }
  | { id: string; kind: "draft"; text: string; draft: TimeOffDraft; state: DraftState }
  | { id: string; kind: "created"; request: TimeOffRequest }
  | { id: string; kind: "error"; text: string; retry: string };

export type DraftEntry = Extract<ChatEntry, { kind: "draft" }>;
export type ErrorEntry = Extract<ChatEntry, { kind: "error" }>;

type WithoutId<T> = T extends unknown ? Omit<T, "id"> : never;

type ChatState = {
  entries: ChatEntry[];
  mode: ChatMode | null;
  push: (entry: WithoutId<ChatEntry>) => void;
  remove: (id: string) => void;
  setDraftState: (id: string, state: DraftState) => void;
  setMode: (mode: ChatMode) => void;
  reset: () => void;
};

let sequence = 0;

export const useChat = create<ChatState>()((set) => ({
  entries: [],
  mode: null,
  push: (entry) => set((state) => ({ entries: [...state.entries, { ...entry, id: `m${++sequence}` } as ChatEntry] })),
  remove: (id) => set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) })),
  setDraftState: (id, draftState) =>
    set((state) => ({
      entries: state.entries.map((entry) =>
        entry.id === id && entry.kind === "draft" ? { ...entry, state: draftState } : entry,
      ),
    })),
  setMode: (mode) => set({ mode }),
  reset: () => set({ entries: [], mode: null }),
}));
