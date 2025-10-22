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

  const [messages, setMessages] = useState<MockGeneratedMessage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedImage, setSelectedImage] = useState<MockGeneratedMessage | null>(null)
  const [selectedTile, setSelectedTile] = useState(tileIdFromUrl ? mockStore.getTileById(tileIdFromUrl) : null)
  const [selectedHome, setSelectedHome] = useState(mockStore.getSelectedHome() ? mockStore.getHomes().find(h => h.id === mockStore.getSelectedHome()) : null)

  useEffect(() => {

    if (tileIdFromUrl) {
      mockStore.setSelectedTile(tileIdFromUrl)
      setSelectedTile(mockStore.getTileById(tileIdFromUrl))
    }

    setMessages(mockStore.getGeneratedMessages())
  }, [router, tileIdFromUrl])

  useEffect(() => {
    const storedTileId = mockStore.getSelectedTile()
    const storedHomeId = mockStore.getSelectedHome()

    if (storedTileId) {
      setSelectedTile(mockStore.getTileById(storedTileId))
    }
    if (storedHomeId) {
      setSelectedHome(mockStore.getHomes().find(h => h.id === storedHomeId) || null)
    }
  }, [])

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true)

    const selectedTileId = tileIdFromUrl || mockStore.getSelectedTile()
    const selectedHomeId = mockStore.getSelectedHome()

    try {
      const newMessage = await mockStore.generateImage(selectedTileId, selectedHomeId, prompt)
      setMessages(mockStore.getGeneratedMessages())
      toast.success('Image generated successfully!')
    } catch (error) {
      console.error('Generation failed:', error)
      toast.error('Failed to generate image. Make sure the backend is running.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectionsChange = () => {
    const storedTileId = mockStore.getSelectedTile()
    const storedHomeId = mockStore.getSelectedHome()

    setSelectedTile(storedTileId ? mockStore.getTileById(storedTileId) : null)
    setSelectedHome(storedHomeId ? mockStore.getHomes().find(h => h.id === storedHomeId) || null : null)
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
                    src={selectedTile.imageUrl}
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
                    src={selectedHome.imageUrl}
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
