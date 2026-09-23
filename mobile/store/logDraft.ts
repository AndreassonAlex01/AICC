// store/logDraft.ts
// Lives outside any single screen component, so switching tabs mid-log no
// longer clears the photo/items — this is the fix for the web app's
// "photo gets removed when switching tabs" bug (app/log/page.tsx there
// keeps this in local component state, which Next.js unmounts on nav).
import { create } from "zustand";
import type { FoodItem } from "@/lib/types";

interface LogDraftState {
  photoUri: string | null;
  items: FoodItem[];
  analyzing: boolean;
  error: string | null;
  setPhoto: (uri: string | null) => void;
  setItems: (items: FoodItem[]) => void;
  updateItem: (index: number, item: FoodItem) => void;
  removeItem: (index: number) => void;
  addItem: (item: FoodItem) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useLogDraft = create<LogDraftState>((set) => ({
  photoUri: null,
  items: [],
  analyzing: false,
  error: null,
  setPhoto: (uri) => set({ photoUri: uri }),
  setItems: (items) => set({ items }),
  updateItem: (index, item) =>
    set((state) => ({ items: state.items.map((it, i) => (i === index ? item : it)) })),
  removeItem: (index) => set((state) => ({ items: state.items.filter((_, i) => i !== index) })),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  setAnalyzing: (analyzing) => set({ analyzing }),
  setError: (error) => set({ error }),
  reset: () => set({ photoUri: null, items: [], analyzing: false, error: null }),
}));
