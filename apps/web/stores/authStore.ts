
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  

  setAuth: (token: string, user: any) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        localStorage.setItem("authorization", token);
        localStorage.setItem("user", JSON.stringify(user));
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('authorization');
        localStorage.removeItem('user');
        set({ token: null, user: null, isAuthenticated: false });
        window.location.href = '/';
      },

      checkAuth: () => {
        const { token } = get();
        return !!token;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
