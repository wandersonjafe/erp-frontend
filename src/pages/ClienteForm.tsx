import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

export default function ClienteForm() {
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      await api.post('/clientes', form)
      navigate('/clientes')
    } catch (error) {
      const mensagem = (error as { mensagemAmigavel?: string }).mensagemAmigavel
        ?? 'Erro ao cadastrar cliente. Verifique os dados.'
      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Novo Cliente</h2>
        <p className="text-gray-400 mt-1">Preencha os dados do cliente</p>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nome</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm"
                placeholder="Nome completo"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm"
                placeholder="email@exemplo.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">CPF</label>
            <input
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm"
              placeholder="000.000.000-00"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Logradouro</label>
              <input
                name="logradouro"
                value={form.logradouro}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm"
                placeholder="Rua, Avenida..."
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Número</label>
              <input
                name="numero"
                value={form.numero}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm"
                placeholder="123"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">CEP</label>
              <input
                name="cep"
                value={form.cep}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm"
                placeholder="00000-000"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cidade</label>
              <input
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm"
                placeholder="Cidade"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Estado</label>
              <input
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm"
                placeholder="SP"
                maxLength={2}
                required
              />
            </div>
          </div>

          {erro && <p className="text-red-400 text-sm">{erro}</p>}

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate('/clientes')}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {carregando ? 'Salvando...' : 'Salvar Cliente'}
            </button>
          </div>

        </form>
      </div>
    </Layout>
  )
}