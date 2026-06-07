import { create } from 'zustand'
import api from '@/lib/api'
import type { User, LoginRequest } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface TokenData {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,

  login: async (data: LoginRequest) => {
    set({ isLoading: true })
    try {
      const { data: response } = await api.post<ApiResponse<TokenData>>('/auth/login', data)
      const { accessToken, refreshToken, user } = response.data
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
      set({ user, isAuthenticated: true })
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
      const { data: response } = await api.get<ApiResponse<User>>('/auth/me')
      set({ user: response.data, isAuthenticated: true })
    } catch {
      set({ user: null, isAuthenticated: false })
    }
  },
}))
