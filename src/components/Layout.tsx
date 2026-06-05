import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface Props {
    children: ReactNode
}

export default function Layout({ children }: Props) {
    return (
   <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>        
    )
}