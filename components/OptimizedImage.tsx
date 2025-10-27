'use client'

import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  onClick?: () => void
  aspectRatio?: string
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  onClick,
  aspectRatio = 'aspect-square'
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={`relative ${aspectRatio} ${className} bg-gray-200`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />
      )}

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-400 text-sm">Failed to load</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          onClick={onClick}
        />
      )}
    </div>
  )
}
