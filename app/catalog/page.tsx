'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { secureFetch } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import TileCard from '@/components/TileCard'
import TileUploadModal from '@/components/TileUploadModal'
import { MessageCircle, PlusCircle, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface Tile {
  id: string
  name: string
  image_url: string
  size?: string
  price?: number
  add_catalog?: boolean
  created_at: string
}

export default function CatalogPage() {
  useAuth()
  const router = useRouter()
  const [tiles, setTiles] = useState<Tile[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingTempTile, setEditingTempTile] = useState<Tile | null>(null)
  const [isCreatingChat, setIsCreatingChat] = useState(false)

  useEffect(() => {
    async function loadTiles() {
      try {
        const res = await secureFetch('/api/tiles')
        const data = await res.json()
        setTiles(data.tiles || [])
      } catch (err) {
        console.error('Failed to fetch tiles', err)
        toast.error('Failed to load tiles')
      } finally {
        setLoading(false)
      }
    }
    loadTiles()
  }, [])

  const handleTileClick = useCallback((id: string) => {
    router.push(`/reference/${id}`)
  }, [router])

  const handleUploadSuccess = async () => {
    try {
      const res = await secureFetch('/api/tiles')
      const data = await res.json()
      setTiles(data.tiles || [])
    } catch (err) {
      console.error('Failed to reload tiles', err)
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

  const handleDelete = async (tileId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this tile?')
    if (!confirmDelete) return

    try {
      const res = await secureFetch(`/api/tiles/${tileId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setTiles(prev => prev.filter(t => t.id !== tileId))
      toast.success('Tile deleted successfully')
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Failed to delete tile')
    }
  }

  const handleAddToCatalog = async (tile: Tile) => {
    setEditingTempTile(tile)
  }

  const handleSaveTempTile = async () => {
    if (!editingTempTile) return

    try {
      const res = await secureFetch(`/api/tiles/${editingTempTile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingTempTile.name,
          size: editingTempTile.size,
          price: editingTempTile.price,
          add_catalog: true,
        }),
      })

      if (res.ok) {
        toast.success('Tile added to catalog')
        setEditingTempTile(null)
        const tilesRes = await secureFetch('/api/tiles')
        const data = await tilesRes.json()
        setTiles(data.tiles || [])
      } else {
        toast.error('Failed to update tile')
      }
    } catch (err) {
      console.error('Update error:', err)
      toast.error('Failed to update tile')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tile Catalog</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : tiles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
            <p className="text-gray-500">No tiles yet</p>
            <p className="text-sm text-gray-400 mt-2">Upload your first tile to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {tiles.map(tile => (
              <TileCard
                key={tile.id}
                id={tile.id}
                name={tile.name}
                image_url={tile.image_url}
                add_catalog={tile.add_catalog}
                onClick={(id) => {
                  if (tile.add_catalog === false) {
                    handleAddToCatalog(tile)
                  } else {
                    handleTileClick(id)
                  }
                }}
              />
            ))}
          </div>
        )}
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
          onClick={() => setShowUploadModal(true)}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <Upload className="w-6 h-6" />
          <span className="text-xs mt-1">Upload Tile</span>
        </button>
      </div>

      <TileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />

      {editingTempTile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-center">Add Tile Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Tile Name</label>
                <input
                  type="text"
                  value={editingTempTile.name || ''}
                  onChange={(e) => setEditingTempTile({ ...editingTempTile, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Tile Size</label>
                <input
                  type="text"
                  value={editingTempTile.size || ''}
                  onChange={(e) => setEditingTempTile({ ...editingTempTile, size: e.target.value })}
                  placeholder="e.g. 600x600 mm"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Tile Price (₹)</label>
                <input
                  type="number"
                  value={editingTempTile.price || ''}
                  onChange={(e) => setEditingTempTile({ ...editingTempTile, price: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 45.50"
                  step="0.01"
                  min="0"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingTempTile(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTempTile}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add to Catalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
