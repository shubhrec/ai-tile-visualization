'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageIcon, Home, Sparkles } from 'lucide-react'

interface GenerateBarProps {
  onGenerate: (prompt: string) => void
  isGenerating: boolean
  hasPreselectedTile?: boolean
  onSelectionsChange?: () => void
}

export default function GenerateBar({ onGenerate, isGenerating, hasPreselectedTile = false, onSelectionsChange }: GenerateBarProps) {
  const [prompt, setPrompt] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt)
      setPrompt('')
    }
  }

  const handleTileClick = () => {
    router.push('/select/tile')
  }

  const handleHomeClick = () => {
    router.push('/select/home')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg safe-area-bottom">
      <div className="max-w-4xl mx-auto p-3 sm:p-4">
        <div className="flex flex-wrap gap-2 mb-2 sm:mb-3">
          {!hasPreselectedTile && (
            <button
              onClick={handleTileClick}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="whitespace-nowrap">Add Tile</span>
            </button>
          )}
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
          >
            <Home className="w-4 h-4" />
            <span className="whitespace-nowrap">Add Home</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe visualization..."
            disabled={isGenerating}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Generate'}</span>
            <span className="sm:hidden">{isGenerating ? '...' : 'Go'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}
