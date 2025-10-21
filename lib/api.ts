export const API_URL = process.env.NEXT_PUBLIC_API_URL

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
