import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

const categorias = ['ELETRONICO', 'ALIMENTO', 'VESTUARIO', 'MOVEL', 'OUTROS']

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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Editar Produto</h2>
        <p className="text-gray-400 mt-1">Atualize os dados do produto</p>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm"
              placeholder="Nome do produto"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Descrição</label>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm resize-none"
              placeholder="Descrição do produto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Preço</label>
              <input
                name="preco"
                type="number"
                step="0.01"
                value={form.preco}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Estoque</label>
              <input
                name="estoque"
                type="number"
                value={form.estoque}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Categoria</label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm"
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {erro && <p className="text-red-400 text-sm">{erro}</p>}

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate('/produtos')}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {carregando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

        </form>
      </div>
    </Layout>
  )
}