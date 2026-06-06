import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import type { Produto } from '../types'

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
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

  const produtosFiltrados = produtos.filter(produto =>
    `${produto.nome} ${produto.categoria}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  )

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 style={{ color: 'var(--color-text-primary)', fontSize: '24px', fontWeight: 'bold' }}>
            Produtos
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px', fontSize: '14px' }}>
            Gerencie seus produtos
          </p>
        </div>

        <button
          onClick={() => navigate('/produtos/novo')}
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
          + Novo Produto
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Buscar produto..."
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
                {['Nome', 'Categoria', 'Preço', 'Estoque', 'Ações'].map(col => (
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
              {produtosFiltrados.length === 0 ? (
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
                    Nenhum produto encontrado
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((produto) => (
                  <tr
                    key={produto.id}
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
                      {produto.nome}
                    </td>

                    <td style={{ padding: '14px 24px', fontSize: '13px' }}>
                      <span
                        style={{
                          background: 'var(--color-bg-secondary)',
                          color: 'var(--color-text-secondary)',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        {produto.categoria}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: '14px 24px',
                        color: 'var(--color-text-primary)',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                    >
                      R$ {produto.preco.toFixed(2)}
                    </td>

                    <td style={{ padding: '14px 24px', fontSize: '14px' }}>
                      <span
                        style={{
                          color: produto.estoque > 0 ? '#3a9e6e' : '#e05252',
                          fontWeight: 500,
                        }}
                      >
                        {produto.estoque} unidades
                      </span>
                    </td>

                    <td style={{ padding: '14px 24px', display: 'flex', gap: '16px' }}>
                      <button
                        onClick={() => navigate(`/produtos/editar/${produto.id}`)}
                        style={{
                          color: 'var(--color-accent)',
                          background: 'none',
                          border: 'none',
                          fontSize: '13px',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => deletarProduto(produto.id)}
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