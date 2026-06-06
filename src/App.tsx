import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import ClienteForm from './pages/ClienteForm'
import Produtos from './pages/Produtos'
import ProdutoForm from './pages/ProdutoForm'
import ProdutoEditar from './pages/ProdutoEditar'
import Vendas from './pages/Vendas'

const queryClient = new QueryClient()

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>

              <Route path="/login" element={<Login />} />

              <Route path="/dashboard" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
              } />

              <Route path="/clientes" element={
                <PrivateRoute><Clientes /></PrivateRoute>
              } />

              <Route path="/clientes/novo" element={
                <PrivateRoute><ClienteForm /></PrivateRoute>
              } />

              <Route path="/produtos" element={
                <PrivateRoute><Produtos /></PrivateRoute>
              } />

              <Route path="/produtos/novo" element={
                <PrivateRoute><ProdutoForm /></PrivateRoute>
              } />

              <Route path="/produtos/editar/:id" element={
                <PrivateRoute><ProdutoEditar /></PrivateRoute>
              } />

              <Route path="/vendas" element={
                <PrivateRoute><Vendas /></PrivateRoute>
              } />

              <Route path="*" element={<Navigate to="/login" replace />} />

            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}