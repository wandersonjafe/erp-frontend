import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import type { Cliente, Produto, Venda } from '../types'

// ── Tipos de filtro ────────────────────────────────────────────────────────────
type FiltroStatus = 'TODAS' | 'ABERTA' | 'FECHADA' | 'CANCELADA'

const filtros: { label: string; valor: FiltroStatus }[] = [
  { label: 'Todas',      valor: 'TODAS'     },
  { label: 'Abertas',    valor: 'ABERTA'    },
  { label: 'Fechadas',   valor: 'FECHADA'   },
  { label: 'Canceladas', valor: 'CANCELADA' },
]

export default function Vendas() {
  const [aba, setAba]               = useState<'nova' | 'historico'>('nova')
  const [clientes, setClientes]     = useState<Cliente[]>([])
  const [produtos, setProdutos]     = useState<Produto[]>([])
  const [vendas, setVendas]         = useState<Venda[]>([])
  const [clienteId, setClienteId]   = useState('')
  const [vendaId, setVendaId]       = useState('')
  const [produtoId, setProdutoId]   = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [etapa, setEtapa]           = useState<'abrir' | 'itens' | 'finalizada'>('abrir')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro]             = useState('')
  const [mensagem, setMensagem]     = useState('')

  // ── Filtro do histórico ──────────────────────────────────────────────────────
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroStatus>('TODAS')

  const vendasFiltradas = filtroAtivo === 'TODAS'
    ? vendas
    : vendas.filter(v => v.status === filtroAtivo)

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resClientes, resProdutos, resVendas] = await Promise.all([
          api.get('/clientes'),
          api.get('/produtos'),
          api.get('/vendas'),
        ])
        setClientes(resClientes.data)
        setProdutos(resProdutos.data)
        setVendas(resVendas.data)
      } catch (error) {
        const mensagemErro = (error as { mensagemAmigavel?: string }).mensagemAmigavel
          ?? 'Erro ao carregar dados.'
        console.error(mensagemErro)
      }
    }
    carregarDados()
  }, [])

  async function abrirVenda() {
    if (!clienteId) { setErro('Selecione um cliente'); return }
    setErro('')
    setCarregando(true)
    try {
      const res = await api.post(`/vendas/abrir/${clienteId}`)
      setVendaId(res.data)
      setEtapa('itens')
      setMensagem('Venda aberta com sucesso!')
    } catch (error) {
      const mensagemErro = (error as { mensagemAmigavel?: string }).mensagemAmigavel
        ?? 'Erro ao abrir venda.'
      setErro(mensagemErro)
    } finally {
      setCarregando(false)
    }
  }

  async function adicionarItem() {
    if (!produtoId) { setErro('Selecione um produto'); return }
    setErro('')
    setCarregando(true)
    try {
      await api.post(`/vendas/${vendaId}/itens`, { produtoId, quantidade })
      setMensagem('Item adicionado com sucesso!')
      setProdutoId('')
      setQuantidade(1)
    } catch (error) {
      const mensagemErro = (error as { mensagemAmigavel?: string }).mensagemAmigavel
        ?? 'Erro ao adicionar item. Verifique o estoque.'
      setErro(mensagemErro)
    } finally {
      setCarregando(false)
    }
  }

  async function fecharVenda() {
    setErro('')
    setCarregando(true)
    try {
      await api.post(`/vendas/${vendaId}/fechar`)
      setEtapa('finalizada')
      const resVendas = await api.get('/vendas')
      setVendas(resVendas.data)
    } catch (error) {
      const mensagemErro = (error as { mensagemAmigavel?: string }).mensagemAmigavel
        ?? 'Erro ao fechar venda. Adicione pelo menos um item.'
      setErro(mensagemErro)
    } finally {
      setCarregando(false)
    }
  }

  function novaVenda() {
    setEtapa('abrir')
    setClienteId('')
    setVendaId('')
    setMensagem('')
    setErro('')
  }

  function cancelarVenda() {
    setEtapa('abrir')
    setClienteId('')
    setVendaId('')
    setProdutoId('')
    setQuantidade(1)
    setMensagem('')
    setErro('')
  }

  async function cancelarVendaAberta() {
    if (!vendaId) { cancelarVenda(); return }
    setCarregando(true)
    try {
      await api.post(`/vendas/${vendaId}/cancelar`)
      const resVendas = await api.get('/vendas')
      setVendas(resVendas.data)
      cancelarVenda()
    } catch (error) {
      const mensagemErro = (error as { mensagemAmigavel?: string }).mensagemAmigavel
        ?? 'Erro ao cancelar venda.'
      setErro(mensagemErro)
    } finally {
      setCarregando(false)
    }
  }

  function nomeCliente(id: string) {
    return clientes.find(c => c.id === id)?.nome ?? id
  }

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Vendas</h2>
        <p className="text-gray-400 mt-1">Gerencie suas vendas</p>
      </div>

      {/* Abas */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setAba('nova')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            aba === 'nova' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Nova Venda
        </button>
        <button
          onClick={() => setAba('historico')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            aba === 'historico' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Histórico
        </button>
      </div>

      {/* ── Aba Nova Venda ── */}
      {aba === 'nova' && (
        <div className="max-w-2xl">
          {/* Stepper */}
          <div className="flex items-center mb-8 gap-2">
            {['abrir', 'itens', 'finalizada'].map((e, i) => (
              <div key={e} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  etapa === e ? 'bg-blue-600 text-white' :
                  ['abrir', 'itens', 'finalizada'].indexOf(etapa) > i ? 'bg-green-600 text-white' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {i + 1}
                </div>
                <span className="text-gray-400 text-sm">
                  {e === 'abrir' ? 'Abrir' : e === 'itens' ? 'Itens' : 'Finalizar'}
                </span>
                {i < 2 && <div className="w-8 h-px bg-gray-700" />}
              </div>
            ))}
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 space-y-4">

            {etapa === 'abrir' && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cliente</label>
                  <select
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm"
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => { setClienteId(''); setErro('') }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg text-sm font-medium transition"
                  >
                    Limpar
                  </button>
                  <button
                    onClick={abrirVenda}
                    disabled={carregando}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    {carregando ? 'Abrindo...' : 'Abrir Venda'}
                  </button>
                </div>
              </>
            )}

            {etapa === 'itens' && (
              <>
                <div className="bg-gray-800 rounded-lg px-4 py-3">
                  <p className="text-gray-400 text-xs">Venda aberta</p>
                  <p className="text-green-400 text-sm font-mono mt-1">{vendaId}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Produto</label>
                  <select
                    value={produtoId}
                    onChange={(e) => setProdutoId(e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm"
                  >
                    <option value="">Selecione um produto</option>
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} — R$ {p.preco.toFixed(2)} — {p.estoque} em estoque
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Quantidade</label>
                  <input
                    type="number"
                    min={1}
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseInt(e.target.value))}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm"
                  />
                </div>
                <button
                  onClick={cancelarVendaAberta}
                  disabled={carregando}
                  className="w-full bg-red-800 hover:bg-red-700 text-white py-3 rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {carregando ? 'Cancelando...' : 'Cancelar Venda'}
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={adicionarItem}
                    disabled={carregando}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    {carregando ? 'Adicionando...' : '+ Adicionar Item'}
                  </button>
                  <button
                    onClick={fecharVenda}
                    disabled={carregando}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    Fechar Venda
                  </button>
                </div>
              </>
            )}

            {etapa === 'finalizada' && (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-white mb-2">Venda Finalizada!</h3>
                <p className="text-gray-400 text-sm mb-6">A venda foi registrada com sucesso.</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={novaVenda}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-sm font-medium transition"
                  >
                    Nova Venda
                  </button>
                  <button
                    onClick={() => setAba('historico')}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg text-sm font-medium transition"
                  >
                    Ver Histórico
                  </button>
                </div>
              </div>
            )}

            {erro     && <p className="text-red-400 text-sm">{erro}</p>}
            {mensagem && etapa === 'itens' && (
              <p className="text-green-400 text-sm">{mensagem}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Aba Histórico ── */}
      {aba === 'historico' && (
        <div>
          {/* Botões de filtro */}
          <div className="flex gap-2 mb-4">
            {filtros.map(({ label, valor }) => (
              <button
                key={valor}
                onClick={() => setFiltroAtivo(valor)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                  filtroAtivo === valor
                    ? valor === 'TODAS'      ? 'bg-blue-600 text-white'
                    : valor === 'FECHADA'    ? 'bg-green-600 text-white'
                    : valor === 'ABERTA'     ? 'bg-yellow-600 text-white'
                    :                          'bg-red-700 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {label}
                <span className="ml-1.5 opacity-70">
                  ({valor === 'TODAS'
                    ? vendas.length
                    : vendas.filter(v => v.status === valor).length})
                </span>
              </button>
            ))}
          </div>

          {/* Tabela */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 text-sm px-6 py-4">ID da Venda</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-4">Cliente</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-4">Status</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {vendasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-8">
                      Nenhuma venda {filtroAtivo !== 'TODAS' ? `com status ${filtroAtivo.toLowerCase()}` : 'registrada'}
                    </td>
                  </tr>
                ) : (
                  vendasFiltradas.map((venda) => (
                    <tr key={venda.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                      <td className="px-6 py-4 text-gray-400 text-xs font-mono">{venda.id}</td>
                      <td className="px-6 py-4 text-white text-sm">{nomeCliente(venda.clienteId)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          venda.status === 'FECHADA'   ? 'bg-green-500/20 text-green-400'  :
                          venda.status === 'CANCELADA' ? 'bg-red-500/20 text-red-400'      :
                                                         'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {venda.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white text-sm">
                        R$ {venda.total.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  )
}