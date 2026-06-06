import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import type { Cliente } from '../types'
import { useNavigate } from 'react-router-dom'

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function carregarClientes() {
      try {
        const res = await api.get('/clientes')
        setClientes(res.data)
      } catch {
        console.error('Erro ao carregar clientes')
      } finally {
        setCarregando(false)
      }
    }
    carregarClientes()
  }, [])

  async function deletarCliente(id: string) {
    if (!confirm('Deseja realmente deletar este cliente?')) return
    try {
      await api.delete(`/clientes/${id}`)
      const res = await api.get('/clientes')
      setClientes(res.data)
    } catch {
      console.error('Erro ao deletar cliente')
    }
  }

  const clientesFiltrados = clientes.filter(cliente =>
    `${cliente.nome} ${cliente.email} ${cliente.cpf} ${cliente.cidade}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  )

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 style={{ color: 'var(--color-text-primary)', fontSize: '24px', fontWeight: 'bold' }}>
            Clientes
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px', fontSize: '14px' }}>
            Gerencie seus clientes
          </p>
        </div>

        <button
          onClick={() => navigate('/clientes/novo')}
          style={{
            background: 'var(--color-accent)',
            color: '#fff',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          + Novo Cliente
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            background: 'var(--color-bg-card)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </div>

      {carregando ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>Carregando...</p>
      ) : (
        <div
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Nome', 'Email', 'CPF', 'Cidade', 'Ações'].map(col => (
                  <th
                    key={col}
                    style={{
                      textAlign: 'left',
                      color: 'var(--color-text-muted)',
                      fontSize: '13px',
                      fontWeight: 500,
                      padding: '14px 24px',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: 'center',
                      color: 'var(--color-text-muted)',
                      padding: '32px',
                      fontSize: '14px',
                    }}
                  >
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr
                    key={cliente.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td
                      style={{
                        padding: '14px 24px',
                        color: 'var(--color-text-primary)',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                    >
                      {cliente.nome}
                    </td>

                    <td
                      style={{
                        padding: '14px 24px',
                        color: 'var(--color-text-secondary)',
                        fontSize: '14px',
                      }}
                    >
                      {cliente.email}
                    </td>

                    <td
                      style={{
                        padding: '14px 24px',
                        color: 'var(--color-text-secondary)',
                        fontSize: '14px',
                      }}
                    >
                      {cliente.cpf}
                    </td>

                    <td
                      style={{
                        padding: '14px 24px',
                        color: 'var(--color-text-secondary)',
                        fontSize: '14px',
                      }}
                    >
                      {cliente.cidade}
                    </td>

                    <td style={{ padding: '14px 24px' }}>
                      <button
                        onClick={() => deletarCliente(cliente.id)}
                        style={{
                          color: '#e05252',
                          background: 'none',
                          border: 'none',
                          fontSize: '13px',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}