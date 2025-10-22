'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { mockStore } from '@/lib/mockStore'
import { useAuth } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import ImageGrid from '@/components/ImageGrid'
import UploadButton from '@/components/UploadButton'
import BackButton from '@/components/BackButton'
import { Camera, Check } from 'lucide-react'

export default function SelectTilePage() {
  useAuth()
  const router = useRouter()
  const [tiles, setTiles] = useState(mockStore.getTiles())
  const [selectedId, setSelectedId] = useState<string | null>(mockStore.getSelectedTile())

  const handleUpload = (file: File, supabaseUrl: string) => {
    console.log('Tile uploaded to Supabase:', supabaseUrl)
    const newTile = mockStore.addTile(file.name, supabaseUrl)
    console.log('New tile created:', newTile)
    setTiles(mockStore.getTiles())
    setSelectedId(newTile.id)
  }

  const handleConfirm = () => {
    if (selectedId) {
      mockStore.setSelectedTile(selectedId)
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Select Tile Image</h1>

        <div className="flex gap-2 mb-4 sm:mb-6 flex-wrap">
          <button
            disabled
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-200 text-gray-400 cursor-not-allowed text-xs sm:text-sm"
          >
            <Camera className="w-4 h-4" />
            <span className="whitespace-nowrap">Camera (Phase 2)</span>
          </button>
          <UploadButton onUpload={handleUpload} label="Upload" variant="secondary" />
        </div>

        <div className="relative mb-6">
          <ImageGrid
            items={tiles}
            onItemClick={setSelectedId}
          />
          {selectedId && tiles.map(tile =>
            tile.id === selectedId && (
              <div key={tile.id} className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {tiles.map(t => (
                    <div key={t.id} className={`aspect-square ${t.id === selectedId ? 'ring-4 ring-blue-500 rounded-lg' : ''}`}>
                      {t.id === selectedId && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded-full">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        <div className="fixed bottom-6 sm:bottom-8 left-0 right-0 flex justify-center px-3">
          <button
            onClick={handleConfirm}
            disabled={!selectedId}
            className="w-full max-w-xs sm:max-w-sm px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium shadow-lg text-sm sm:text-base"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  )
}
