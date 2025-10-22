'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { mockStore, MockGeneratedMessage } from '@/lib/mockStore'
import { useAuth } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import ChatMessage from '@/components/ChatMessage'
import GenerateBar from '@/components/GenerateBar'
import Modal from '@/components/Modal'
import BackButton from '@/components/BackButton'
import { toast } from 'sonner'

export default function ChatPage() {
  useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tileIdFromUrl = searchParams.get('tileId')

  interface Tile {
    id: string
    name: string
    image_url: string
  }

  interface Home {
    id: string
    name: string
    image_url: string
    created_at: string
  }

  const [messages, setMessages] = useState<MockGeneratedMessage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedImage, setSelectedImage] = useState<MockGeneratedMessage | null>(null)
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
  const [selectedHome, setSelectedHome] = useState<Home | null>(null)
  const [homes, setHomes] = useState<Home[]>([])

  useEffect(() => {
    async function loadData() {
      const stored = sessionStorage.getItem('selectedTile')
      if (stored) {
        try {
          const tile = JSON.parse(stored)
          setSelectedTile(tile)
        } catch (err) {
          console.error('Failed to parse selectedTile from sessionStorage', err)
        }
      }

      try {
        const { secureFetch } = await import('@/lib/api')
        const res = await secureFetch('/api/homes')
        const data = await res.json()
        setHomes(data.homes || [])

        const storedHomeId = mockStore.getSelectedHome()
        if (storedHomeId && data.homes) {
          const home = data.homes.find((h: Home) => h.id === storedHomeId)
          setSelectedHome(home || null)
        }
      } catch (err) {
        console.error('Failed to load homes', err)
      }

      setMessages(mockStore.getGeneratedMessages())
    }
    loadData()
  }, [tileIdFromUrl])

  const handleGenerate = async (prompt: string) => {
    if (!selectedTile || !selectedTile.id || !selectedTile.image_url) {
      toast.error('Missing tile information')
      return
    }

    if (!selectedHome || !selectedHome.id || !selectedHome.image_url) {
      toast.error('Please select or upload a home image first')
      return
    }

    setIsGenerating(true)

    try {
      const newMessage = await mockStore.generateImage(
        selectedTile.id,
        selectedTile.image_url,
        selectedHome.id,
        selectedHome.image_url,
        prompt
      )
      setMessages(mockStore.getGeneratedMessages())
      toast.success('Image generated successfully!')
    } catch (error) {
      console.error('Generation failed:', error)
      toast.error('Failed to generate image. Make sure the backend is running.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectionsChange = async () => {
    const stored = sessionStorage.getItem('selectedTile')
    if (stored) {
      try {
        const tile = JSON.parse(stored)
        setSelectedTile(tile)
      } catch (err) {
        console.error('Failed to parse selectedTile from sessionStorage', err)
      }
    }

    const storedHomeId = mockStore.getSelectedHome()
    if (storedHomeId && homes.length > 0) {
      const home = homes.find(h => h.id === storedHomeId)
      setSelectedHome(home || null)
    }
  }

  const handleSave = (id: string) => {
    mockStore.saveGenerated(id)
    setMessages([...mockStore.getGeneratedMessages()])
  }

  const handleDelete = (id: string) => {
    mockStore.deleteGenerated(id)
    setMessages(mockStore.getGeneratedMessages())
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-48 sm:pb-56">
      <Navbar />

      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Generate Visualizations</h1>

        {(selectedTile || selectedHome) && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-lg border">
            <h2 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Selected Images</h2>
            <div className="flex gap-3 sm:gap-4">
              {selectedTile && (
                <div className="flex flex-col items-center gap-1 sm:gap-2">
                  <img
                    src={selectedTile.image_url}
                    alt={selectedTile.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-blue-500"
                  />
                  <p className="text-xs font-medium text-gray-700 text-center max-w-[80px] sm:max-w-full truncate">{selectedTile.name}</p>
                  <p className="text-xs text-gray-500">Tile</p>
                </div>
              )}
              {selectedHome && (
                <div className="flex flex-col items-center gap-1 sm:gap-2">
                  <img
                    src={selectedHome.image_url}
                    alt="Home"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-green-500"
                  />
                  <p className="text-xs text-gray-500">Home</p>
                </div>
              )}
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
            <p className="text-gray-500">No generated images yet</p>
            <p className="text-sm text-gray-400 mt-2">Add tile and home images, then describe your visualization</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSave={handleSave}
                onDelete={handleDelete}
                onView={setSelectedImage}
              />
            ))}
          </div>
        )}

        {isGenerating && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
              <div className="mb-4 flex justify-center">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-lg animate-pulse"></div>
                  <div className="absolute inset-0 border-4 border-t-blue-600 border-r-blue-600 rounded-lg animate-spin"></div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Visualizing your design</h3>
              <p className="text-sm text-gray-600">Please wait while we generate your image...</p>
            </div>
          </div>
        )}
      </div>

      <GenerateBar
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        hasPreselectedTile={!!tileIdFromUrl}
        onSelectionsChange={handleSelectionsChange}
      />

      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.imageUrl || ''}
        title={selectedImage?.prompt}
      />
    </div>
  )
}
