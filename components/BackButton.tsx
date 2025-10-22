'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors text-gray-700 text-sm font-medium"
      onClick={() => router.back()}
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  )
}
