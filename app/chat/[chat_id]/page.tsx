'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { secureFetch } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { ArrowLeft, Image as ImageIcon, Trash2, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Chat {
  id: string
  name: string
  created_at: string
}

interface GeneratedImage {
  id: string
  chat_id: string
  tile_id: string
  home_id: string | null
  prompt: string
  image_url: string
  kept: boolean
  created_at: string
}

interface Tile {
  id: string
  name: string
  image_url: string
}

interface Home {
  id: string
  name: string
  image_url: string
}

export default function ChatPage() {
  useAuth()
  const params = useParams()
  const router = useRouter()
  const chatId = params.chat_id as string
  const chatAreaRef = useRef<HTMLDivElement>(null)

  const [chat, setChat] = useState<Chat | null>(null)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
  const [selectedHome, setSelectedHome] = useState<Home | null>(null)
  const [prompt, setPrompt] = useState('')

  useEffect(() => {
    loadChatData()
  }, [chatId])

  useEffect(() => {
    const savedHome = sessionStorage.getItem('selectedHome')
    if (savedHome) {
      try {
        const home = JSON.parse(savedHome)
        setSelectedHome(home)
        toast.success(`Selected ${home.name || 'Home'} added to chat`)
      } catch (err) {
        console.error('Failed to parse saved home', err)
      }
    }

    const savedTile = sessionStorage.getItem('selectedTile')
    if (savedTile) {
      try {
        const tile = JSON.parse(savedTile)
        setSelectedTile(tile)
        toast.success(`Selected ${tile.name || 'Tile'} added to chat`)
      } catch (err) {
        console.error('Failed to parse saved tile', err)
      }
    }
  }, [])

  const loadChatData = async () => {
    try {
      const res = await secureFetch(`/api/chats/${chatId}`)
      if (!res.ok) {
        toast.error('Chat not found')
        router.push('/catalog')
        return
      }

      const data = await res.json()
      setChat(data.chat)
      setImages(data.images || [])
    } catch (err) {
      console.error('Failed to load chat', err)
      toast.error('Failed to load chat')
      router.push('/catalog')
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [images])

  const handleKeep = async (imageId: string) => {
    try {
      const res = await secureFetch(`/api/generated/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kept: true }),
      })

      if (res.ok) {
        setImages(prev =>
          prev.map(img =>
            img.id === imageId ? { ...img, kept: true } : img
          )
        )
        toast.success('Image saved to gallery')
        setPrompt('')
      } else {
        toast.error('Failed to keep image')
      }
    } catch (err) {
      console.error('Keep error:', err)
      toast.error('Failed to keep image')
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!window.confirm('Delete this visualization?')) return

    try {
      const res = await secureFetch(`/api/generated/${imageId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId))
        toast.success('Image deleted')
        setPrompt('')
      } else {
        toast.error('Failed to delete image')
      }
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Failed to delete image')
    }
  }

  const handleGenerate = async () => {
    if (!selectedTile || !prompt.trim()) {
      toast.error('Please select a tile and enter a prompt')
      return
    }

    setGenerating(true)
    try {
      const mockImageUrl = `https://via.placeholder.com/800x600/667eea/ffffff?text=${encodeURIComponent(prompt.slice(0, 20))}`

      const res = await secureFetch('/api/generated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          tile_id: selectedTile.id,
          home_id: selectedHome?.id || null,
          prompt: prompt.trim(),
          image_url: mockImageUrl,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setImages(prev => [...prev, data.image])
        toast.success('Image generated')
      } else {
        toast.error('Failed to generate image')
      }
    } catch (err) {
      console.error('Generate error:', err)
      toast.error('Failed to generate image')
    } finally {
      setGenerating(false)
    }
  }

  const keptCount = images.filter(img => img.kept).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!chat) return null

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/catalog')}
            className="text-blue-600 text-2xl"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-sm font-semibold text-gray-800">
            {chat.name}
          </div>
        </div>
        <button className="bg-blue-600 text-white px-3 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Gallery
          <span className="bg-white/25 px-2 py-0.5 rounded-full text-xs">
            {keptCount}
          </span>
        </button>
      </div>

      <div
        ref={chatAreaRef}
        className="flex-1 overflow-y-auto p-4"
      >
        {images.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 opacity-50">🎨</div>
            <div className="text-lg font-semibold text-gray-800 mb-2">
              Start Visualizing
            </div>
            <div className="text-sm text-gray-600 leading-relaxed">
              Select a home photo and tile below,<br />
              then tap Generate to see the magic!
            </div>
          </div>
        ) : (
          images.map((image) => (
            <div key={image.id} className="mb-5">
              <div className="bg-white rounded-2xl overflow-hidden shadow-md">
                <img
                  src={image.image_url}
                  alt={image.prompt}
                  className="w-full h-96 object-cover"
                />
                {image.kept ? (
                  <div className="text-center py-3 bg-green-50 text-green-700 text-sm font-medium">
                    ✓ Saved to gallery
                  </div>
                ) : (
                  <div className="flex gap-3 p-3">
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 active:opacity-70 transition-opacity"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </button>
                    <button
                      onClick={() => handleKeep(image.id)}
                      className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 active:opacity-70 transition-opacity"
                    >
                      <Check className="w-5 h-5" />
                      Keep
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {generating && (
          <div className="text-center py-10">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600 mb-4" />
            <div className="text-gray-600">Generating visualization...</div>
          </div>
        )}
      </div>

      <div className="bg-white p-4 shadow-lg">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => {
              if (selectedTile) {
                sessionStorage.setItem('selectedTile', JSON.stringify(selectedTile))
              }
              router.push('/select/home')
            }}
            className={`flex-1 p-3 rounded-xl border-2 transition-all ${
              selectedHome
                ? 'bg-blue-50 border-blue-600'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="text-2xl mb-1">📷</div>
            <div className="text-xs font-semibold text-gray-700">Home</div>
            <div className="text-xs text-gray-500 truncate">
              {selectedHome ? selectedHome.name : 'Select'}
            </div>
            <div className="text-xs text-blue-600 font-semibold mt-1">
              TAP TO CHANGE
            </div>
          </button>

          <button
            onClick={() => {
              if (selectedHome) {
                sessionStorage.setItem('selectedHome', JSON.stringify(selectedHome))
              }
              router.push('/select/tile')
            }}
            className={`flex-1 p-3 rounded-xl border-2 transition-all ${
              selectedTile
                ? 'bg-blue-50 border-blue-600'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="text-2xl mb-1">🎨</div>
            <div className="text-xs font-semibold text-gray-700">Tile</div>
            <div className="text-xs text-gray-500 truncate">
              {selectedTile ? selectedTile.name : 'Select'}
            </div>
            <div className="text-xs text-blue-600 font-semibold mt-1">
              TAP TO CHANGE
            </div>
          </button>
        </div>

        <div className="mb-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe how you want to see the tile... e.g., 'Show tile on bathroom wall with bright lighting'"
            className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-600"
            rows={2}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!selectedTile || !prompt.trim() || generating}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed active:opacity-80 transition-opacity"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              ✨ Generate Visualization
            </>
          )}
        </button>
      </div>
    </div>
  )
}
