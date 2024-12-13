// src/store/useAuthStore.ts
import { create } from "zustand";
import { setToken, getToken, removeToken } from "../utils/token";
import { decodeToken } from "../utils/roles";

type UserRole = "CEO" | "Admin" | "Reception" | null;

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  userId: string | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: null,
  userId: null,
  token: null,
  login: (token: string) => {
    setToken(token);
    const payload = decodeToken(token);
    if (payload) {
      set({
        isAuthenticated: true,
        role: payload.role,
        userId: payload.id,
        token: token,
      });
    } else {
      // Handle invalid token
      set({
        isAuthenticated: false,
        role: null,
        userId: null,
        token: null,
      });
    }
  },
  logout: () => {
    removeToken();
    set({
      isAuthenticated: false,
      role: null,
      userId: null,
      token: null,
    });
  },
}));
