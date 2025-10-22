'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { mockStore } from '@/lib/mockStore'
import { useAuth } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import ImageGrid from '@/components/ImageGrid'
import UploadButton from '@/components/UploadButton'
import BackButton from '@/components/BackButton'

export default function CatalogPage() {
  useAuth()
  const router = useRouter()
  const [tiles, setTiles] = useState(mockStore.getTiles())
  const [showUpload, setShowUpload] = useState(false)
  const [tileName, setTileName] = useState('')
  const [uploadedUrl, setUploadedUrl] = useState('')

  const handleTileClick = (id: string) => {
    router.push(`/reference/${id}`)
  }

  const handleUpload = (file: File, supabaseUrl: string) => {
    setUploadedUrl(supabaseUrl)
    setShowUpload(true)
  }

  const handleSaveTile = () => {
    if (tileName.trim() && uploadedUrl) {
      mockStore.addTile(tileName, uploadedUrl)
      setTiles(mockStore.getTiles())
      setShowUpload(false)
      setTileName('')
      setUploadedUrl('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4">
          <BackButton />
        </div>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tile Catalog</h1>
          <UploadButton onUpload={handleUpload} label="Upload Tile" />
        </div>

        {showUpload && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 border rounded-lg bg-white">
            <h2 className="text-base sm:text-lg font-semibold mb-3">New Tile</h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
              <img src={uploadedUrl} alt="Preview" className="w-full sm:w-32 h-32 object-cover rounded-lg" />
              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={tileName}
                  onChange={(e) => setTileName(e.target.value)}
                  placeholder="Enter tile name..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveTile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Tile
                  </button>
                  <button
                    onClick={() => {
                      setShowUpload(false)
                      setTileName('')
                      setUploadedUrl('')
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ImageGrid items={tiles} onItemClick={handleTileClick} />
      </div>
    </div>
  )
}
