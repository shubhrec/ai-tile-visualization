'use client'

import { useState } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import useSWR from 'swr'
import { swrFetcher, swrConfig } from '@/lib/swr-fetcher'
import OptimizedImage from './OptimizedImage'

interface Tile {
  id: string
  name: string
  image_url: string
}

interface ContinueModalProps {
  isOpen: boolean
  baseImageUrl: string
  onClose: () => void
  onGenerate: (tileUrl: string, prompt: string) => void
  isGenerating: boolean
}

export default function ContinueModal({
  isOpen,
  baseImageUrl,
  onClose,
  onGenerate,
  isGenerating
}: ContinueModalProps) {
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
  const [prompt, setPrompt] = useState('')
  const [uploadingTile, setUploadingTile] = useState(false)

  const { data: tilesData } = useSWR('/api/tiles', swrFetcher, swrConfig)
  const tiles = tilesData?.tiles || []

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingTile(true)
    try {
      const token = localStorage.getItem('auth_token')
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload/tiles', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (!uploadRes.ok) throw new Error('Upload failed')
      const uploadData = await uploadRes.json()

      const tileRes = await fetch('/api/tiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `Uploaded ${Date.now()}`,
          image_url: uploadData.url,
          size: '12x12',
          price_per_sqft: 0,
          in_catalog: false
        })
      })

      if (!tileRes.ok) throw new Error('Failed to create tile')
      const tileData = await tileRes.json()

      setSelectedTile(tileData.tile)
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploadingTile(false)
    }
  }

  const handleGenerate = () => {
    if (!selectedTile) return
    onGenerate(selectedTile.image_url, prompt)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Continue on this image</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Image
            </label>
            <img
              src={baseImageUrl}
              alt="Base image"
              className="w-full h-48 object-cover rounded-lg border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a New Tile
            </label>

            <div className="mb-4">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <Upload className="w-4 h-4" />
                {uploadingTile ? 'Uploading...' : 'Upload New Tile'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingTile}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {tiles.map((tile: Tile) => (
                <div
                  key={tile.id}
                  onClick={() => setSelectedTile(tile)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition ${
                    selectedTile?.id === tile.id
                      ? 'border-blue-600 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-400'
                  }`}
                >
                  <OptimizedImage
                    src={tile.image_url}
                    alt={tile.name}
                    className="w-full h-24 object-cover"
                  />
                  <div className="p-2 text-xs font-medium text-gray-700 truncate">
                    {tile.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt (Optional)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., apply on wall, use for backsplash..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!selectedTile || isGenerating}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Continuation'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
