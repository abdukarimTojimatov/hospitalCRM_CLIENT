// src/store/useUIStore.ts
import { create } from "zustand";

interface UIState {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  darkMode: false,
  toggleDarkMode: () => {
    const current = get().darkMode;
    set({ darkMode: !current });
  },
}));
