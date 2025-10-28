'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import { secureFetch } from '@/lib/api'
import { swrFetcher, swrConfig } from '@/lib/swr-fetcher'
import { useAuth } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import UploadButton from '@/components/UploadButton'
import BackButton from '@/components/BackButton'
import { HomeGridSkeleton } from '@/components/SkeletonLoader'
import { Camera, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Home {
  id: string
  name: string
  image_url: string
  created_at: string
}

export default function SelectHomePage() {
  useAuth()
  const router = useRouter()
  const { data, error, isLoading } = useSWR('/api/homes', swrFetcher, swrConfig)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const homes = data?.homes || []

  useEffect(() => {
    if (error) {
      toast.error('Failed to load homes')
    }
  }, [error])

  useEffect(() => {
    const savedHome = sessionStorage.getItem('selectedHome')
    if (savedHome) {
      try {
        const home = JSON.parse(savedHome)
        setSelectedId(home.id)
      } catch (err) {
        console.error('Failed to parse saved home', err)
      }
    }
  }, [])

  async function handleUpload(file: File, url: string) {
    try {
      const res = await secureFetch('/api/homes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: url, name: file.name }),
      })
      const data = await res.json()

      if (data.success && data.home) {
        mutate('/api/homes')
        setSelectedId(data.home.id)
        toast.success('Home added successfully')
      } else {
        toast.error('Failed to save home')
      }
    } catch (err) {
      console.error('Upload failed', err)
      toast.error('Upload failed')
    }
  }

  const handleConfirm = () => {
    const selectedHome = homes.find((h: Home) => h.id === selectedId)
    if (selectedHome) {
      sessionStorage.setItem('selectedHome', JSON.stringify(selectedHome))
      router.back()
    } else {
      toast.error('Please select a home before confirming')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Select Home Image</h1>

        <div className="flex gap-2 mb-4 sm:mb-6 flex-wrap">
          <button
            disabled
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-200 text-gray-400 cursor-not-allowed text-xs sm:text-sm"
          >
            <Camera className="w-4 h-4" />
            <span className="whitespace-nowrap">Camera (Phase 2)</span>
          </button>
          <UploadButton onUpload={handleUpload} label="Upload" variant="secondary" bucket="homes" />
        </div>

        {isLoading ? (
          <HomeGridSkeleton count={8} />
        ) : homes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
            <p className="text-gray-500">No home images yet</p>
            <p className="text-sm text-gray-400 mt-2">Upload home photos to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {homes.map((home: Home) => (
              <button
                key={home.id}
                onClick={() => setSelectedId(home.id)}
                className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity ${
                  selectedId === home.id ? 'ring-4 ring-blue-500' : ''
                }`}
              >
                <img
                  src={home.image_url}
                  alt={home.name || 'Home'}
                  loading="lazy"
                  decoding="async"
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
