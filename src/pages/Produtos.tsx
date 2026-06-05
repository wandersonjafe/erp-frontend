import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import type { Produto } from '../types'

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const res = await api.get('/produtos')
        setProdutos(res.data)
      } catch {
        console.error('Erro ao carregar produtos')
      } finally {
        setCarregando(false)
      }
    }
    carregarProdutos()
  }, [])

  async function deletarProduto(id: string) {
    if (!confirm('Deseja realmente deletar este produto?')) return
    try {
      await api.delete(`/produtos/${id}`)
      const res = await api.get('/produtos')
      setProdutos(res.data)
    } catch {
      console.error('Erro ao deletar produto')
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Produtos</h2>
          <p className="text-gray-400 mt-1">Gerencie seus produtos</p>
        </div>
        <button
          onClick={() => navigate('/produtos/novo')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + Novo Produto
        </button>
      </div>

      {carregando ? (
        <p className="text-gray-400">Carregando...</p>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-sm px-6 py-4">Nome</th>
                <th className="text-left text-gray-400 text-sm px-6 py-4">Categoria</th>
                <th className="text-left text-gray-400 text-sm px-6 py-4">Preço</th>
                <th className="text-left text-gray-400 text-sm px-6 py-4">Estoque</th>
                <th className="text-left text-gray-400 text-sm px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-8">
                    Nenhum produto cadastrado
                  </td>
                </tr>
              ) : (
                produtos.map((produto) => (
                  <tr key={produto.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4 text-white text-sm">{produto.nome}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{produto.categoria}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      R$ {produto.preco.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={produto.estoque > 0 ? 'text-green-400' : 'text-red-400'}>
                        {produto.estoque} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-4">
                        <button
                            onClick={() => navigate(`/produtos/editar/${produto.id}`)}
                            className="text-blue-400 hover:text-blue-300 text-sm transition"
                        >
                            Editar
                        </button>
                        <button
                            onClick={() => deletarProduto(produto.id)}
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