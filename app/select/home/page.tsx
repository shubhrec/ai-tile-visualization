'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { mockStore, MockHome } from '@/lib/mockStore'
import Navbar from '@/components/Navbar'
import UploadButton from '@/components/UploadButton'
import { Camera, Check } from 'lucide-react'

export default function SelectHomePage() {
  const router = useRouter()
  const [homes, setHomes] = useState<MockHome[]>(mockStore.getHomes())
  const [selectedId, setSelectedId] = useState<string | null>(mockStore.getSelectedHome())

  useEffect(() => {
    if (!mockStore.isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  const handleUpload = (file: File, localUrl: string) => {
    const newHome = mockStore.addHome(localUrl)
    setHomes(mockStore.getHomes())
    setSelectedId(newHome.id)
  }

  const handleConfirm = () => {
    if (selectedId) {
      mockStore.setSelectedHome(selectedId)
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Select Home Image</h1>

        <div className="flex gap-2 mb-4 sm:mb-6 flex-wrap">
          <button
            disabled
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-200 text-gray-400 cursor-not-allowed text-xs sm:text-sm"
          >
            <Camera className="w-4 h-4" />
            <span className="whitespace-nowrap">Camera (Phase 2)</span>
          </button>
          <UploadButton onUpload={handleUpload} label="Upload" variant="secondary" />
        </div>

        {homes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
            <p className="text-gray-500">No home images yet</p>
            <p className="text-sm text-gray-400 mt-2">Upload home photos to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {homes.map((home) => (
              <button
                key={home.id}
                onClick={() => setSelectedId(home.id)}
                className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity ${
                  selectedId === home.id ? 'ring-4 ring-blue-500' : ''
                }`}
              >
                <img
                  src={home.localPreviewUrl}
                  alt="Home"
                  className="w-full h-full object-cover"
                />
                {selectedId === home.id && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded-full">
                    <Check className="w-5 h-5" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="fixed bottom-6 sm:bottom-8 left-0 right-0 flex justify-center px-3">
          <button
            onClick={handleConfirm}
            disabled={!selectedId}
            className="w-full max-w-xs sm:max-w-sm px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium shadow-lg text-sm sm:text-base"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  )
}
