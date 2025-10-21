'use client'

interface ImageGridProps {
  items: Array<{
    id: string
    name?: string
    localPreviewUrl: string
  }>
  onItemClick: (id: string) => void
}

export default function ImageGrid({ items, onItemClick }: ImageGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
        >
          <img
            src={item.localPreviewUrl}
            alt={item.name || 'Image'}
            className="w-full h-full object-cover"
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
