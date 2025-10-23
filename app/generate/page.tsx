'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import BackButton from '@/components/BackButton'
import UploadButton from '@/components/UploadButton'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function GeneratePage() {
  useAuth()
  const router = useRouter()
  const [tileUrl, setTileUrl] = useState('')
  const [homeUrl, setHomeUrl] = useState('')
  const [tileName, setTileName] = useState('')
  const [homeName, setHomeName] = useState('')

  const handleTileUpload = (file: File, url: string) => {
    setTileUrl(url)
    setTileName(file.name)
  }

  const handleHomeUpload = (file: File, url: string) => {
    setHomeUrl(url)
    setHomeName(file.name)
  }

  const handleGenerate = () => {
    if (!tileUrl || !homeUrl) {
      toast.error('Please upload both a tile and a home image')
      return
    }

    sessionStorage.setItem('selectedTile', JSON.stringify({
      id: 'temp',
      name: tileName || 'Uploaded Tile',
      image_url: tileUrl
    }))
    sessionStorage.setItem('selectedHome', JSON.stringify({
      id: 'temp',
      name: homeName || 'Uploaded Home',
      image_url: homeUrl
    }))

    router.push('/chat')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4">
          <BackButton />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Generate Visualization</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Upload a tile and a home image to generate AI-powered visualizations
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Upload Tile Image</h2>
              {tileUrl ? (
                <div className="flex flex-col sm:flex-row gap-4 items-start p-4 border rounded-lg bg-gray-50">
                  <img src={tileUrl} alt="Tile preview" className="w-full sm:w-32 h-32 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-3">{tileName}</p>
                    <div className="flex gap-2">
                      <UploadButton onUpload={handleTileUpload} label="Replace" bucket="tiles" />
                      <button
                        onClick={() => {
                          setTileUrl('')
                          setTileName('')
                        }}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">Upload a tile image</p>
                  <UploadButton onUpload={handleTileUpload} label="Upload Tile" bucket="tiles" />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Upload Home Image</h2>
              {homeUrl ? (
                <div className="flex flex-col sm:flex-row gap-4 items-start p-4 border rounded-lg bg-gray-50">
                  <img src={homeUrl} alt="Home preview" className="w-full sm:w-32 h-32 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-3">{homeName}</p>
                    <div className="flex gap-2">
                      <UploadButton onUpload={handleHomeUpload} label="Replace" bucket="homes" />
                      <button
                        onClick={() => {
                          setHomeUrl('')
                          setHomeName('')
                        }}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">Upload a home image</p>
                  <UploadButton onUpload={handleHomeUpload} label="Upload Home" bucket="homes" />
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                onClick={handleGenerate}
                disabled={!tileUrl || !homeUrl}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
              >
                <Sparkles className="w-5 h-5" />
                Generate Visualization
              </button>
              {(!tileUrl || !homeUrl) && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Upload both images to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
