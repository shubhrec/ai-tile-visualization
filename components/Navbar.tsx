'use client'

import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, Grid, LogOut } from 'lucide-react'
import { toast } from 'sonner'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const isAuthPage = pathname === '/login' || pathname === '/signup'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('token')
    toast.success('Logged out successfully')
    router.push('/login')
  }

  if (isAuthPage) return null

  return (
    <nav className="w-full bg-white shadow-sm py-3 px-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div className="flex items-center gap-2">
          <Grid className="w-5 h-5 text-blue-600" />
          <span className="text-base font-semibold text-gray-800">TileViz</span>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </nav>
  )
}
