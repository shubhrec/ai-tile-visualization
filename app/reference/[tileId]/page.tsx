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

interface Home {
  id: string
  name: string
  image_url: string
  created_at: string
}

interface ComparisonData extends GeneratedImage {
  home?: Home
  homeAspect?: number
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
  const [comparisonImage, setComparisonImage] = useState<ComparisonData | null>(null)
  const [comparisonLoading, setComparisonLoading] = useState(false)

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

  async function openComparison(gen: GeneratedImage) {
    setComparisonImage(null)
    if (!gen.home_id) {
      toast.error('No home image associated with this generation')
      return
    }
    setComparisonLoading(true)
    try {
      const res = await secureFetch(`/api/homes/${gen.home_id}`)
      const data = await res.json()
      if (data.success && data.home) {
        setComparisonImage({ ...gen, home: data.home })
      } else {
        toast.error('Could not load home image')
      }
    } catch (err) {
      console.error('Failed to fetch home for comparison', err)
      toast.error('Could not load home image')
    } finally {
      setComparisonLoading(false)
    }
  }

  useEffect(() => {
    if (comparisonImage?.home?.image_url) {
      const img = new Image()
      img.src = comparisonImage.home.image_url
      img.onload = () => {
        const aspectRatio = img.width / img.height
        setComparisonImage(prev => prev ? { ...prev, homeAspect: aspectRatio } : null)
      }
    }
  }, [comparisonImage?.home?.image_url])

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
                      onClick={() => setSelectedImage(item.image_url)}
                    />
                  </div>
                  <div className="p-2 sm:p-3">
                    {item.prompt && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{item.prompt}</p>
                    )}
                    <button
                      onClick={() => openComparison(item)}
                      disabled={comparisonLoading}
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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

      {comparisonImage && comparisonImage.home && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setComparisonImage(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl p-4 sm:p-6 relative flex flex-col max-h-[95vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setComparisonImage(null)}
              className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors z-10"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-lg sm:text-xl font-semibold text-center mb-2">Before / After Comparison</h2>
            {comparisonImage.prompt && (
              <p className="text-xs sm:text-sm text-gray-600 mb-4 text-center italic">{comparisonImage.prompt}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center items-start mx-auto w-full">
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold text-gray-700 mb-2">Original Home</p>
                <img
                  src={comparisonImage.home.image_url}
                  alt={comparisonImage.home.name || 'Original Home'}
                  className="max-h-[75vh] max-w-full rounded-lg object-contain border shadow-sm"
                />
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold text-gray-700 mb-2">Generated Visualization</p>
                <img
                  src={comparisonImage.image_url}
                  alt="Generated Visualization"
                  className="max-h-[75vh] max-w-full rounded-lg object-contain border shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {comparisonLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading comparison...</p>
          </div>
        </div>
      )}
    </div>
  )
}
