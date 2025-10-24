'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { secureFetch } from '@/lib/api'
import Navbar from '@/components/Navbar'
import { MessageSquare } from 'lucide-react'

interface Chat {
  id: string
  name: string
  created_at: string
}

export default function ChatsPage() {
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await secureFetch('/api/chats')
        const data = await res.json()
        setChats(data.chats || [])
      } catch (err) {
        console.error('Failed to fetch chats', err)
      } finally {
        setLoading(false)
      }
    }
    fetchChats()
  }, [])

  if (loading) return <div className="flex justify-center py-10 text-gray-500">Loading chats...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Your Chats</h1>

        {chats.length === 0 ? (
          <p className="text-gray-500 text-center mt-12">No chats yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => router.push(`/chat/${chat.id}`)}
                className="w-full bg-white rounded-lg shadow-sm border p-4 flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold text-gray-800">{chat.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(chat.created_at).toLocaleString()}
                  </p>
                </div>
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
