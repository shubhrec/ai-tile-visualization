'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { secureFetch } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import UploadButton from '@/components/UploadButton'
import Modal from '@/components/Modal'
import BackButton from '@/components/BackButton'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

interface Home {
  id: string
  name: string
  image_url: string
  created_at: string
}

export default function HomesPage() {
  useAuth()
  const router = useRouter()
  const [homes, setHomes] = useState<Home[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    loadHomes()
  }, [])

  async function loadHomes() {
    try {
      const res = await secureFetch('/api/homes')
      const data = await res.json()
      setHomes(data.homes || [])
    } catch (err) {
      console.error('Failed to fetch homes', err)
      toast.error('Failed to load homes')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(homeId: string) {
    const confirmDelete = window.confirm('Delete this home?')
    if (!confirmDelete) return

    try {
      const res = await secureFetch(`/api/homes/${homeId}`, { method: 'DELETE' })
      if (res.ok) {
        setHomes(prev => prev.filter(h => h.id !== homeId))
        toast.success('Home deleted')
      } else {
        toast.error('Failed to delete home')
      }
    } catch (err) {
      console.error('Failed to delete home', err)
      toast.error('Failed to delete home')
    }
  }

  async function handleUpload(file: File, url: string) {
    try {
      const res = await secureFetch('/api/homes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: url, name: file.name }),
      })
      const data = await res.json()

      if (data.success && data.home) {
        setHomes(prev => [data.home, ...prev])
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
          <UploadButton onUpload={handleUpload} bucket="homes" />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : homes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
            <p className="text-gray-500">No homes yet</p>
            <p className="text-sm text-gray-400 mt-2">Upload home images to visualize tiles in different settings</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {homes.map(home => (
              <div key={home.id} className="relative group border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={home.image_url}
                  alt={home.name}
                  className="w-full h-40 object-cover cursor-pointer"
                  onClick={() => setSelectedImage(home.image_url)}
                />
                <div className="p-2 text-center">
                  <p className="text-xs sm:text-sm text-gray-700 truncate">{home.name || 'Home'}</p>
                </div>
                <button
                  onClick={() => handleDelete(home.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Delete home"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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
