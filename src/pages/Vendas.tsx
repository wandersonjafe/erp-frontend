import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { ChevronDown, ChevronRight, ShoppingCart, X } from 'lucide-react'
import type { Cliente, Produto, Venda, ItemVenda } from '../types'

type FiltroStatus = 'TODAS' | 'ABERTA' | 'FECHADA' | 'CANCELADA'

const filtros: { label: string; valor: FiltroStatus }[] = [
  { label: 'Todas',      valor: 'TODAS'     },
  { label: 'Abertas',    valor: 'ABERTA'    },
  { label: 'Fechadas',   valor: 'FECHADA'   },
  { label: 'Canceladas', valor: 'CANCELADA' },
]

const badgeStyle = (status: Venda['status']) => {
  if (status === 'FECHADA')   return { background: 'rgba(58,158,110,0.15)', color: '#3a9e6e' }
  if (status === 'CANCELADA') return { background: 'rgba(224,82,82,0.15)',  color: '#e05252' }
  return                             { background: 'rgba(200,150,50,0.15)', color: '#b8892a' }
}

const filtroAtivoBg = (valor: FiltroStatus) => {
  if (valor === 'TODAS')      return { background: 'var(--color-accent)', color: '#fff' }
  if (valor === 'FECHADA')    return { background: '#3a9e6e',             color: '#fff' }
  if (valor === 'ABERTA')     return { background: '#b8892a',             color: '#fff' }
  return                             { background: '#e05252',             color: '#fff' }
}

function abreviarUUID(uuid: string) {
  return uuid.length > 8 ? `${uuid.substring(0, 8)}...` : uuid
}

