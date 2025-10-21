'use client'

import { useRef } from 'react'
import { Upload } from 'lucide-react'

interface UploadButtonProps {
  onUpload: (file: File, localUrl: string) => void
  label?: string
  variant?: 'primary' | 'secondary'
}

export default function UploadButton({ onUpload, label = 'Upload', variant = 'primary' }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const localUrl = URL.createObjectURL(file)
      onUpload(file, localUrl)
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
