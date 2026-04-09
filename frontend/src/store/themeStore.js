import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      tema: 'light',
      setTema: (tema) => set({ tema }),
      toggleTema: () => set((state) => ({
        tema: state.tema === 'light' ? 'dark' : 'light'
      })),
      isDark: () => get().tema === 'dark',
    }),
    {
      name: 'fct-theme',
    }
  )
)