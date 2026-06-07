import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

const categorias = ['ELETRONICO', 'ALIMENTO', 'VESTUARIO', 'MOVEL', 'OUTROS']

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-bg-secondary)',
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
  color: 'var(--color-text-secondary)',
  marginBottom: '6px',
  fontWeight: 500,
}

export default function ProdutoEditar() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: '',
    categoria: 'ELETRONICO',
  })

  useEffect(() => {
    async function carregarProduto() {
      try {
        const res = await api.get(`/produtos/${id}`)
        const p = res.data
        setForm({
          nome: p.nome,
          descricao: p.descricao,
          preco: p.preco.toString(),
          estoque: p.estoque.toString(),
          categoria: p.categoria,
        })
      } catch (error) {
        const mensagem = (error as { mensagemAmigavel?: string }).mensagemAmigavel
          ?? 'Erro ao carregar produto.'
        setErro(mensagem)
      }
    }
    carregarProduto()
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await api.put(`/produtos/${id}`, {
        ...form,
        preco: parseFloat(form.preco),
        estoque: parseInt(form.estoque),
      })
      navigate('/produtos')
    } catch (error) {
      const mensagem = (error as { mensagemAmigavel?: string }).mensagemAmigavel
        ?? 'Erro ao atualizar produto. Verifique os dados.'
      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Layout>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ color: 'var(--color-text-primary)', fontSize: '24px', fontWeight: 'bold' }}>Editar Produto</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px', fontSize: '14px' }}>Atualize os dados do produto</p>
      </div>

      <div style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '28px',
        maxWidth: '640px',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={labelStyle}>Nome</label>
            <input name="nome" value={form.nome} onChange={handleChange}
              style={inputStyle} placeholder="Nome do produto" required />
          </div>

          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea name="descricao" value={form.descricao} onChange={handleChange}
              style={{ ...inputStyle, resize: 'none' }} placeholder="Descrição do produto" rows={3} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Preço</label>
              <input name="preco" type="number" step="0.01" value={form.preco} onChange={handleChange}
                style={inputStyle} placeholder="0.00" required />
            </div>
            <div>
              <label style={labelStyle}>Estoque</label>
              <input name="estoque" type="number" value={form.estoque} onChange={handleChange}
                style={inputStyle} placeholder="0" required />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Categoria</label>
            <select name="categoria" value={form.categoria} onChange={handleChange} style={inputStyle}>
              {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {erro && (
            <p style={{ color: '#e05252', fontSize: '13px', marginTop: '-4px' }}>{erro}</p>
          )}

          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button type="button" onClick={() => navigate('/produtos')} style={{
              flex: 1,
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={carregando} style={{
              flex: 1,
              background: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              opacity: carregando ? 0.6 : 1,
            }}>
              {carregando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

        </form>
      </div>
    </Layout>
  )
}