function dataRelevante(venda: Venda): string {
  const data =
    venda.status === 'FECHADA'   ? venda.dataFechamento :
    venda.status === 'CANCELADA' ? venda.dataCancelamento :
                                   venda.dataCriacao
  if (!data) return '—'
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Vendas() {
  const [aba, setAba]               = useState<'nova' | 'historico'>('nova')
  const [clientes, setClientes]     = useState<Cliente[]>([])
  const [produtos, setProdutos]     = useState<Produto[]>([])
  const [vendas, setVendas]         = useState<Venda[]>([])

  // Estado do carrinho
  const [clienteId, setClienteId]   = useState('')
  const [vendaId, setVendaId]       = useState('')
  const [itensCarrinho, setItensCarrinho] = useState<ItemVenda[]>([])
  const [produtoId, setProdutoId]   = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [vendaAberta, setVendaAberta] = useState(false)
  const [vendaFinalizada, setVendaFinalizada] = useState(false)

  const [carregando, setCarregando] = useState(false)
  const [erro, setErro]             = useState('')
  const [mensagem, setMensagem]     = useState('')

  // Estado do histórico
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroStatus>('TODAS')
  const [busca, setBusca]           = useState('')
  const [vendaExpandida, setVendaExpandida] = useState<string | null>(null)

  function nomeCliente(id: string) {
    return clientes.find(c => c.id === id)?.nome ?? id
  }

  const totalCarrinho = itensCarrinho.reduce(
    (acc, item) => acc + item.quantidade * item.precoUnitario.valor, 0
  )

  const vendasFiltradas = vendas.filter(venda => {
    const atendeStatus = filtroAtivo === 'TODAS' || venda.status === filtroAtivo
    const atendeBusca  =
      nomeCliente(venda.clienteId).toLowerCase().includes(busca.toLowerCase()) ||
      venda.id.toLowerCase().includes(busca.toLowerCase())
    return atendeStatus && atendeBusca
  })

  function toggleExpansao(e: React.MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    setVendaExpandida(prev => prev === id ? null : id)
  }

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
        console.error((error as { mensagemAmigavel?: string }).mensagemAmigavel ?? error)
      }
    }
    carregarDados()
  }, [])

  async function abrirVenda() {
    if (!clienteId) { setErro('Selecione um cliente'); return }
    setErro(''); setCarregando(true)
    try {
      const res = await api.post(`/vendas/abrir/${clienteId}`)
      setVendaId(res.data)
      setItensCarrinho([])
      setVendaAberta(true)
      setMensagem('')
    } catch (error) {
      setErro((error as { mensagemAmigavel?: string }).mensagemAmigavel ?? 'Erro ao abrir venda.')
    } finally { setCarregando(false) }
  }

  async function continuarVenda(venda: Venda) {
    setClienteId(venda.clienteId)
    setVendaId(venda.id)
    setItensCarrinho(venda.itens ?? [])
    setVendaAberta(true)
    setVendaFinalizada(false)
    setErro('')
    setMensagem('')
    setAba('nova')
  }

  async function adicionarItem() {
    if (!produtoId) { setErro('Selecione um produto'); return }
    setErro(''); setCarregando(true)
    try {
      await api.post(`/vendas/${vendaId}/itens`, { produtoId, quantidade })
      // Recarrega a venda para pegar itens atualizados
      const res = await api.get(`/vendas/${vendaId}`)
      setItensCarrinho(res.data.itens ?? [])
      setProdutoId('')
      setQuantidade(1)
      setMensagem('Item adicionado!')
      setTimeout(() => setMensagem(''), 2000)
    } catch (error) {
      setErro((error as { mensagemAmigavel?: string }).mensagemAmigavel ?? 'Erro ao adicionar item.')
    } finally { setCarregando(false) }
  }

  async function fecharVenda() {
    if (itensCarrinho.length === 0) { setErro('Adicione pelo menos um item antes de fechar.'); return }
    setErro(''); setCarregando(true)
    try {
      await api.post(`/vendas/${vendaId}/fechar`)
      setVendaFinalizada(true)
      setVendaAberta(false)
      setVendas((await api.get('/vendas')).data)
    } catch (error) {
      setErro((error as { mensagemAmigavel?: string }).mensagemAmigavel ?? 'Erro ao fechar venda.')
    } finally { setCarregando(false) }
  }

  async function cancelarVenda() {
    if (!vendaId) { resetarEstado(); return }
    setCarregando(true)
    try {
      await api.post(`/vendas/${vendaId}/cancelar`)
      setVendas((await api.get('/vendas')).data)
      resetarEstado()
    } catch (error) {
      setErro((error as { mensagemAmigavel?: string }).mensagemAmigavel ?? 'Erro ao cancelar venda.')
    } finally { setCarregando(false) }
  }

  function resetarEstado() {
    setClienteId(''); setVendaId(''); setItensCarrinho([])
    setProdutoId(''); setQuantidade(1); setVendaAberta(false)
    setVendaFinalizada(false); setErro(''); setMensagem('')
  }

  function novaVenda() {
    resetarEstado()
  }

  // ── Estilos ──────────────────────────────────────────────────────────────
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

  const btnPrimary: React.CSSProperties = {
    background: 'var(--color-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  }

  return (
    <Layout>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: 'var(--color-text-primary)', fontSize: '24px', fontWeight: 'bold' }}>Vendas</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px', fontSize: '14px' }}>Gerencie suas vendas</p>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['nova', 'historico'] as const).map(a => (
          <button key={a} onClick={() => setAba(a)} style={{
            padding: '8px 18px', borderRadius: '8px', fontSize: '14px',
            fontWeight: 500, cursor: 'pointer', border: '1px solid var(--color-border)',
            ...(aba === a
              ? { background: 'var(--color-accent)', color: '#fff', borderColor: 'var(--color-accent)' }
              : { background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }),
          }}>
            {a === 'nova' ? 'Nova Venda' : 'Histórico'}
          </button>
        ))}
      </div>

      {/* ── Aba Nova Venda ── */}
      {aba === 'nova' && (
        <div style={{ maxWidth: '640px' }}>

          {/* ── Venda finalizada ── */}
          {vendaFinalizada && (
            <div style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '48px 28px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'rgba(58,158,110,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <ShoppingCart size={28} color="#3a9e6e" />
              </div>
              <h3 style={{ color: 'var(--color-text-primary)', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                Venda Finalizada!
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '28px' }}>
                A venda foi registrada com sucesso.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={novaVenda} style={{ ...btnPrimary }}>
                  Nova Venda
                </button>
                <button onClick={() => { setAba('historico'); resetarEstado() }} style={{
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px', padding: '12px 20px',
                  fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                }}>
                  Ver Histórico
                </button>
              </div>
            </div>
          )}

          {/* ── Seleção de cliente (antes de abrir) ── */}
          {!vendaAberta && !vendaFinalizada && (
            <div style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px', padding: '28px',
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              <div>
                <label style={labelStyle}>Cliente</label>
                <select value={clienteId} onChange={e => { setClienteId(e.target.value); setErro('') }} style={inputStyle}>
                  <option value="">Selecione um cliente</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              {erro && <p style={{ color: '#e05252', fontSize: '13px' }}>{erro}</p>}
              <button
                onClick={abrirVenda}
                disabled={carregando}
                style={{ ...btnPrimary, width: '100%', opacity: carregando ? 0.6 : 1 }}
              >
                {carregando ? 'Abrindo...' : 'Abrir Venda'}
              </button>
            </div>
          )}

          {/* ── Carrinho ── */}
          {vendaAberta && !vendaFinalizada && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Info da venda */}
              <div style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px', padding: '16px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Cliente</p>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {nomeCliente(clienteId)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>ID da Venda</p>
                  <p style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                    {abreviarUUID(vendaId)}
                  </p>
                </div>
              </div>

              {/* Adicionar produto */}
              <div style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px', padding: '20px',
                display: 'flex', flexDirection: 'column', gap: '12px',
              }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>
                  Adicionar produto
                </p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Produto</label>
                    <select value={produtoId} onChange={e => setProdutoId(e.target.value)} style={inputStyle}>
                      <option value="">Selecione...</option>
                      {produtos.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nome} — {formatarMoeda(p.preco)} — {p.estoque} em estoque
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ width: '90px' }}>
                    <label style={labelStyle}>Qtd</label>
                    <input
                      type="number" min={1} value={quantidade}
                      onChange={e => setQuantidade(parseInt(e.target.value))}
                      style={inputStyle}
                    />
                  </div>
                  <button
                    onClick={adicionarItem}
                    disabled={carregando}
                    style={{ ...btnPrimary, whiteSpace: 'nowrap', opacity: carregando ? 0.6 : 1 }}
                  >
                    + Adicionar
                  </button>
                </div>
                {mensagem && <p style={{ color: '#3a9e6e', fontSize: '13px', margin: 0 }}>{mensagem}</p>}
                {erro     && <p style={{ color: '#e05252', fontSize: '13px', margin: 0 }}>{erro}</p>}
              </div>

              {/* Itens do carrinho */}
              <div style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px', overflow: 'hidden',
              }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>
                    Itens da venda
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                    {itensCarrinho.length} {itensCarrinho.length === 1 ? 'item' : 'itens'}
                  </p>
                </div>

                {itensCarrinho.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center' }}>
                    <ShoppingCart size={32} color="var(--color-text-muted)" style={{ margin: '0 auto 8px' }} />
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                      Nenhum item adicionado ainda
                    </p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                        {['Produto', 'Qtd', 'Preço unit.', 'Subtotal'].map(col => (
                          <th key={col} style={{
                            textAlign: col === 'Produto' ? 'left' : 'right',
                            color: 'var(--color-text-muted)', fontWeight: 500,
                            padding: '10px 20px', fontSize: '12px',
                          }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {itensCarrinho.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '12px 20px', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                            {item.nomeProduto}
                          </td>
                          <td style={{ padding: '12px 20px', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                            {item.quantidade}
                          </td>
                          <td style={{ padding: '12px 20px', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                            {formatarMoeda(item.precoUnitario.valor)}
                          </td>
                          <td style={{ padding: '12px 20px', color: 'var(--color-text-primary)', fontWeight: 500, textAlign: 'right' }}>
                            {formatarMoeda(item.quantidade * item.precoUnitario.valor)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '2px solid var(--color-border)' }}>
                        <td colSpan={3} style={{ padding: '14px 20px', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 600 }}>
                          Total
                        </td>
                        <td style={{ padding: '14px 20px', color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: 700, textAlign: 'right' }}>
                          {formatarMoeda(totalCarrinho)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>

              {/* Botões de ação */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={cancelarVenda}
                  disabled={carregando}
                  style={{
                    flex: 1, background: 'rgba(224,82,82,0.1)', color: '#e05252',
                    border: '1px solid rgba(224,82,82,0.3)', borderRadius: '8px',
                    padding: '14px', fontSize: '14px', fontWeight: 600,
                    cursor: 'pointer', opacity: carregando ? 0.6 : 1,
                  }}
                >
                  Cancelar Venda
                </button>
                <button
                  onClick={fecharVenda}
                  disabled={carregando || itensCarrinho.length === 0}
                  style={{
                    flex: 2, background: '#3a9e6e', color: '#fff',
                    border: 'none', borderRadius: '8px',
                    padding: '14px', fontSize: '14px', fontWeight: 600,
                    cursor: carregando || itensCarrinho.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: carregando || itensCarrinho.length === 0 ? 0.6 : 1,
                  }}
                >
                  {carregando ? 'Fechando...' : 'Fechar Venda'}
                </button>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ── Aba Histórico ── */}
      {aba === 'historico' && (
        <div>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {filtros.map(({ label, valor }) => {
              const ativo = filtroAtivo === valor
              return (
                <button key={valor} onClick={() => setFiltroAtivo(valor)} style={{
                  padding: '6px 14px', borderRadius: '999px', fontSize: '12px',
                  fontWeight: 500, cursor: 'pointer', border: '1px solid var(--color-border)',
                  transition: 'all 0.15s',
                  ...(ativo
                    ? filtroAtivoBg(valor)
                    : { background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }),
                }}>
                  {label}
                  <span style={{ marginLeft: '6px', opacity: 0.7 }}>
                    ({valor === 'TODAS' ? vendas.length : vendas.filter(v => v.status === valor).length})
                  </span>
                </button>
              )
            })}
          </div>

          {/* Busca */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Buscar por cliente ou ID da venda..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              style={{
                width: '100%', maxWidth: '400px',
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px', padding: '10px 14px',
                fontSize: '14px', outline: 'none',
              }}
            />
          </div>

          {/* Tabela */}
          <div style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px', overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ width: '40px', padding: '14px 0 14px 16px' }} />
                  {[['ID da Venda', '140px'], ['Cliente', ''], ['Status', '110px'], ['Total', '110px'], ['Data', '160px'], ['Ações', '120px']].map(([col, w]) => (
                    <th key={col} style={{
                      textAlign: 'left', color: 'var(--color-text-muted)',
                      fontSize: '13px', fontWeight: 500,
                      padding: '14px 16px 14px 0',
                      width: w || undefined,
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '32px', fontSize: '14px' }}>
                      Nenhuma venda {filtroAtivo !== 'TODAS' ? `com status ${filtroAtivo.toLowerCase()}` : 'registrada'}
                    </td>
                  </tr>
                ) : (
                  vendasFiltradas.map(venda => {
                    const expandida = vendaExpandida === venda.id
                    const itens = venda.itens ?? []
                    return (
                      <>
                        <tr
                          key={venda.id}
                          onClick={e => toggleExpansao(e, venda.id)}
                          style={{
                            borderBottom: expandida ? 'none' : '1px solid var(--color-border)',
                            cursor: 'pointer',
                            background: expandida ? 'var(--color-bg-hover)' : 'transparent',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                          onMouseLeave={e => (e.currentTarget.style.background = expandida ? 'var(--color-bg-hover)' : 'transparent')}
                        >
                          <td style={{ padding: '14px 0 14px 16px', color: 'var(--color-text-muted)', width: '40px' }}>
                            {expandida ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </td>
                          <td style={{ padding: '14px 0', color: 'var(--color-text-muted)', fontSize: '12px', fontFamily: 'monospace' }}>
                            {abreviarUUID(venda.id)}
                          </td>
                          <td style={{ padding: '14px 16px 14px 0', color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 500 }}>
                            {nomeCliente(venda.clienteId)}
                          </td>
                          <td style={{ padding: '14px 16px 14px 0' }}>
                            <span style={{ fontSize: '12px', fontWeight: 500, padding: '3px 10px', borderRadius: '999px', ...badgeStyle(venda.status) }}>
                              {venda.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px 14px 0', color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 500 }}>
                            {formatarMoeda(Number(venda.total))}
                          </td>
                          <td style={{ padding: '14px 16px 14px 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                            {dataRelevante(venda)}
                          </td>
                          {/* Botões de ação para vendas abertas */}
                          <td style={{ padding: '14px 16px 14px 0' }} onClick={e => e.stopPropagation()}>
                            {venda.status === 'ABERTA' && (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  onClick={() => continuarVenda(venda)}
                                  style={{
                                    background: 'var(--color-accent)', color: '#fff',
                                    border: 'none', borderRadius: '6px',
                                    padding: '5px 10px', fontSize: '12px',
                                    fontWeight: 500, cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  Continuar
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      await api.post(`/vendas/${venda.id}/cancelar`)
                                      setVendas((await api.get('/vendas')).data)
                                    } catch (error) {
                                      console.error(error)
                                    }
                                  }}
                                  style={{
                                    background: 'rgba(224,82,82,0.1)', color: '#e05252',
                                    border: '1px solid rgba(224,82,82,0.3)', borderRadius: '6px',
                                    padding: '5px 8px', fontSize: '12px',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                  }}
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>

                        {/* Linha expandida */}
                        {expandida && (
                          <tr key={`${venda.id}-itens`} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td colSpan={7} style={{ padding: '0 24px 16px 56px', background: 'var(--color-bg-hover)' }}>
                              {itens.length === 0 ? (
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', padding: '8px 0' }}>
                                  Nenhum item registrado nesta venda.
                                </p>
                              ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                  <thead>
                                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                      {['Produto', 'Qtd', 'Preço unit.', 'Subtotal'].map(col => (
                                        <th key={col} style={{
                                          textAlign: col === 'Produto' ? 'left' : 'right',
                                          color: 'var(--color-text-muted)', fontWeight: 500,
                                          padding: '8px 12px 8px 0', fontSize: '12px',
                                        }}>{col}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {itens.map((item, idx) => (
                                      <tr key={idx}>
                                        <td style={{ padding: '8px 12px 8px 0', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                                          {item.nomeProduto}
                                        </td>
                                        <td style={{ padding: '8px 12px 8px 0', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                                          {item.quantidade}
                                        </td>
                                        <td style={{ padding: '8px 12px 8px 0', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                                          {formatarMoeda(item.precoUnitario.valor)}
                                        </td>
                                        <td style={{ padding: '8px 0', color: 'var(--color-text-primary)', fontWeight: 500, textAlign: 'right' }}>
                                          {formatarMoeda(item.quantidade * item.precoUnitario.valor)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '10px' }}>
            Clique em uma linha para ver os itens da venda
          </p>
        </div>
      )}
    </Layout>
  )
}