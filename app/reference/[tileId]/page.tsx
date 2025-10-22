'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { mockStore, MockGeneratedMessage } from '@/lib/mockStore'
import { useAuth } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import Modal from '@/components/Modal'
import BackButton from '@/components/BackButton'
import { Sparkles } from 'lucide-react'

export default function ReferencePage() {
  useAuth()
  const params = useParams()
  const router = useRouter()
  const tileId = params.tileId as string

  const [tile, setTile] = useState(mockStore.getTileById(tileId))
  const [savedGallery, setSavedGallery] = useState<MockGeneratedMessage[]>([])
  const [selectedImage, setSelectedImage] = useState<MockGeneratedMessage | null>(null)

  useEffect(() => {

    if (!tile) {
      router.push('/catalog')
      return
    }

    setSavedGallery(mockStore.getSavedGeneratedForTile(tileId))
  }, [tileId, tile, router])

  const handleGenerate = () => {
    router.push(`/chat?tileId=${tileId}`)
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
              src={tile.imageUrl}
              alt={tile.name}
              className="w-full sm:w-48 md:w-64 h-48 sm:h-48 md:h-64 object-cover rounded-lg shadow-lg"
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Saved Gallery</h2>
          {savedGallery.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
              <p className="text-gray-500">No saved visualizations yet</p>
              <p className="text-sm text-gray-400 mt-2">Generate and save images to build your gallery</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {savedGallery.map((item) => (
                <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-md">
                  <div className="relative aspect-square">
                    <img
                      src={item.imageUrl}
                      alt="Saved visualization"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2 sm:p-3">
                    {item.prompt && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{item.prompt}</p>
                    )}
                    <button
                      onClick={() => setSelectedImage(item)}
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
                    >
                      View
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
        imageUrl={selectedImage?.imageUrl || ''}
        title={selectedImage?.prompt}
      />
    </div>
  )
}
