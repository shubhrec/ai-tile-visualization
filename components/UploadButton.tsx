'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { uploadImage } from '@/lib/api'
import { toast } from 'sonner'

interface UploadButtonProps {
  onUpload: (file: File, url: string) => void | Promise<void>
  label?: string
  variant?: 'primary' | 'secondary'
  bucket?: 'tiles' | 'homes'
}

export default function UploadButton({ onUpload, label = 'Upload', variant = 'primary', bucket = 'tiles' }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    if (isUploading) {
      toast.info('Upload already in progress')
      return
    }

    setIsUploading(true)
    const toastId = `upload-${Date.now()}`
    toast.loading('Uploading image...', { id: toastId })

    try {
      const url = await uploadImage(file, bucket)
      toast.success('Image uploaded successfully!', { id: toastId })
      await onUpload(file, url)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } catch (err) {
      console.error('Upload failed', err)
      toast.error('Upload failed. Please try again.', { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }

  const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
  const variantClasses = variant === 'primary'
    ? "bg-blue-600 text-white hover:bg-blue-700"
    : "bg-gray-100 text-gray-700 hover:bg-gray-200"

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`${baseClasses} ${variantClasses} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {isUploading ? 'Uploading...' : label}
      </button>
    </>
  )
}
