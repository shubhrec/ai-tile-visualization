'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { LogOut, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === '/login'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('token')
    toast.success('Logged out successfully')
    router.push('/login')
  }

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/catalog" className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              AI Tile Visualizer
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/catalog" className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
                Tiles
              </Link>
              <Link href="/homes" className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
                My Homes
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {!isLoginPage && (
              <button
                onClick={() => router.push('/generate')}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Generate Visualization</span>
                <span className="sm:hidden">Generate</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
