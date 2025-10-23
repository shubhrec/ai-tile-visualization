'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { secureFetch } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import ImageGrid from '@/components/ImageGrid'
import BackButton from '@/components/BackButton'
import TileUploadModal from '@/components/TileUploadModal'
import { MessageCircle, PlusCircle, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface Tile {
  id: string
  name: string
  image_url: string
  created_at: string
}

export default function CatalogPage() {
  useAuth()
  const router = useRouter()
  const [tiles, setTiles] = useState<Tile[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)

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

  const handleTileClick = (id: string) => {
    router.push(`/reference/${id}`)
  }

  const handleUploadSuccess = async () => {
    try {
      const res = await secureFetch('/api/tiles')
      const data = await res.json()
      setTiles(data.tiles || [])
    } catch (err) {
      console.error('Failed to reload tiles', err)
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4">
          <BackButton />
        </div>
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
          <ImageGrid
            items={tiles.map(tile => ({
              id: tile.id,
              name: tile.name,
              imageUrl: tile.image_url
            }))}
            onItemClick={handleTileClick}
            onDelete={handleDelete}
            showDelete={false}
            editMode={false}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg py-3 flex justify-around items-center z-50">
        <button
          onClick={() => console.log('Open Chats')}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs mt-1">Chats</span>
        </button>

        <button
          onClick={() => console.log('New Chat')}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <PlusCircle className="w-6 h-6" />
          <span className="text-xs mt-1">New Chat</span>
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
    </div>
  )
}
