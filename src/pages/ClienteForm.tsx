import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

export default function ClienteForm() {
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [form, setForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    logradouro: '',
    numero: '',
    cep: '',
    cidade: '',
    estado: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErro(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro(null)
    try {
      await api.post('/clientes', form)
      navigate('/clientes')
    } catch (error) {
      const mensagem =
        (error as { mensagemAmigavel?: string }).mensagemAmigavel ??
        'Erro ao cadastrar cliente. Verifique os dados.'
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
    transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: '6px',
  }

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  }

  return (
    <Layout>
      <div style={{ maxWidth: '640px' }}>
        {/* Cabeçalho */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/clientes')}
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
            ← Voltar para Clientes
          </button>
          <h2 style={{ color: 'var(--color-text-primary)', fontSize: '22px', fontWeight: 700, margin: 0 }}>
            Novo Cliente
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Preencha os dados para cadastrar um novo cliente
          </p>
        </div>

        {/* Card do formulário */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '28px',
          }}
        >
          {/* Seção: Dados pessoais */}
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Dados Pessoais
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Nome completo *</label>
              <input
                style={inputStyle}
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: Maria da Silva"
                required
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>E-mail *</label>
              <input
                style={inputStyle}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>CPF *</label>
              <input
                style={inputStyle}
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                required
              />
            </div>
          </div>

          {/* Divisor */}
          <div style={{ height: '1px', background: 'var(--color-border)', margin: '20px 0' }} />

          {/* Seção: Endereço */}
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Endereço
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Logradouro</label>
              <input
                style={inputStyle}
                name="logradouro"
                value={form.logradouro}
                onChange={handleChange}
                placeholder="Rua, Avenida, etc."
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Número</label>
              <input
                style={inputStyle}
                name="numero"
                value={form.numero}
                onChange={handleChange}
                placeholder="123"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>CEP</label>
              <input
                style={inputStyle}
                name="cep"
                value={form.cep}
                onChange={handleChange}
                placeholder="00000-000"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Cidade</label>
              <input
                style={inputStyle}
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
                placeholder="São Paulo"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Estado</label>
              <input
                style={inputStyle}
                name="estado"
                value={form.estado}
                onChange={handleChange}
                placeholder="SP"
                maxLength={2}
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
              onClick={() => navigate('/clientes')}
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
              {carregando ? 'Salvando...' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}