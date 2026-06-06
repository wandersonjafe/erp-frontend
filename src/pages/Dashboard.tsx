import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import {
  ShoppingCart,
  FolderOpen,
  DollarSign,
  Users,
  Package,
} from 'lucide-react'

interface Cliente {
  id: string
  nome: string
}

interface Venda {
  id: string
  clienteId: string
  status: 'ABERTA' | 'FECHADA' | 'CANCELADA'
  total: number
}

type FiltroStatus = 'FECHADA' | 'ABERTA' | 'CANCELADA'

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function abreviarId(id: string) {
  return id.length > 8 ? id.substring(0, 8) + '…' : id
}

interface CardProps {
  label: string
  valor: string | number
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  wide?: boolean
}

function MetricCard({ label, valor, icon, iconBg, iconColor, wide }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        flex: wide ? 2 : 1,
        minWidth: wide ? '210px' : '160px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: iconColor,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px', margin: '0 0 3px' }}>
          {label}
        </p>
        <p style={{
          color: 'var(--color-text-primary)',
          fontSize: wide ? '18px' : '22px',
          fontWeight: 600,
          margin: 0,
          lineHeight: 1,
        }}>
          {valor}
        </p>
      </div>
    </div>
  )
}

interface BarraStatusProps {
  label: string
  count: number
  total: number
  cor: string
  ativo: boolean
  onClick: () => void
}

function BarraStatus({ label, count, total, cor, ativo, onClick }: BarraStatusProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div
      onClick={onClick}
      style={{
        marginBottom: '10px',
        padding: '8px 10px',
        borderRadius: '8px',
        cursor: 'pointer',
        border: ativo ? `1px solid ${cor}` : '1px solid transparent',
        background: ativo ? `${cor}18` : 'transparent',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px', fontWeight: ativo ? 600 : 400 }}>
          {label}
        </span>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
          {count} ({pct}%)
        </span>
      </div>
      <div style={{ background: 'var(--color-border)', borderRadius: '4px', height: '5px' }}>
        <div
          style={{
            width: `${pct}%`,
            background: cor,
            height: '5px',
            borderRadius: '4px',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  )
}

function BadgeStatus({ status }: { status: Venda['status'] }) {
  const map = {
    FECHADA:   { bg: 'rgba(34,197,94,0.12)',  color: '#16a34a', label: 'Fechada'   },
    ABERTA:    { bg: 'rgba(234,179,8,0.12)',   color: '#ca8a04', label: 'Aberta'    },
    CANCELADA: { bg: 'rgba(239,68,68,0.12)',   color: '#dc2626', label: 'Cancelada' },
  }
  const s = map[status]
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: '11px',
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: '999px',
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  )
}

export default function Dashboard() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<unknown[]>([])
  const [vendas, setVendas]     = useState<Venda[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('FECHADA')

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
        console.error('Erro ao carregar dashboard:', error)
      } finally {
        setCarregando(false)
      }
    }
    carregarDados()
  }, [])

  const totalVendas = vendas.length
  const fechadas    = vendas.filter(v => v.status === 'FECHADA').length
  const abertas     = vendas.filter(v => v.status === 'ABERTA').length
  const canceladas  = vendas.filter(v => v.status === 'CANCELADA').length
  const valorTotal  = vendas
    .filter(v => v.status === 'FECHADA')
    .reduce((acc, v) => acc + (Number(v.total) || 0), 0)

  const vendasFiltradas = [...vendas]
    .filter(v => v.status === filtroStatus)
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 5)

  const tituloTabela: Record<FiltroStatus, string> = {
    FECHADA:   'Vendas fechadas',
    ABERTA:    'Vendas abertas',
    CANCELADA: 'Vendas canceladas',
  }

  function nomeCliente(clienteId: string) {
    return clientes.find(c => c.id === clienteId)?.nome ?? abreviarId(clienteId)
  }

  if (carregando) {
    return (
      <Layout>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Carregando dashboard...
        </p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div>
        <h2 style={{ color: 'var(--color-text-primary)', fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>
          Dashboard
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '0 0 24px' }}>
          Visão geral do sistema
        </p>

        {/* Cards de métricas */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <MetricCard label="Vendas"       valor={totalVendas}           icon={<ShoppingCart size={20} />} iconBg="rgba(59,130,246,0.12)"  iconColor="#2563eb" />
          <MetricCard label="Valor vendido" valor={formatarMoeda(valorTotal)} icon={<DollarSign size={20} />}  iconBg="rgba(34,197,94,0.12)"   iconColor="#16a34a" wide />
          <MetricCard label="Em aberto"    valor={abertas}               icon={<FolderOpen size={20} />}   iconBg="rgba(234,179,8,0.12)"   iconColor="#ca8a04" />
          <MetricCard label="Clientes"     valor={clientes.length}       icon={<Users size={20} />}        iconBg="rgba(139,92,246,0.12)"  iconColor="#7c3aed" />
          <MetricCard label="Produtos"     valor={produtos.length}       icon={<Package size={20} />}      iconBg="rgba(249,115,22,0.12)"  iconColor="#ea580c" />
        </div>

        {/* Status + Tabela */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>

          {/* Painel de status */}
          <div style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '20px',
            flex: 1,
            minWidth: '200px',
          }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 500, margin: '0 0 4px' }}>
              Status das vendas
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '11px', margin: '0 0 12px' }}>
              Clique para filtrar
            </p>
            <BarraStatus label="Fechadas"   count={fechadas}   total={totalVendas} cor="#16a34a" ativo={filtroStatus === 'FECHADA'}   onClick={() => setFiltroStatus('FECHADA')}   />
            <BarraStatus label="Abertas"    count={abertas}    total={totalVendas} cor="#ca8a04" ativo={filtroStatus === 'ABERTA'}    onClick={() => setFiltroStatus('ABERTA')}    />
            <BarraStatus label="Canceladas" count={canceladas} total={totalVendas} cor="#dc2626" ativo={filtroStatus === 'CANCELADA'} onClick={() => setFiltroStatus('CANCELADA')} />
          </div>

          {/* Tabela filtrada */}
          <div style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '20px',
            flex: 2,
            minWidth: '280px',
          }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 500, margin: '0 0 14px' }}>
              {tituloTabela[filtroStatus]}
            </p>

            {vendasFiltradas.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                Nenhuma venda com este status.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '90px' }} />
                  <col />
                  <col style={{ width: '110px' }} />
                  <col style={{ width: '90px' }} />
                </colgroup>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '11px', textAlign: 'left',  padding: '0 0 8px 0' }}>#</th>
                    <th style={{ color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '11px', textAlign: 'left',  padding: '0 0 8px 0' }}>Cliente</th>
                    <th style={{ color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '11px', textAlign: 'right', padding: '0 0 8px 0' }}>Valor</th>
                    <th style={{ color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '11px', textAlign: 'right', padding: '0 0 8px 0' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasFiltradas.map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ color: 'var(--color-text-muted)', padding: '9px 0', fontFamily: 'monospace', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {abreviarId(v.id)}
                      </td>
                      <td style={{ color: 'var(--color-text-primary)', padding: '9px 8px 9px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {nomeCliente(v.clienteId)}
                      </td>
                      <td style={{ color: 'var(--color-text-primary)', textAlign: 'right', fontWeight: 500, padding: '9px 0', whiteSpace: 'nowrap' }}>
                        {formatarMoeda(Number(v.total) || 0)}
                      </td>
                      <td style={{ textAlign: 'right', padding: '9px 0' }}>
                        <BadgeStatus status={v.status} />
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