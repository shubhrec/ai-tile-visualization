'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { mockStore } from '@/lib/mockStore'
import { LogOut } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()

  const handleLogout = () => {
    mockStore.logout()
    router.push('/login')
  }

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          <Link href="/catalog" className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            AI Tile Visualizer
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
