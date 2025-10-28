import { secureFetch } from './api'

export async function swrFetcher(url: string) {
  const response = await secureFetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch')
  }
  return response.json()
}

export const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 120000,
}
