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
      <main
        className="ml-64 flex-1 p-8"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {children}
      </main>
    </div>
  )
}