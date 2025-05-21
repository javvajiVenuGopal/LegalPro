import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // Add this import
import axios from 'axios';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  Token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      Token: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        const data = { email, password };
        try {
          const response = await axios.post('http://127.0.0.1:7000/users/login/', data, {
            headers: { 'Content-Type': 'application/json' },
          });

          if (response.status !== 200) {
            throw new Error('Login failed');
          }

          const user = response.data.user;
          console.log('user', user);
          localStorage.setItem('user', JSON.stringify(user)); 
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            Token: response.data.token.access,
          });
        } catch (apiError) {
          set({ isLoading: false });
          throw new Error('Failed to connect to server. Please try again.');
        }
      },

      register: async (formData: FormData) => {
        set({ isLoading: true });
        try {
          const response = await axios.post('http://127.0.0.1:7000/users/register/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          let user;
          if (response.data.user) {
            user = response.data.user;
          } else if (response.data.data) {
            user = response.data.data;
          } else {
            const role = formData.get('role') as string;
            user = {
              id: Math.random().toString(36).substring(2, 9),
              name: formData.get('username') as string,
              email: formData.get('email') as string,
              role: role as UserRole,
              createdAt: new Date().toISOString(),
            };
          }

          if (!user.role && formData.get('role')) {
            user.role = formData.get('role') as UserRole;
          }

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            Token: response.data.access,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Registration failed');
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          Token: null,
        });
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw new Error('Password reset failed');
        }
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage', // key in localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        Token: state.Token,
      }),
    }
  )
);