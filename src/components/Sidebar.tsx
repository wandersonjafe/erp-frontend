import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Sun,
  Moon,
  LogOut,
  Building2,
  Menu,
  X,
} from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/clientes',  label: 'Clientes',  icon: <Users size={18} />           },
  { to: '/produtos',  label: 'Produtos',  icon: <Package size={18} />         },
  { to: '/vendas',    label: 'Vendas',    icon: <ShoppingCart size={18} />    },
]

export default function Sidebar() {
  const { usuario, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileAberto, setMobileAberto] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function fecharMobile() {
    setMobileAberto(false)
  }

  // ── Conteúdo interno da sidebar (reutilizado nos dois modos) ───────────────
  function SidebarContent() {
    return (
      <>
        {/* Logo */}
        <div className="p-6" style={{ borderBottom: '0.5px solid var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <Building2 size={20} style={{ color: 'var(--color-accent)' }} />
            <h1 className="text-xl font-medium" style={{ color: 'var(--color-text-primary)' }}>
              ERP
            </h1>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {usuario?.nome}
          </p>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={fecharMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive ? 'active-nav' : 'inactive-nav'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: isDark ? '#1E1E1E' : '#ffffff',
                      color: 'var(--color-text-primary)',
                      borderLeft: '3px solid var(--color-accent)',
                      paddingLeft: '13px',
                    }
                  : { color: 'var(--color-text-secondary)' }
              }
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Rodapé: tema + logout */}
        <div className="p-4 space-y-1" style={{ borderTop: '0.5px solid var(--color-border)' }}>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#1E1E1E' : '#EDD5CC'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </span>
            {isDark ? 'Modo claro' : 'Modo escuro'}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#1E1E1E' : '#EDD5CC'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <LogOut size={18} />
            </span>
            Sair
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      {/* ── Desktop: sidebar fixa (≥ 768px) ────────────────────────────────── */}
      <aside
        className="hidden md:flex w-64 flex-col h-screen fixed transition-colors duration-300"
        style={{
          background: 'var(--color-sidebar)',
          borderRight: '0.5px solid var(--color-border)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile: topbar + gaveta deslizante (< 768px) ───────────────────── */}
      <div className="md:hidden">
        {/* Topbar fixa */}
        <div
          className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
          style={{
            background: 'var(--color-sidebar)',
            borderBottom: '0.5px solid var(--color-border)',
            height: '56px',
          }}
        >
          <div className="flex items-center gap-2">
            <Building2 size={18} style={{ color: 'var(--color-accent)' }} />
            <span className="font-medium text-base" style={{ color: 'var(--color-text-primary)' }}>ERP</span>
          </div>
          <button
            onClick={() => setMobileAberto(true)}
            style={{ color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Overlay escurecido */}
        {mobileAberto && (
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={fecharMobile}
          />
        )}

        {/* Gaveta lateral */}
        <aside
          className="fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300"
          style={{
            width: '260px',
            background: 'var(--color-sidebar)',
            borderRight: '0.5px solid var(--color-border)',
            transform: mobileAberto ? 'translateX(0)' : 'translateX(-100%)',
          }}
        >
          {/* Botão fechar */}
          <div
            className="flex items-center justify-between p-4"
            style={{ borderBottom: '0.5px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2">
              <Building2 size={18} style={{ color: 'var(--color-accent)' }} />
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>ERP</span>
            </div>
            <button
              onClick={fecharMobile}
              style={{ color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Nome do usuário */}
          <div className="px-6 py-3" style={{ borderBottom: '0.5px solid var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{usuario?.nome}</p>
          </div>

          {/* Links de navegação */}
          <nav className="flex-1 p-4 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={fecharMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive ? 'active-nav' : 'inactive-nav'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background: isDark ? '#1E1E1E' : '#ffffff',
                        color: 'var(--color-text-primary)',
                        borderLeft: '3px solid var(--color-accent)',
                        paddingLeft: '13px',
                      }
                    : { color: 'var(--color-text-secondary)' }
                }
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Tema + logout */}
          <div className="p-4 space-y-1" style={{ borderTop: '0.5px solid var(--color-border)' }}>
            <button
              onClick={() => { toggleTheme(); fecharMobile() }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200"
              style={{ color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </span>
              {isDark ? 'Modo claro' : 'Modo escuro'}
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200"
              style={{ color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <LogOut size={18} />
              </span>
              Sair
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}