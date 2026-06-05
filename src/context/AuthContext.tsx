import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { LoginRequest, LoginResponse } from '../types'
import api from '../services/api'

interface AuthContextData {
  usuario: LoginResponse | null
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<LoginResponse | null>(null)

useEffect(() => {
    const token = localStorage.getItem('token')
    const nome = localStorage.getItem('nome')
    const email = localStorage.getItem('email')

    if (token && nome && email) {
      setUsuario({ token, nome, email })
    }
  }, [])

  async function login(data: LoginRequest) {
    const response = await api.post<LoginResponse>('/usuarios/login', data)
    const { token, nome, email } = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('nome', nome)
    localStorage.setItem('email', email)

    setUsuario({ token, nome, email })
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('nome')
    localStorage.removeItem('email')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, isAuthenticated: !!usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}