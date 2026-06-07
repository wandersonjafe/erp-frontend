import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Cliente, Produto, Venda } from '../types'

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
  const [clienteId, setClienteId]   = useState('')
  const [vendaId, setVendaId]       = useState('')
  const [produtoId, setProdutoId]   = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [etapa, setEtapa]           = useState<'abrir' | 'itens' | 'finalizada'>('abrir')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro]             = useState('')
  const [mensagem, setMensagem]     = useState('')
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroStatus>('TODAS')
  const [busca, setBusca]           = useState('')
  const [vendaExpandida, setVendaExpandida] = useState<string | null>(null)

  function nomeCliente(id: string) {
    return clientes.find(c => c.id === id)?.nome ?? id
  }

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
      setVendaId(res.data); setEtapa('itens'); setMensagem('Venda aberta com sucesso!')
    } catch (error) {
      setErro((error as { mensagemAmigavel?: string }).mensagemAmigavel ?? 'Erro ao abrir venda.')
    } finally { setCarregando(false) }
  }

  async function adicionarItem() {
    if (!produtoId) { setErro('Selecione um produto'); return }
    setErro(''); setCarregando(true)
    try {
      await api.post(`/vendas/${vendaId}/itens`, { produtoId, quantidade })
      setMensagem('Item adicionado com sucesso!'); setProdutoId(''); setQuantidade(1)
    } catch (error) {
      setErro((error as { mensagemAmigavel?: string }).mensagemAmigavel ?? 'Erro ao adicionar item.')
    } finally { setCarregando(false) }
  }

  async function fecharVenda() {
    setErro(''); setCarregando(true)
    try {
      await api.post(`/vendas/${vendaId}/fechar`)
      setEtapa('finalizada')
      setVendas((await api.get('/vendas')).data)
    } catch (error) {
      setErro((error as { mensagemAmigavel?: string }).mensagemAmigavel ?? 'Erro ao fechar venda.')
    } finally { setCarregando(false) }
  }

  function novaVenda() {
    setEtapa('abrir'); setClienteId(''); setVendaId(''); setMensagem(''); setErro('')
  }

  function cancelarVenda() {
    setEtapa('abrir'); setClienteId(''); setVendaId(''); setProdutoId('')
    setQuantidade(1); setMensagem(''); setErro('')
  }

  async function cancelarVendaAberta() {
    if (!vendaId) { cancelarVenda(); return }
    setCarregando(true)
    try {
      await api.post(`/vendas/${vendaId}/cancelar`)
      setVendas((await api.get('/vendas')).data)
      cancelarVenda()
    } catch (error) {
      setErro((error as { mensagemAmigavel?: string }).mensagemAmigavel ?? 'Erro ao cancelar venda.')
    } finally { setCarregando(false) }
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '28px',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    marginBottom: '6px',
    fontWeight: 500,
  }

  const btnPrimary: React.CSSProperties = {
    flex: 1,
    background: 'var(--color-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  }

  const btnSecondary: React.CSSProperties = {
    flex: 1,
    background: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '12px',
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
        <div style={{ maxWidth: '560px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
            {(['abrir', 'itens', 'finalizada'] as const).map((e, i) => {
              const etapas = ['abrir', 'itens', 'finalizada']
              const ativo  = etapa === e
              const passado = etapas.indexOf(etapa) > i
              return (
                <div key={e} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 'bold',
                    background: ativo ? 'var(--color-accent)' : passado ? '#3a9e6e' : 'var(--color-bg-secondary)',
                    color: ativo || passado ? '#fff' : 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                  }}>{i + 1}</div>
                  <span style={{ fontSize: '13px', color: ativo ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                    {e === 'abrir' ? 'Abrir' : e === 'itens' ? 'Itens' : 'Finalizar'}
                  </span>
                  {i < 2 && <div style={{ width: '32px', height: '1px', background: 'var(--color-border)' }} />}
                </div>
              )
            })}
          </div>

          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {etapa === 'abrir' && (
              <>
                <div>
                  <label style={labelStyle}>Cliente</label>
                  <select value={clienteId} onChange={e => setClienteId(e.target.value)} style={inputStyle}>
                    <option value="">Selecione um cliente</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => { setClienteId(''); setErro('') }} style={btnSecondary}>Limpar</button>
                  <button onClick={abrirVenda} disabled={carregando} style={{ ...btnPrimary, opacity: carregando ? 0.6 : 1 }}>
                    {carregando ? 'Abrindo...' : 'Abrir Venda'}
                  </button>
                </div>
              </>
            )}

            {etapa === 'itens' && (
              <>
                <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px 14px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Venda aberta</p>
                  <p style={{ fontSize: '13px', fontFamily: 'monospace', color: '#3a9e6e', marginTop: '4px' }}>{vendaId}</p>
                </div>
                <div>
                  <label style={labelStyle}>Produto</label>
                  <select value={produtoId} onChange={e => setProdutoId(e.target.value)} style={inputStyle}>
                    <option value="">Selecione um produto</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>{p.nome} — R$ {p.preco.toFixed(2)} — {p.estoque} em estoque</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Quantidade</label>
                  <input type="number" min={1} value={quantidade}
                    onChange={e => setQuantidade(parseInt(e.target.value))} style={inputStyle} />
                </div>
                <button onClick={cancelarVendaAberta} disabled={carregando} style={{
                  background: 'rgba(224,82,82,0.1)', color: '#e05252',
                  border: '1px solid rgba(224,82,82,0.3)', borderRadius: '8px',
                  padding: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                  opacity: carregando ? 0.6 : 1,
                }}>
                  {carregando ? 'Cancelando...' : 'Cancelar Venda'}
                </button>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={adicionarItem} disabled={carregando} style={{ ...btnPrimary, opacity: carregando ? 0.6 : 1 }}>
                    {carregando ? 'Adicionando...' : '+ Adicionar Item'}
                  </button>
                  <button onClick={fecharVenda} disabled={carregando} style={{
                    flex: 1, background: '#3a9e6e', color: '#fff', border: 'none',
                    borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 500,
                    cursor: 'pointer', opacity: carregando ? 0.6 : 1,
                  }}>
                    Fechar Venda
                  </button>
                </div>
              </>
            )}

            {etapa === 'finalizada' && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <h3 style={{ color: 'var(--color-text-primary)', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Venda Finalizada!
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                  A venda foi registrada com sucesso.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={novaVenda} style={{ ...btnPrimary, flex: 'none', padding: '12px 28px' }}>Nova Venda</button>
                  <button onClick={() => setAba('historico')} style={{ ...btnSecondary, flex: 'none', padding: '12px 28px' }}>
                    Ver Histórico
                  </button>
                </div>
              </div>
            )}

            {erro     && <p style={{ color: '#e05252', fontSize: '13px' }}>{erro}</p>}
            {mensagem && etapa === 'itens' && <p style={{ color: '#3a9e6e', fontSize: '13px' }}>{mensagem}</p>}
          </div>
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
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ width: '40px', padding: '14px 0 14px 16px' }} />
                  {[['ID da Venda', '140px'], ['Cliente', ''], ['Status', '110px'], ['Total', '110px'], ['Data', '160px']].map(([col, w]) => (
                    <th key={col} style={{
                      textAlign: 'left', color: 'var(--color-text-muted)',
                      fontSize: '13px', fontWeight: 500,
                      padding: '14px 24px 14px 0',
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
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '32px', fontSize: '14px' }}>
                      Nenhuma venda {filtroAtivo !== 'TODAS' ? `com status ${filtroAtivo.toLowerCase()}` : 'registrada'}
                    </td>
                  </tr>
                ) : (
                  vendasFiltradas.map(venda => {
                    const expandida = vendaExpandida === venda.id
                    const itens = venda.itens ?? []
                    return (
                      <>
                        {/* Linha principal */}
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
                          <td style={{ padding: '14px 24px 14px 0', color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 500 }}>
                            {nomeCliente(venda.clienteId)}
                          </td>
                          <td style={{ padding: '14px 24px 14px 0' }}>
                            <span style={{ fontSize: '12px', fontWeight: 500, padding: '3px 10px', borderRadius: '999px', ...badgeStyle(venda.status) }}>
                              {venda.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 24px 14px 0', color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 500 }}>
                            {formatarMoeda(Number(venda.total))}
                          </td>
                          <td style={{ padding: '14px 24px 14px 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                            {dataRelevante(venda)}
                          </td>
                        </tr>

                        {/* Linha expandida com itens */}
                        {expandida && (
                          <tr key={`${venda.id}-itens`} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td colSpan={6} style={{ padding: '0 24px 16px 56px', background: 'var(--color-bg-hover)' }}>
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
                                          color: 'var(--color-text-muted)',
                                          fontWeight: 500,
                                          padding: '8px 12px 8px 0',
                                          fontSize: '12px',
                                        }}>
                                          {col}
                                        </th>
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