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

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className="w-64 flex flex-col h-screen fixed transition-colors duration-300"
      style={{
        background: 'var(--color-sidebar)',
        borderRight: '0.5px solid var(--color-border)',
      }}
    >
      {/* Logo */}
      <div
        className="p-6"
        style={{ borderBottom: '0.5px solid var(--color-border)' }}
      >
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
                : {
                    color: 'var(--color-text-secondary)',
                  }
            }
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Rodapé: tema + logout */}
      <div
        className="p-4 space-y-1"
        style={{ borderTop: '0.5px solid var(--color-border)' }}
      >
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
    </aside>
  )
}