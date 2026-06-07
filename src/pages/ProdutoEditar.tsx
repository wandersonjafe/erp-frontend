import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <div
      className="flex min-h-screen transition-colors duration-300"
      style={{ background: 'var(--color-bg-primary)' }}
    >
      <Sidebar />

      {/*
        Desktop (md+): ml-64 para compensar a sidebar fixa
        Mobile: ml-0 + pt-14 para compensar a topbar fixa de 56px
      */}
      <main
        className="flex-1 p-6 md:p-8 ml-0 md:ml-64 pt-20 md:pt-8"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {children}
      </main>
    </div>
  )
}