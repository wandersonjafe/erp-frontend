import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Building2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail]           = useState('')
  const [senha, setSenha]           = useState('')
  const [erro, setErro]             = useState('')
  const [carregando, setCarregando] = useState(false)

  const { login }               = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate                = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await login({ email, senha })
      navigate('/dashboard')
    } catch {
      setErro('Email ou senha inválidos')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300"
      style={{ background: 'var(--color-bg-primary)' }}
    >
      {/* Botão de tema */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-20 text-sm px-3 py-2 rounded-full transition-all duration-200"
        style={{
          background: 'var(--color-bg-card)',
          color: 'var(--color-text-secondary)',
          border: '0.5px solid var(--color-border)',
        }}
      >
        {isDark ? '☀️ Modo claro' : '🌙 Modo escuro'}
      </button>

      {/* Ondas animadas */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none">
        <svg
          className="absolute bottom-0 left-0 w-[200%]"
          style={{ height: '180px', animation: 'wave-move 8s linear infinite', opacity: isDark ? 0.15 : 0.4 }}
          viewBox="0 0 1440 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
        >
          <path fill={isDark ? "#ffffff" : "#C4726A"} d="M0,80 C180,140 360,20 540,80 C720,140 900,20 1080,80 C1260,140 1440,20 1440,80 L1440,180 L0,180 Z"/>
          <path fill={isDark ? "#ffffff" : "#C4726A"} d="M1440,80 C1620,140 1800,20 1980,80 C2160,140 2340,20 2520,80 C2700,140 2880,20 2880,80 L2880,180 L1440,180 Z"/>
        </svg>

        <svg
          className="absolute bottom-[10px] left-0 w-[200%]"
          style={{ height: '180px', animation: 'wave-move 12s linear infinite reverse', opacity: isDark ? 0.1 : 0.25 }}
          viewBox="0 0 1440 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
        >
          <path fill={isDark ? "#ffffff" : "#E8A09A"} d="M0,60 C200,120 400,10 600,70 C800,130 1000,10 1200,70 C1400,130 1440,30 1440,70 L1440,180 L0,180 Z"/>
          <path fill={isDark ? "#ffffff" : "#E8A09A"} d="M1440,60 C1640,120 1840,10 2040,70 C2240,130 2440,10 2640,70 C2840,130 2880,30 2880,70 L2880,180 L1440,180 Z"/>
        </svg>

        <svg
          className="absolute bottom-[20px] left-0 w-[200%]"
          style={{ height: '180px', animation: 'wave-move 6s linear infinite', opacity: isDark ? 0.08 : 0.15 }}
          viewBox="0 0 1440 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
        >
          <path fill={isDark ? "#ffffff" : "#F5E6E1"} d="M0,90 C160,150 320,30 480,90 C640,150 800,30 960,90 C1120,150 1280,30 1440,90 L1440,180 L0,180 Z"/>
          <path fill={isDark ? "#ffffff" : "#F5E6E1"} d="M1440,90 C1600,150 1760,30 1920,90 C2080,150 2240,30 2400,90 C2560,150 2720,30 2880,90 L2880,180 L1440,180 Z"/>
        </svg>
      </div>

      {/* Card de login */}
      <div
        className="relative z-10 p-10 rounded-2xl w-full max-w-md transition-colors duration-300"
        style={{
          background: 'var(--color-bg-card)',
          border: '0.5px solid var(--color-border)',
        }}
      >
        {/* Cabeçalho com ícone */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Building2 size={26} style={{ color: 'var(--color-accent)' }} />
            <h1 className="text-3xl font-medium" style={{ color: 'var(--color-text-primary)' }}>
              ERP
            </h1>
          </div>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Entre com sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full rounded-lg px-4 py-3 text-sm outline-none transition"
              style={{
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                border: '0.5px solid var(--color-border)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onBlur={e  => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg px-4 py-3 text-sm outline-none transition"
              style={{
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                border: '0.5px solid var(--color-border)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onBlur={e  => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />
          </div>

          {erro && (
            <p className="text-sm text-center" style={{ color: '#E24B4A' }}>
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
            style={{ background: 'var(--color-accent)', color: '#ffffff' }}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes wave-move {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}