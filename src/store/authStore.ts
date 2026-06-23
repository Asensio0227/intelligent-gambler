import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IUser, IAuthState, ILoginPayload, IRegisterPayload } from '@/types/auth.types';
import { authService } from '@/services/auth.service';
import { TOKEN_KEY } from '@/constants/config';
import { registerAndSendPushToken } from '@/utils/registerPushToken';

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenFresh(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now() + 30_000;
}

interface AuthStore extends IAuthState {
  login: (payload: ILoginPayload) => Promise<void>;
  register: (payload: IRegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setUser: (user: IUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user }),

  clearAuth: () => set({ token: null, user: null, isAuthenticated: false, isLoading: false }),

  login: async (payload) => {
    set({ isLoading: true });
    try {
      const res = await authService.login(payload);
      const { token, user } = res.data as { token: string; user: IUser };
      await AsyncStorage.setItem(TOKEN_KEY, token);
      set({ token, user, isAuthenticated: true, isLoading: false });

      // Register push token in background — non-blocking
      registerAndSendPushToken();
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      const res = await authService.register(payload);
      const { token, user } = res.data as { token: string; user: IUser };
      await AsyncStorage.setItem(TOKEN_KEY, token);
      set({ token, user, isAuthenticated: true, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Even if backend call fails, still clear local session
    }
    await AsyncStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  /**
   * Background profile refresh — called after optimistic unlock.
   * NEVER clears auth on failure: the token is already proven locally valid,
   * so a slow/failed /me should silently degrade, not log the user out.
   */
  loadUser: async () => {
    try {
      const res = await authService.me();
      const { user } = res.data as { user: IUser };
      // Only update user data — never touch isAuthenticated here
      set({ user });
    } catch {
      // /me failed (slow server, transient error) — stay logged in with
      // the partial JWT-decoded user. A hard 401 is handled separately
      // by the axios interceptor → clearAuth().
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });

    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (!token) {
        set({ isLoading: false });
        return;
      }

      if (!isTokenFresh(token)) {
        await AsyncStorage.removeItem(TOKEN_KEY);
        set({ isLoading: false });
        return;
      }

      const payload = decodeJwtPayload(token);
      if (!payload?.userId) {
        await AsyncStorage.removeItem(TOKEN_KEY);
        set({ isLoading: false });
        return;
      }

      // Unlock immediately with JWT data — no network call blocking navigation
      set({
        token,
        user: { _id: payload.userId, role: payload.role } as IUser,
        isAuthenticated: true,
        isLoading: false, // ← always set false here before any async work
      });

      // Register push token in background on session restore too
      registerAndSendPushToken();

      // Background refresh — completely detached, never blocks or logs out
      authService.me().then((res) => {
        try {
          const { user } = res.data as { user: IUser };
          set({ user });
        } catch {}
      }).catch(() => {});

    } catch {
      // Any error — just unlock and send to login
      set({ isLoading: false });
    }
  },
}));
