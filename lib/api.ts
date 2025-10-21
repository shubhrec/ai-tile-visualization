import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function uploadImageToSupabase(file: File, folder: string) {
  const fileName = `${Date.now()}_${file.name}`
  const { data, error } = await supabase.storage
    .from(folder)
    .upload(fileName, file, { upsert: true })
  if (error) throw error
  const { data: publicData } = supabase.storage.from(folder).getPublicUrl(fileName)
  return publicData.publicUrl
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
