'use client'

import { memo } from 'react'

interface GeneratedImageCardProps {
  id: string
  image_url: string
  prompt: string
  kept: boolean
  tile_id?: string
  onImageClick: () => void
  onKeep: () => void
  onDelete: () => void
  onAddReference: () => void
  canAddReference: boolean
}

const GeneratedImageCard = memo(function GeneratedImageCard({
  id,
  image_url,
  prompt,
  kept,
  tile_id,
  onImageClick,
  onKeep,
  onDelete,
  onAddReference,
  canAddReference
}: GeneratedImageCardProps) {
  return (
    <div className="mb-5">
      <div className="bg-white rounded-2xl overflow-hidden shadow-md">
        <img
          src={image_url}
          alt={prompt || 'Generated image'}
          loading="lazy"
          decoding="async"
          className="w-full h-96 object-cover cursor-pointer hover:opacity-90 transition"
          onClick={onImageClick}
        />
        <div className="flex justify-center gap-3 p-3">
          {kept ? (
            <span className="inline-block px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full border border-green-200">
              Saved to Gallery
            </span>
          ) : (
            <button
              onClick={onKeep}
              className="px-3 py-1 text-sm rounded-md border hover:bg-green-50 text-green-600 border-green-200 transition"
            >
              Keep
            </button>
          )}

          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm rounded-md border hover:bg-red-50 text-red-600 border-red-200 transition"
          >
            Delete
          </button>

          <button
            onClick={onAddReference}
            disabled={!canAddReference || !!tile_id}
            className={`px-3 py-1 text-sm rounded-md border transition disabled:opacity-50 disabled:cursor-not-allowed ${
              tile_id
                ? 'bg-blue-100 text-blue-600 border-blue-200'
                : 'hover:bg-blue-50 text-blue-600 border-blue-200'
            }`}
          >
            {tile_id ? 'Added to Tile' : '+ Add Reference'}
          </button>
        </div>
      </div>
    </div>
  )
})

export default GeneratedImageCard
