import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import type { Cliente, Venda } from '../types'

// ── Helpers
function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function abreviarUUID(id: string) {
  return id.length > 8 ? `${id.substring(0, 8)}...` : id
}

function badgeVenda(status: Venda['status']) {
  const map = {
    FECHADA:   { bg: '#14532d', cor: '#86efac', label: 'Fechada'   },
    ABERTA:    { bg: '#713f12', cor: '#fde68a', label: 'Aberta'    },
    CANCELADA: { bg: '#7f1d1d', cor: '#fca5a5', label: 'Cancelada' },
  }
  const s = map[status] ?? { bg: '#374151', cor: '#9ca3af', label: status }
  return (
    <span style={{
      background: s.bg,
      color: s.cor,
      fontSize: '11px',
      fontWeight: 500,
      padding: '2px 10px',
      borderRadius: '999px',
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}

// ── Card de métrica
interface CardProps {
  label: string
  valor: string | number
  sub?: string
  borda: string
  fundo: string
}

function MetricCard({ label, valor, sub, borda, fundo }: CardProps) {
  return (
    <div style={{
      background: fundo,
      border: `1px solid ${borda}`,
      borderRadius: '12px',
      padding: '20px 24px',
      flex: 1,
      minWidth: '140px',
    }}>
      <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '6px' }}>{label}</p>
      <p style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', lineHeight: 1 }}>{valor}</p>
      {sub && <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px' }}>{sub}</p>}
    </div>
  )
}

// ── Barra de progresso por status 
function BarraStatus({ label, count, total, cor }: { label: string; count: number; total: number; cor: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: '#9ca3af', fontSize: '12px' }}>{label}</span>
        <span style={{ color: '#6b7280', fontSize: '12px' }}>{count} ({pct}%)</span>
      </div>
      <div style={{ background: '#1f2937', borderRadius: '4px', height: '6px' }}>
        <div style={{
          width: `${pct}%`,
          background: cor,
          height: '6px',
          borderRadius: '4px',
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

// ── Componente principal 
export default function Dashboard() {
  const [clientes, setClientes]     = useState<Cliente[]>([])
  const [totalProdutos, setTotalProdutos] = useState(0)
  const [vendas, setVendas]         = useState<Venda[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resClientes, resProdutos, resVendas] = await Promise.all([
          api.get('/clientes'),
          api.get('/produtos'),
          api.get('/vendas'),
        ])
        setClientes(resClientes.data)
        setTotalProdutos(resProdutos.data.length)
        setVendas(resVendas.data)
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
      } finally {
        setCarregando(false)
      }
    }
    carregarDados()
  }, [])

  // ── Métricas derivadas 
  const totalVendas = vendas.length
  const fechadas    = vendas.filter(v => v.status === 'FECHADA').length
  const abertas     = vendas.filter(v => v.status === 'ABERTA').length
  const canceladas  = vendas.filter(v => v.status === 'CANCELADA').length

 const valorTotal = vendas
  .filter(v => v.status === 'FECHADA')
  .reduce((acc, v) => acc + (Number(v.total) || 0), 0)

  const vendasRecentes = [...vendas]
    .sort((a, b) => String(b.id).localeCompare(String(a.id)))
    .slice(0, 5)

  // ── Cruza clienteId com a lista de clientes para obter o nome
  function nomeCliente(clienteId: string) {
    const cliente = clientes.find(c => c.id === clienteId)
    return cliente ? cliente.nome : `Cliente ${abreviarUUID(clienteId)}`
  }

  // ── Loading
  if (carregando) {
    return (
      <Layout>
        <p style={{ color: '#9ca3af' }}>Carregando dashboard...</p>
      </Layout>
    )
  }

  // ── Render 
  return (
    <Layout>
      <div>

        {/* Cabeçalho */}
        <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '4px', fontWeight: 'bold' }}>
          Dashboard
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
          Visão geral do sistema
        </p>

        {/* ── Linha 1: Cards de métricas ── */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <MetricCard
            label="Total de vendas"
            valor={totalVendas}
            sub="no sistema"
            borda="#3b82f6"
            fundo="#1e3a5f"
          />
          <MetricCard
            label="Valor total vendido"
            valor={formatarMoeda(valorTotal)}
            sub="vendas fechadas"
            borda="#10b981"
            fundo="#064e3b"
          />
          <MetricCard
            label="Clientes"
            valor={clientes.length}
            sub="cadastrados"
            borda="#a855f7"
            fundo="#2e1f5e"
          />
          <MetricCard
            label="Produtos"
            valor={totalProdutos}
            sub="no catálogo"
            borda="#f59e0b"
            fundo="#451a03"
          />
        </div>

        {/* ── Linha 2: Status + Vendas recentes ── */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>

          {/* Status das vendas */}
          <div style={{
            background: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '12px',
            padding: '20px 24px',
            flex: 1,
            minWidth: '220px',
          }}>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '16px', fontWeight: 500 }}>
              Status das vendas
            </p>
            <BarraStatus label="Fechadas"   count={fechadas}   total={totalVendas} cor="#10b981" />
            <BarraStatus label="Abertas"    count={abertas}    total={totalVendas} cor="#f59e0b" />
            <BarraStatus label="Canceladas" count={canceladas} total={totalVendas} cor="#ef4444" />
          </div>

          {/* Vendas recentes */}
          <div style={{
            background: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '12px',
            padding: '20px 24px',
            flex: 2,
            minWidth: '300px',
            overflowX: 'auto',
          }}>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '14px', fontWeight: 500 }}>
              Vendas recentes
            </p>

            {vendasRecentes.length === 0 ? (
              <p style={{ color: '#4b5563', fontSize: '13px' }}>Nenhuma venda registrada.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1f2937' }}>
                    {['ID', 'Cliente', 'Valor', 'Status'].map(col => (
                      <th key={col} style={{
                        color: '#4b5563',
                        fontWeight: 500,
                        fontSize: '11px',
                        textAlign: col === 'Valor' || col === 'Status' ? 'right' : 'left',
                        paddingBottom: '8px',
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vendasRecentes.map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #1f2937' }}>
                      {/* ID abreviado */}
                      <td style={{ color: '#4b5563', padding: '10px 0', width: '80px', fontFamily: 'monospace', fontSize: '11px' }}>
                        {abreviarUUID(String(v.id))}
                      </td>
                      {/* Nome do cliente cruzado com a lista */}
                      <td style={{ color: '#e5e7eb', paddingRight: '12px' }}>
                        {nomeCliente(v.clienteId)}
                      </td>
                      {/* Valor total — Number() garante que BigDecimal string funcione */}
                      <td style={{ color: '#e5e7eb', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {formatarMoeda(Number(v.total) || 0)}
                      </td>
                      {/* Badge de status */}
                      <td style={{ textAlign: 'right', paddingLeft: '12px' }}>
                        {badgeVenda(v.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </Layout>
  )
}