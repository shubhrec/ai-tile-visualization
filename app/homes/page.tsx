'use client'

import { useEffect, useState, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import { secureFetch } from '@/lib/api'
import { swrFetcher, swrConfig } from '@/lib/swr-fetcher'
import { useAuth } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import UploadButton from '@/components/UploadButton'
import Modal from '@/components/Modal'
import BackButton from '@/components/BackButton'
import { HomeGridSkeleton } from '@/components/SkeletonLoader'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

const HomeCard = memo(function HomeCard({
  home,
  editMode,
  onImageClick,
  onDelete
}: {
  home: { id: string; name: string; image_url: string }
  editMode: boolean
  onImageClick: () => void
  onDelete: () => void
}) {
  return (
    <div className="relative group border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <img
        src={home.image_url}
        alt={home.name}
        loading="lazy"
        decoding="async"
        className="w-full h-40 object-cover cursor-pointer"
        onClick={() => !editMode && onImageClick()}
      />
      <div className="p-2 text-center">
        <p className="text-xs sm:text-sm text-gray-700 truncate">{home.name || 'Home'}</p>
      </div>
      {editMode && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-md transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
})

interface Home {
  id: string
  name: string
  image_url: string
  created_at: string
}

export default function HomesPage() {
  useAuth()
  const router = useRouter()
  const { data, error, isLoading } = useSWR('/api/homes', swrFetcher, swrConfig)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  const homes = data?.homes || []

  useEffect(() => {
    if (error) {
      toast.error('Failed to load homes')
    }
  }, [error])

  const handleDelete = useCallback(async (homeId: string) => {
    const confirmDelete = window.confirm('Delete this home?')
    if (!confirmDelete) return

    try {
      const res = await secureFetch(`/api/homes/${homeId}`, { method: 'DELETE' })
      if (res.ok) {
        mutate('/api/homes')
        toast.success('Home deleted')
      } else {
        toast.error('Failed to delete home')
      }
    } catch (err) {
      console.error('Failed to delete home', err)
      toast.error('Failed to delete home')
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
        toast.success('Home uploaded successfully')
      } else {
        toast.error('Failed to save home')
      }
    } catch (err) {
      console.error('Failed to save home', err)
      toast.error('Failed to save home')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4">
          <BackButton />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Homes</h1>
          <div className="flex gap-2">
            {homes.length > 0 && (
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-3 py-2 rounded-md border text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {editMode ? 'Done' : 'Edit'}
              </button>
            )}
            <UploadButton onUpload={handleUpload} bucket="homes" />
          </div>
        </div>

        {isLoading ? (
          <HomeGridSkeleton count={10} />
        ) : homes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
            <p className="text-gray-500">No homes yet</p>
            <p className="text-sm text-gray-400 mt-2">Upload home images to visualize tiles in different settings</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {homes.map((home: Home) => (
              <HomeCard
                key={home.id}
                home={home}
                editMode={editMode}
                onImageClick={() => setSelectedImage(home.image_url)}
                onDelete={() => handleDelete(home.id)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
      />
    </div>
  )
}
