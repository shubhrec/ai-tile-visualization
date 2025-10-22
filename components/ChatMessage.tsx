'use client'

import { useState } from 'react'
import { MockGeneratedMessage } from '@/lib/mockStore'
import { Save, Trash2 } from 'lucide-react'

interface ChatMessageProps {
  message: MockGeneratedMessage
  onSave: (id: string) => void
  onDelete: (id: string) => void
  onView: (message: MockGeneratedMessage) => void
}

export default function ChatMessage({ message, onSave, onDelete, onView }: ChatMessageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div className="flex flex-col gap-2 p-3 sm:p-4 border rounded-lg bg-white">
      <button
        onClick={() => onView(message)}
        className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={message.imageUrl}
          alt="Generated visualization"
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
      </button>

      {message.prompt && (
        <p className="text-sm text-gray-600">{message.prompt}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onSave(message.id)}
          disabled={message.saved}
          className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-colors ${
            message.saved
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Save className="w-3 h-3 sm:w-4 sm:h-4" />
          {message.saved ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={() => onDelete(message.id)}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs sm:text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
        >
          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          Delete
        </button>
      </div>

      <p className="text-xs text-gray-400">
        {message.createdAt.toLocaleString()}
      </p>
    </div>
  )
}
