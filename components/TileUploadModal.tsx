'use client'

import { useState } from 'react'
import { X, Upload as UploadIcon, Loader2 } from 'lucide-react'
import { uploadImage, secureFetch } from '@/lib/api'
import { toast } from 'sonner'

interface TileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function TileUploadModal({ isOpen, onClose, onSuccess }: TileUploadModalProps) {
  const [tileName, setTileName] = useState('')
  const [tileSize, setTileSize] = useState('')
  const [tilePrice, setTilePrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    setImageFile(file)
  }

  const handleUploadImage = async () => {
    if (!imageFile) {
      toast.error('Please select an image first')
      return
    }

    setIsUploading(true)
    try {
      const url = await uploadImage(imageFile, 'tiles')
      setImageUrl(url)
      toast.success('Image uploaded successfully')
    } catch (err) {
      console.error('Upload failed', err)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveTile = async () => {
    if (!tileName.trim()) {
      toast.error('Tile name is required')
      return
    }

    if (!imageUrl) {
      toast.error('Please upload an image first')
      return
    }

    setIsSaving(true)
    try {
      const payload: any = {
        name: tileName.trim(),
        image_url: imageUrl,
      }

      if (tileSize.trim()) {
        payload.size = tileSize.trim()
      }

      if (tilePrice.trim()) {
        const price = parseFloat(tilePrice)
        if (!isNaN(price) && price >= 0) {
          payload.price = price
        }
      }

      const res = await secureFetch('/api/tiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.tile) {
        toast.success('Tile saved successfully')
        setTileName('')
        setTileSize('')
        setTilePrice('')
        setImageUrl('')
        setImageFile(null)
        onSuccess()
        onClose()
      } else {
        throw new Error('Failed to save tile')
      }
    } catch (err) {
      console.error('Save failed', err)
      toast.error('Failed to save tile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving && !isUploading) {
      setTileName('')
      setTileSize('')
      setTilePrice('')
      setImageUrl('')
      setImageFile(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Upload New Tile</h2>
          <button
            onClick={handleClose}
            disabled={isSaving || isUploading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tile Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tileName}
              onChange={(e) => setTileName(e.target.value)}
              placeholder="e.g. Glossy White Tile"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving || isUploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tile Size
            </label>
            <input
              type="text"
              value={tileSize}
              onChange={(e) => setTileSize(e.target.value)}
              placeholder="e.g. 600x600 mm"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving || isUploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tile Price
            </label>
            <div className="relative">
              <input
                type="number"
                value={tilePrice}
                onChange={(e) => setTilePrice(e.target.value)}
                placeholder="e.g. 45.50"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving || isUploading}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tile Image <span className="text-red-500">*</span>
            </label>
            {imageUrl ? (
              <div className="space-y-3">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg border"
                />
                <button
                  onClick={() => {
                    setImageUrl('')
                    setImageFile(null)
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                  disabled={isSaving}
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isUploading || isSaving}
                />
                {imageFile && (
                  <button
                    onClick={handleUploadImage}
                    disabled={isUploading || isSaving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="w-4 h-4" />
                        Upload Image
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t">
          <button
            onClick={handleClose}
            disabled={isSaving || isUploading}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveTile}
            disabled={isSaving || isUploading || !tileName.trim() || !imageUrl}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Tile'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
