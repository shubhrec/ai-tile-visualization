'use client'

import { memo } from 'react'

interface TileCardProps {
  id: string
  name: string
  image_url: string
  add_catalog?: boolean
  onClick: (id: string) => void
}

const TileCard = memo(function TileCard({
  id,
  name,
  image_url,
  add_catalog = true,
  onClick
}: TileCardProps) {
  return (
    <div
      className="relative group cursor-pointer"
      onClick={() => onClick(id)}
    >
      <div className={`relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow ${
        add_catalog === false ? 'opacity-50' : ''
      }`}>
        <img
          src={image_url}
          alt={name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          style={add_catalog === false ? { filter: 'blur(4px)' } : {}}
        />
        {add_catalog === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white px-4 py-2 rounded-lg font-semibold text-sm">
              Add Details
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 text-sm font-medium text-gray-700 truncate">
        {name || 'Untitled'}
      </div>
    </div>
  )
})

export default TileCard
