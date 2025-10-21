'use client'

import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  title?: string
}

export default function Modal({ isOpen, onClose, imageUrl, title }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70" onClick={onClose}>
      <div className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {title && (
          <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 pr-8">{title}</h2>
          </div>
        )}

        <div className="p-4 sm:p-6">
          <img
            src={imageUrl}
            alt={title || 'Preview'}
            className="w-full h-auto rounded-lg max-h-[70vh] object-contain"
          />
        </div>
      </div>
    </div>
  )
}
