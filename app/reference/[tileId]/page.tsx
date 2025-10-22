'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { secureFetch } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import Modal from '@/components/Modal'
import BackButton from '@/components/BackButton'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface Tile {
  id: string
  name: string
  image_url: string
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
  const [comparisonImage, setComparisonImage] = useState<GeneratedImage | null>(null)

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

  const handleGenerate = () => {
    if (tile) {
      sessionStorage.setItem('selectedTile', JSON.stringify(tile))
    }
    router.push(`/chat?tileId=${tileId}`)
  }

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

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4">
          <BackButton />
        </div>
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <img
              src={tile.image_url}
              alt={tile.name}
              className="w-full sm:w-48 md:w-64 h-48 sm:h-48 md:h-64 object-cover rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedImage(tile.image_url)}
            />
            <div className="flex-1 w-full">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{tile.name}</h1>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Generate visualizations of this tile in different home settings
              </p>
              <button
                onClick={handleGenerate}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Sparkles className="w-5 h-5" />
                Generate Visualizations
              </button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Generated Gallery</h2>
          {generatedImages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
              <p className="text-gray-500">No generated visualizations yet</p>
              <p className="text-sm text-gray-400 mt-2">Generate and save images to build your gallery</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {generatedImages.map((item) => (
                <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square">
                    <img
                      src={item.image_url}
                      alt="Generated visualization"
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setComparisonImage(item)}
                    />
                  </div>
                  <div className="p-2 sm:p-3">
                    {item.prompt && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{item.prompt}</p>
                    )}
                    <button
                      onClick={() => setComparisonImage(item)}
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
                    >
                      Compare
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
      />

      {comparisonImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setComparisonImage(null)}>
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">Before / After Comparison</h2>
            {comparisonImage.prompt && (
              <p className="text-sm text-gray-600 mb-4 text-center italic">{comparisonImage.prompt}</p>
            )}
            <div className="flex flex-col md:flex-row gap-4">
              {comparisonImage.home_image_url && (
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700 mb-2 text-center">Original Home</p>
                  <img
                    src={comparisonImage.home_image_url}
                    alt="Original Home"
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700 mb-2 text-center">Generated Result</p>
                <img
                  src={comparisonImage.image_url}
                  alt="Generated"
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            </div>
            <button
              className="mt-4 sm:mt-6 w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
              onClick={() => setComparisonImage(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
