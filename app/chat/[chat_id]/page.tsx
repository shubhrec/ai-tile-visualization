'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import { secureFetch } from '@/lib/api'
import { swrFetcher, swrConfig } from '@/lib/swr-fetcher'
import { useAuth } from '@/lib/auth'
import GeneratedImageCard from '@/components/GeneratedImageCard'
import { ArrowLeft, Image as ImageIcon, Trash2, Check, Loader2, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
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
  tile_name?: string
  tile?: { name: string }
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

  const { data: chatData, error: chatError, isLoading } = useSWR(
    chatId ? `/api/chats/${chatId}` : null,
    swrFetcher,
    swrConfig
  )
  const [generating, setGenerating] = useState(false)

  const chat = chatData?.chat || null
  const images = chatData?.images?.map((img: any) => ({
    ...img,
    tile_name: img.tile_name || (img.tile?.name ?? null),
  })) || []

  const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
  const [selectedHome, setSelectedHome] = useState<Home | null>(null)
  const [prompt, setPrompt] = useState('')
  const [viewImage, setViewImage] = useState<GeneratedImage | null>(null)

  useEffect(() => {
    if (chatError) {
      toast.error('Chat not found')
      router.push('/catalog')
    }
  }, [chatError, router])

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


  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [images])

  const handleKeep = useCallback(async (imageId: string) => {
    try {
      const res = await secureFetch(`/api/generated/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kept: true }),
      })

      if (res.ok) {
        mutate(`/api/chats/${chatId}`)
        toast.success('Image saved to gallery')
        setPrompt('')
      } else {
        toast.error('Failed to keep image')
      }
    } catch (err) {
      console.error('Keep error:', err)
      toast.error('Failed to keep image')
    }
  }, [])

  const handleDelete = useCallback(async (imageId: string) => {
    if (!window.confirm('Delete this visualization?')) return

    try {
      const res = await secureFetch(`/api/generated/${imageId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        mutate(`/api/chats/${chatId}`)
        toast.success('Image deleted')
        setPrompt('')
      } else {
        toast.error('Failed to delete image')
      }
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Failed to delete image')
    }
  }, [])

  const handleAddReference = useCallback(async (imageId: string) => {
    if (!selectedTile?.id) {
      toast.error('Please select a tile first.')
      return
    }

    try {
      const res = await secureFetch(`/api/generated/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tile_id: selectedTile.id }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Added to tile gallery!')
        mutate(`/api/chats/${chatId}`)
      } else {
        toast.error('Failed to add reference.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error adding reference.')
    }
  }, [selectedTile])

  const handleImageClick = useCallback((image: GeneratedImage) => {
    setViewImage(image)
  }, [])

  const getCurrentImageIndex = useCallback(() => {
    if (!viewImage) return -1
    return images.findIndex((img: GeneratedImage) => img.id === viewImage.id)
  }, [viewImage, images])

  const handlePreviousImage = useCallback(() => {
    const currentIndex = getCurrentImageIndex()
    if (currentIndex > 0) {
      setViewImage(images[currentIndex - 1])
    }
  }, [getCurrentImageIndex, images])

  const handleNextImage = useCallback(() => {
    const currentIndex = getCurrentImageIndex()
    if (currentIndex >= 0 && currentIndex < images.length - 1) {
      setViewImage(images[currentIndex + 1])
    }
  }, [getCurrentImageIndex, images])

  useEffect(() => {
    if (!viewImage) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setViewImage(null)
      } else if (e.key === 'ArrowLeft') {
        handlePreviousImage()
      } else if (e.key === 'ArrowRight') {
        handleNextImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewImage, handlePreviousImage, handleNextImage])

  const handleGenerate = async () => {
    if (!selectedTile || !prompt.trim()) {
      toast.error('Please select a tile and enter a prompt')
      return
    }

    setGenerating(true)
    try {
      const mockImageUrl = `https://via.placeholder.com/800x600/667eea/ffffff?text=${encodeURIComponent(prompt.slice(0, 20))}`

      const res = await secureFetch('/generate', {
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
        mutate(`/api/chats/${chatId}`)
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

  const keptCount = Array.isArray(images)
    ? images.filter(img => img?.kept === true).length
    : 0

  if (isLoading) {
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
        className="flex-1 overflow-y-auto p-4 pb-24"
      >
        {!Array.isArray(images) || images.length === 0 ? (
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
          images.filter(Boolean).map((image, idx) => {
            if (!image?.image_url) return null
            return (
              <GeneratedImageCard
                key={image.id || idx}
                id={image.id}
                image_url={image.image_url}
                prompt={image.prompt}
                kept={image.kept}
                tile_id={image.tile_id}
                onImageClick={() => handleImageClick(image)}
                onKeep={() => handleKeep(image.id)}
                onDelete={() => handleDelete(image.id)}
                onAddReference={() => handleAddReference(image.id)}
                canAddReference={!!selectedTile?.id}
              />
            )
          })
        )}
        {generating && (
          <div className="text-center py-10">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600 mb-4" />
            <div className="text-gray-600">Generating visualization...</div>
          </div>
        )}
      </div>

      <div className="bg-white p-4 shadow-lg">
        <div className="flex justify-center gap-2 w-full mb-3">
          <button
            onClick={() => {
              if (selectedTile) {
                sessionStorage.setItem('selectedTile', JSON.stringify(selectedTile))
              }
              router.push('/select/home')
            }}
            title={selectedHome?.name || 'Select Home'}
            className={`flex-1 max-w-[45%] sm:max-w-[200px] p-3 rounded-xl border-2 transition-all ${
              selectedHome
                ? 'bg-blue-50 border-blue-600'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="text-2xl mb-1">📷</div>
            <div className="text-xs font-semibold text-gray-700">Home</div>
            <div className="text-xs text-gray-500 truncate overflow-hidden text-ellipsis whitespace-nowrap">
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
            title={selectedTile?.name || 'Select Tile'}
            className={`flex-1 max-w-[45%] sm:max-w-[200px] p-3 rounded-xl border-2 transition-all ${
              selectedTile
                ? 'bg-blue-50 border-blue-600'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="text-2xl mb-1">🎨</div>
            <div className="text-xs font-semibold text-gray-700">Tile</div>
            <div className="text-xs text-gray-500 truncate overflow-hidden text-ellipsis whitespace-nowrap">
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

      {viewImage && (() => {
        const currentIndex = getCurrentImageIndex()
        const hasPrevious = currentIndex > 0
        const hasNext = currentIndex < images.length - 1

        return (
          <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-4">
            <div className="relative flex items-center justify-center w-full h-full">
              {hasPrevious && (
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-2 sm:left-4 z-10 bg-gradient-to-r from-black/50 to-transparent p-3 sm:p-4 rounded-full text-white hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              )}

              <div className="flex flex-col items-center justify-center max-w-full max-h-full">
                <img
                  src={viewImage.image_url}
                  alt={viewImage.prompt || 'Generated Image'}
                  className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg object-contain"
                />

                <div className="mt-4 text-center space-y-1 text-sm text-gray-200">
                  {viewImage.prompt && <p className="italic">"{viewImage.prompt}"</p>}
                  {viewImage.tile_name && (
                    <p>Generated from tile: <span className="font-semibold">{viewImage.tile_name}</span></p>
                  )}
                </div>
              </div>

              {hasNext && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 sm:right-4 z-10 bg-gradient-to-l from-black/50 to-transparent p-3 sm:p-4 rounded-full text-white hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              )}
            </div>

            <button
              onClick={() => setViewImage(null)}
              className="absolute top-4 right-4 text-white text-3xl hover:opacity-80 transition-opacity"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )
      })()}
    </div>
  )
}
