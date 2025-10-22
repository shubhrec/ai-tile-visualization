'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    const token = data?.session?.access_token
    if (token) {
      localStorage.setItem('token', token)
      toast.success('Logged in successfully!')
      router.push('/catalog')
    } else {
      toast.error('Login failed.')
    }
    setLoading(false)
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: undefined },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) {
      toast.error(loginError.message)
      setLoading(false)
      return
    }
    const token = loginData?.session?.access_token
    if (token) {
      localStorage.setItem('token', token)
      toast.success('Account created successfully!')
      router.push('/catalog')
    } else {
      toast.error('Signup failed.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dealer Login</h1>
          <p className="text-sm sm:text-base text-gray-600">Enter your credentials to continue</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Processing...' : 'Login'}
              </button>
              <button
                type="button"
                onClick={handleSignup}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Processing...' : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
