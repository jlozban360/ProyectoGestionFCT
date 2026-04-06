import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        set({ token: null, user: null })
        window.location.href = '/login'
      },
      isAdmin: () => get().user?.rol === 'ADMIN',
    }),
    {
      name: 'fct-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
