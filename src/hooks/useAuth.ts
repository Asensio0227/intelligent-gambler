import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, login, register, logout, loadUser, restoreSession } =
    useAuthStore();
  return { user, token, isAuthenticated, isLoading, login, register, logout, loadUser, restoreSession };
};
