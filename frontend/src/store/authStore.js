import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useThemeStore } from './themeStore'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        set({ token: null, user: null })
        useThemeStore.getState().setTema('light')
        window.location.href = '/login'
      },
      isAdmin: () => get().user?.rol === 'ADMIN' || get().user?.rol === 'SUPERADMIN',
      isSuperAdmin: () => get().user?.rol === 'SUPERADMIN',
    }),
    {
      name: 'fct-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
