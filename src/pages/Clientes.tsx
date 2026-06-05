import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import type { Cliente } from '../types'
import { useNavigate } from 'react-router-dom'

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
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

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Clientes
          </h2>

          <p className="text-gray-400 mt-1">
            Gerencie seus clientes
          </p>
        </div>

        <button
            onClick={() => navigate('/clientes/novo')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + Novo Cliente
        </button>
      </div>

      {carregando ? (
        <p className="text-gray-400">Carregando...</p>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-sm px-6 py-4">
                  Nome
                </th>

                <th className="text-left text-gray-400 text-sm px-6 py-4">
                  Email
                </th>

                <th className="text-left text-gray-400 text-sm px-6 py-4">
                  CPF
                </th>

                <th className="text-left text-gray-400 text-sm px-6 py-4">
                  Cidade
                </th>

                <th className="text-left text-gray-400 text-sm px-6 py-4">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-gray-400 py-8"
                  >
                    Nenhum cliente cadastrado
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition"
                  >
                    <td className="px-6 py-4 text-white text-sm">
                      {cliente.nome}
                    </td>

                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {cliente.email}
                    </td>

                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {cliente.cpf}
                    </td>

                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {cliente.cidade}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => deletarCliente(cliente.id)}
                        className="text-red-400 hover:text-red-300 text-sm transition"
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