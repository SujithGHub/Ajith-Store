import { create } from 'zustand'
import api from '@/lib/api'
import type { User, LoginRequest, LoginResponse } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,

  login: async (data: LoginRequest) => {
    set({ isLoading: true })
    try {
      const { data: response } = await api.post<LoginResponse>('/auth/login', data)
      localStorage.setItem('access_token', response.accessToken)
      localStorage.setItem('refresh_token', response.refreshToken)
      set({ user: response.user, isAuthenticated: true })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    localStorage.clear()
    set({ user: null, isAuthenticated: false })
    window.location.href = '/auth/login'
  },

  checkAuth: async () => {
    try {
      const { data } = await api.get<User>('/auth/me')
      set({ user: data, isAuthenticated: true })
    } catch {
      set({ user: null, isAuthenticated: false })
    }
  },
}))
