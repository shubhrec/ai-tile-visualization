export function ImageSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative bg-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"
           style={{ animation: 'shimmer 1.5s infinite' }} />
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}

export function TileGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <ImageSkeleton className="aspect-square" />
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export function HomeGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg overflow-hidden bg-white shadow-sm">
          <ImageSkeleton className="w-full h-40" />
          <div className="p-2">
            <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
