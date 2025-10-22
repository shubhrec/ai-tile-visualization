export const API_URL = process.env.NEXT_PUBLIC_API_URL

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

export async function secureFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }

  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })
}

export async function uploadImage(file: File, bucket: string) {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const res = await secureFetch(`/api/upload/${bucket}`, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`)
    }

    const data = await res.json()

    if (!data.success) {
      throw new Error(data.error || "Upload failed")
    }

    return data.url
  } catch (err) {
    console.error('Upload error:', err)
    throw err
  }
}

export async function listImages(bucket: string) {
  const res = await secureFetch(`/api/list/${bucket}`)
  const data = await res.json()
  return data.files || []
}

export async function generateImage(tileUrl: string, homeUrl: string, prompt: string) {
  const res = await secureFetch(`/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tile_url: tileUrl,
      home_url: homeUrl,
      prompt
    }),
  })
  const data = await res.json()
  return data
}
