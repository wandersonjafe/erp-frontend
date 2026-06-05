import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/dashboard', label: '📊 Dashboard' },
  { to: '/clientes', label: '👥 Clientes' },
  { to: '/produtos', label: '📦 Produtos' },
  { to: '/vendas', label: '🛒 Vendas' },
]

export default function Sidebar() {
    const { usuario, logout } = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/login')
    }

 return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen fixed">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">ERP</h1>
        <p className="text-gray-400 text-sm mt-1">{usuario?.nome}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
        >
          🚪 Sair
        </button>
      </div>
    </aside>
  )
}