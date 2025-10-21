export const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function uploadImage(file: File, bucket: string) {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch(`${API_URL}/api/upload/${bucket}`, {
    method: "POST",
    body: formData,
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || "Upload failed")
  return data.url
}

export async function listImages(bucket: string) {
  const res = await fetch(`${API_URL}/api/list/${bucket}`)
  const data = await res.json()
  return data.files || []
}

export async function generateImage(tileUrl: string, homeUrl: string, prompt: string) {
  const res = await fetch(`${API_URL}/generate`, {
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
