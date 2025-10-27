'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { secureFetch } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import ImageModal from '@/components/ImageModal'
import { MessageCircle, PlusCircle, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'

interface Tile {
  id: string
  name: string
  image_url: string
  size?: string
  price?: number
  created_at: string
}

interface GeneratedImage {
  id: string
  tile_id: string
  home_id: string | null
  prompt: string
  image_url: string
  home_image_url: string | null
  saved: boolean
  created_at: string
}


export default function ReferencePage() {
  useAuth()
  const params = useParams()
  const router = useRouter()
  const tileId = params.tileId as string

  const [tile, setTile] = useState<Tile | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [editModal, setEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editSize, setEditSize] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [isCreatingChat, setIsCreatingChat] = useState(false)

  useEffect(() => {
    async function fetchTile() {
      try {
        const res = await secureFetch(`/api/tiles/${tileId}`)

        if (!res.ok) {
          toast.error('Tile not found')
          router.push('/catalog')
          return
        }

        const data = await res.json()
        setTile(data.tile)
        setEditName(data.tile.name || '')
        setEditSize(data.tile.size || '')
        setEditPrice(data.tile.price?.toString() || '')
        sessionStorage.setItem('selectedTile', JSON.stringify(data.tile))

        const genRes = await secureFetch(`/api/tiles/${tileId}/generated`)
        const genData = await genRes.json()
        setGeneratedImages(genData.generated || [])
      } catch (err) {
        console.error('Failed to fetch tile', err)
        toast.error('Failed to load tile')
        router.push('/catalog')
      } finally {
        setLoading(false)
      }
    }
    fetchTile()
  }, [tileId, router])

  const refreshTileData = async () => {
    try {
      const res = await secureFetch(`/api/tiles/${tileId}`)
      if (res.ok) {
        const data = await res.json()
        setTile(data.tile)
        setEditName(data.tile.name || '')
        setEditSize(data.tile.size || '')
        setEditPrice(data.tile.price?.toString() || '')
      }
    } catch (err) {
      console.error('Failed to refresh tile', err)
    }
  }

  const handleUpdateTile = async () => {
    try {
      const payload: any = { name: editName }
      if (editSize) payload.size = editSize
      if (editPrice) {
        const price = parseFloat(editPrice)
        if (!isNaN(price) && price >= 0) {
          payload.price = price
        }
      }

      const res = await secureFetch(`/api/tiles/${tileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Tile updated successfully!')
        setEditModal(false)
        refreshTileData()
      } else {
        toast.error('Failed to update tile.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error updating tile.')
    }
  }

  const handleDeleteTile = async () => {
    if (!window.confirm('Are you sure you want to delete this tile?')) return

    try {
      const res = await secureFetch(`/api/tiles/${tileId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Tile deleted successfully!')
        router.push('/catalog')
      } else {
        toast.error('Failed to delete tile.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error deleting tile.')
    }
  }

  const handleNewChat = useCallback(async () => {
    if (isCreatingChat) return
    setIsCreatingChat(true)

    try {
      const res = await secureFetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/chat/${data.chat.id}`)
      } else {
        toast.error('Failed to create chat')
      }
    } catch (err) {
      console.error('Create chat error:', err)
      toast.error('Failed to create chat')
    } finally {
      setIsCreatingChat(false)
    }
  }, [isCreatingChat, router])


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!tile) return null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col items-center">
          <img
            src={tile.image_url}
            alt={tile.name}
            loading="eager"
            decoding="async"
            className="w-64 h-64 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setSelectedImage(tile.image_url)}
          />

          <div className="mt-4 text-center space-y-1">
            <h2 className="text-lg font-semibold text-gray-800">{tile.name}</h2>
            {tile.size && (
              <p className="text-sm text-gray-600">
                Size: {tile.size}
              </p>
            )}
            {tile.price && (
              <p className="text-sm text-gray-600">
                Price: ₹{tile.price.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Generated Images</h3>
          {generatedImages.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed">
              <p className="text-gray-500">No images yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {generatedImages.map((item) => (
                <img
                  key={item.id}
                  src={item.image_url}
                  alt="Generated Visualization"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-40 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(item.image_url)}
                />
              ))}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg py-3 flex justify-around items-center z-50">
        <button
          onClick={() => router.push('/chats')}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs mt-1">Chats</span>
        </button>

        <button
          onClick={handleNewChat}
          disabled={isCreatingChat}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusCircle className="w-6 h-6" />
          <span className="text-xs mt-1">{isCreatingChat ? 'Creating...' : 'New Chat'}</span>
        </button>

        <button
          onClick={() => setEditModal(true)}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <Pencil className="w-6 h-6" />
          <span className="text-xs mt-1">Edit</span>
        </button>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setEditModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold mb-4 text-center">Edit Tile</h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Tile Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Tile Size</label>
                <input
                  type="text"
                  value={editSize}
                  onChange={(e) => setEditSize(e.target.value)}
                  placeholder="e.g. 600x600 mm"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Tile Price (₹)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="e.g. 45.50"
                  step="0.01"
                  min="0"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateTile}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save Changes
              </button>

              <button
                onClick={handleDeleteTile}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete Tile
              </button>
            </div>
          </div>
        </div>
      )}

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
        alt="Generated visualization"
      />
    </div>
  )
}
