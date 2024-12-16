import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setToken, getToken, removeToken } from "../utils/token";
import { decodeToken } from "../utils/roles";

type UserRole = "CEO" | "Admin" | "Reception" | null;

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  userId: string | null;
  token: string | null;
  email: string | null;
  login: (token: string) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      role: null,
      userId: null,
      token: null,
      email: null,

      login: (token: string) => {
        setToken(token);
        const payload = decodeToken(token);
        if (payload) {
          set({
            isAuthenticated: true,
            role: payload.role,
            email: payload.email,
            userId: payload.id,
            token: token,
          });
        } else {
          set({
            isAuthenticated: false,
            role: null,
            userId: null,
            token: null,
            email: null,
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
          email: null,
        });
      },

      initializeAuth: () => {
        const token = getToken();

        if (token) {
          try {
            const payload = decodeToken(token);

            // Check token validity and expiration
            if (payload && (!payload.exp || payload.exp > Date.now() / 1000)) {
              set({
                isAuthenticated: true,
                role: payload.role,
                userId: payload.id,
                token: token,
                email: payload.email,
              });
              return;
            }
          } catch (error) {
            console.error("Token initialization error:", error);
          }
        }

        // If token is invalid or expired, reset auth state
        set({
          isAuthenticated: false,
          role: null,
          userId: null,
          token: null,
          email: null,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        userId: state.userId,
        token: state.token,
        email: state.email,
      }),
    }
  )
);
