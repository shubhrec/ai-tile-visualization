'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

interface ImageGridProps {
  items: Array<{
    id: string
    name?: string
    imageUrl: string
  }>
  onItemClick: (id: string) => void
  onDelete?: (id: string) => void
  showDelete?: boolean
  editMode?: boolean
}

export default function ImageGrid({ items, onItemClick, onDelete, showDelete = false, editMode = false }: ImageGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => new Set(prev).add(id))
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => (
        <div key={item.id} className="relative group">
          <button
            onClick={() => !editMode && onItemClick(item.id)}
            className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
          >
            {!loadedImages.has(item.id) && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <img
              src={item.imageUrl}
              alt={item.name || 'Image'}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                loadedImages.has(item.id) ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => handleImageLoad(item.id)}
              loading="lazy"
            />
            {item.name && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-3">
                <p className="text-white text-xs sm:text-sm font-medium truncate">{item.name}</p>
              </div>
            )}
          </button>
          {showDelete && onDelete && editMode && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item.id)
              }}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 shadow-md transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
