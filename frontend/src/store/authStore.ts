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
  expiresIn: number | null
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

let sessionTimer: ReturnType<typeof setTimeout> | null = null

function clearSessionTimer() {
  if (sessionTimer) {
    clearTimeout(sessionTimer)
    sessionTimer = null
  }
}

function startSessionTimer(expiresIn: number, logout: () => void) {
  clearSessionTimer()
  sessionTimer = setTimeout(() => {
    logout()
  }, expiresIn)
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  expiresIn: null,

  login: async (data: LoginRequest) => {
    set({ isLoading: true })
    try {
      const { data: response } = await api.post<ApiResponse<TokenData>>('/auth/login', data)
      const { accessToken, refreshToken, expiresIn, user } = response.data
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
      startSessionTimer(expiresIn, get().logout)
      set({ user, isAuthenticated: true, expiresIn })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    clearSessionTimer()
    localStorage.clear()
    set({ user: null, isAuthenticated: false, expiresIn: null })
    window.location.href = '/auth/login'
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      set({ user: null, isAuthenticated: false })
      return
    }
    set({ isLoading: true })
    try {
      const { data: response } = await api.get<ApiResponse<User>>('/auth/me')
      set({ user: response.data, isAuthenticated: true })
    } catch {
      localStorage.clear()
      set({ user: null, isAuthenticated: false })
    } finally {
      set({ isLoading: false })
    }
  },
}))
