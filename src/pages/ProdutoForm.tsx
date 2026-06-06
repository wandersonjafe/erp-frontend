import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

const categorias = ['ELETRONICO', 'ALIMENTO', 'VESTUARIO', 'MOVEL', 'OUTROS']

const categoriaLabel: Record<string, string> = {
  ELETRONICO: 'Eletrônico',
  ALIMENTO: 'Alimento',
  VESTUARIO: 'Vestuário',
  MOVEL: 'Móvel',
  OUTROS: 'Outros',
}

export default function ProdutoEditar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(false)
  const [carregandoDados, setCarregandoDados] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: '',
    categoria: '',
  })

  useEffect(() => {
    async function carregarProduto() {
      try {
        const res = await api.get(`/produtos/${id}`)
        const p = res.data
        setForm({
          nome: p.nome ?? '',
          descricao: p.descricao ?? '',
          preco: String(p.preco ?? ''),
          estoque: String(p.estoque ?? ''),
          categoria: p.categoria ?? '',
        })
      } catch (error) {
        console.error('Erro ao carregar produto:', (error as { mensagemAmigavel?: string }).mensagemAmigavel ?? error)
      } finally {
        setCarregandoDados(false)
      }
    }
    carregarProduto()
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErro(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro(null)
    try {
      await api.put(`/produtos/${id}`, {
        ...form,
        preco: parseFloat(form.preco),
        estoque: parseInt(form.estoque),
      })
      navigate('/produtos')
    } catch (error) {
      const mensagem =
        (error as { mensagemAmigavel?: string }).mensagemAmigavel ??
        'Erro ao atualizar produto. Verifique os dados.'
      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-bg-input)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: '6px',
  }

  if (carregandoDados) {
    return (
      <Layout>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Carregando produto...</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ maxWidth: '640px' }}>
        {/* Cabeçalho */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/produtos')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent)',
              cursor: 'pointer',
              fontSize: '13px',
              padding: 0,
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ← Voltar para Produtos
          </button>
          <h2 style={{ color: 'var(--color-text-primary)', fontSize: '22px', fontWeight: 700, margin: 0 }}>
            Editar Produto
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Atualize as informações do produto
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '28px',
          }}
        >
          {/* Seção: Informações */}
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Informações do Produto
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Nome *</label>
              <input
                style={inputStyle}
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: Notebook Dell Inspiron"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Descrição</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                placeholder="Descreva o produto brevemente..."
              />
            </div>

            <div>
              <label style={labelStyle}>Categoria *</label>
              <select
                style={inputStyle}
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((c) => (
                  <option key={c} value={c}>{categoriaLabel[c]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Divisor */}
          <div style={{ height: '1px', background: 'var(--color-border)', margin: '20px 0' }} />

          {/* Seção: Preço e estoque */}
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Preço e Estoque
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={labelStyle}>Preço (R$) *</label>
              <input
                style={inputStyle}
                name="preco"
                type="number"
                step="0.01"
                min="0"
                value={form.preco}
                onChange={handleChange}
                placeholder="0,00"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Estoque *</label>
              <input
                style={inputStyle}
                name="estoque"
                type="number"
                min="0"
                value={form.estoque}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#ef4444',
              fontSize: '13px',
              marginBottom: '20px',
            }}>
              {erro}
            </div>
          )}

          {/* Botões */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/produtos')}
              style={{
                flex: 1,
                padding: '11px',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text-secondary)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              style={{
                flex: 1,
                padding: '11px',
                background: 'var(--color-accent)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: carregando ? 'not-allowed' : 'pointer',
                opacity: carregando ? 0.7 : 1,
              }}
            >
              {carregando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}