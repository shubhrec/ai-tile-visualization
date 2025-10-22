'use client'

import { useState } from 'react'

interface ImageGridProps {
  items: Array<{
    id: string
    name?: string
    imageUrl: string
  }>
  onItemClick: (id: string) => void
}

export default function ImageGrid({ items, onItemClick }: ImageGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => new Set(prev).add(id))
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
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
      ))}
    </div>
  )
}
