'use client'

import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function uploadImageToSupabase(file: File, bucket: string) {
  const fileName = `${Date.now()}_${file.name}`
  const { error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true })
  if (error) throw error
  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return publicData.publicUrl
}

interface UploadButtonProps {
  onUpload: (file: File, supabaseUrl: string) => void
  label?: string
  variant?: 'primary' | 'secondary'
  bucket?: 'tiles' | 'homes'
}

export default function UploadButton({ onUpload, label = 'Upload', variant = 'primary', bucket = 'tiles' }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      try {
        const publicUrl = await uploadImageToSupabase(file, bucket)
        onUpload(file, publicUrl)
      } catch (err) {
        console.error('Upload failed', err)
        alert('Upload failed — check your Supabase keys or bucket name.')
      }
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
        onClick={() => inputRef.current?.click()}
        className={`${baseClasses} ${variantClasses}`}
      >
        <Upload className="w-4 h-4" />
        {label}
      </button>
    </>
  )
}
