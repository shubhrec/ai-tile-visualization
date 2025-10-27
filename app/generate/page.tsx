'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { secureFetch } from '@/lib/api'
import Navbar from '@/components/Navbar'
import BackButton from '@/components/BackButton'
import UploadButton from '@/components/UploadButton'
import { Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'

const ImageSelector = memo(function ImageSelector({
  items,
  onSelect,
  title
}: {
  items: { id: string; name: string; image_url: string }[]
  onSelect: (item: any) => void
  title: string
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No items available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="flex flex-col items-center gap-2 p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-32 object-cover rounded"
                  />
                  <p className="text-sm font-medium text-gray-700 text-center truncate w-full">{item.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

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

export default function GeneratePage() {
  useAuth()
  const router = useRouter()
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
  const [selectedHome, setSelectedHome] = useState<Home | null>(null)
  const [tiles, setTiles] = useState<Tile[]>([])
  const [homes, setHomes] = useState<Home[]>([])
  const [showTileSelector, setShowTileSelector] = useState(false)
  const [showHomeSelector, setShowHomeSelector] = useState(false)

  useEffect(() => {
    loadCatalogs()
  }, [])

  async function loadCatalogs() {
    try {
      const [tilesRes, homesRes] = await Promise.all([
        secureFetch('/api/tiles'),
        secureFetch('/api/homes')
      ])
      const tilesData = await tilesRes.json()
      const homesData = await homesRes.json()
      setTiles(tilesData.tiles || [])
      setHomes(homesData.homes || [])
    } catch (err) {
      console.error('Failed to load catalogs', err)
      toast.error('Failed to load catalogs')
    }
  }

  const handleTileUpload = async (file: File, url: string) => {
    try {
      const res = await secureFetch('/api/tiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: url,
          name: file.name || 'Untitled Tile',
        }),
      })
      const data = await res.json()
      if (data.tile) {
        setSelectedTile({
          id: data.tile.id,
          name: data.tile.name,
          image_url: data.tile.image_url
        })
        setShowTileSelector(false)
        toast.success('Tile added successfully')
        await loadCatalogs()
      } else {
        throw new Error('Failed to insert tile')
      }
    } catch (err) {
      console.error('Error adding tile:', err)
      toast.error('Failed to add tile to database')
    }
  }

  const handleHomeUpload = async (file: File, url: string) => {
    try {
      const res = await secureFetch('/api/homes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: url,
          name: file.name || 'Untitled Home',
        }),
      })
      const data = await res.json()
      if (data.success && data.home) {
        setSelectedHome({
          id: data.home.id,
          name: data.home.name,
          image_url: data.home.image_url
        })
        setShowHomeSelector(false)
        toast.success('Home added successfully')
        await loadCatalogs()
      } else {
        throw new Error('Failed to insert home')
      }
    } catch (err) {
      console.error('Error adding home:', err)
      toast.error('Failed to add home to database')
    }
  }

  const handleSelectTile = useCallback((tile: Tile) => {
    setSelectedTile(tile)
    setShowTileSelector(false)
  }, [])

  const handleSelectHome = useCallback((home: Home) => {
    setSelectedHome(home)
    setShowHomeSelector(false)
  }, [])

  const handleGenerate = () => {
    if (!selectedTile || !selectedHome) {
      toast.error('Please select both a tile and a home image')
      return
    }

    sessionStorage.setItem('selectedTile', JSON.stringify(selectedTile))
    sessionStorage.setItem('selectedHome', JSON.stringify(selectedHome))

    router.push('/chat')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4">
          <BackButton />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Generate Visualization</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Upload a tile and a home image to generate AI-powered visualizations
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Select Tile</h2>
              {selectedTile ? (
                <div className="flex flex-col sm:flex-row gap-4 items-start p-4 border rounded-lg bg-gray-50">
                  <img src={selectedTile.image_url} alt="Tile preview" loading="eager" decoding="async" className="w-full sm:w-32 h-32 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-3">{selectedTile.name}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowTileSelector(true)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Change
                      </button>
                      <button
                        onClick={() => setSelectedTile(null)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <p className="text-gray-600 mb-4 text-center">Choose a tile image</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <UploadButton onUpload={handleTileUpload} label="Upload New" bucket="tiles" />
                    <button
                      onClick={() => setShowTileSelector(true)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      Select Existing
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Select Home</h2>
              {selectedHome ? (
                <div className="flex flex-col sm:flex-row gap-4 items-start p-4 border rounded-lg bg-gray-50">
                  <img src={selectedHome.image_url} alt="Home preview" loading="eager" decoding="async" className="w-full sm:w-32 h-32 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-3">{selectedHome.name}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowHomeSelector(true)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Change
                      </button>
                      <button
                        onClick={() => setSelectedHome(null)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <p className="text-gray-600 mb-4 text-center">Choose a home image</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <UploadButton onUpload={handleHomeUpload} label="Upload New" bucket="homes" />
                    <button
                      onClick={() => setShowHomeSelector(true)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      Select Existing
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                onClick={handleGenerate}
                disabled={!selectedTile || !selectedHome}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
              >
                <Sparkles className="w-5 h-5" />
                Generate Visualization
              </button>
              {(!selectedTile || !selectedHome) && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Select both images to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showTileSelector && (
        <ImageSelector
          items={tiles}
          onSelect={handleSelectTile}
          title="Select a Tile"
        />
      )}

      {showHomeSelector && (
        <ImageSelector
          items={homes}
          onSelect={handleSelectHome}
          title="Select a Home"
        />
      )}
    </div>
  )
}
