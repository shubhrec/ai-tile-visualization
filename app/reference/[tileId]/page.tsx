'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { secureFetch } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import ImageModal from '@/components/ImageModal'
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col items-center">
          <img
            src={tile.image_url}
            alt={tile.name}
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
                  className="w-full h-40 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(item.image_url)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
        alt="Generated visualization"
      />
    </div>
  )
}
