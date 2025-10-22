'use client'

export interface MockUser {
  id: string
  email: string
}

export interface MockTile {
  id: string
  name: string
  imageUrl: string
  createdAt: Date
}

export interface MockHome {
  id: string
  imageUrl: string
  createdAt: Date
}

export interface MockGeneratedMessage {
  id: string
  tileId: string | null
  homeId: string | null
  prompt: string
  imageUrl: string
  saved: boolean
  createdAt: Date
}

class MockStore {
  private mockTiles: MockTile[] = []
  private mockHomes: MockHome[] = []
  private mockGeneratedMessages: MockGeneratedMessage[] = []
  private selectedTileId: string | null = null
  private selectedHomeId: string | null = null

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    this.mockTiles = [
      {
        id: '1',
        name: 'Marble White',
        imageUrl: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=400',
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Black Slate',
        imageUrl: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=400',
        createdAt: new Date('2024-01-16')
      },
      {
        id: '3',
        name: 'Terracotta',
        imageUrl: 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=400',
        createdAt: new Date('2024-01-17')
      },
      {
        id: '4',
        name: 'Blue Ceramic',
        imageUrl: 'https://images.pexels.com/photos/1358900/pexels-photo-1358900.jpeg?auto=compress&cs=tinysrgb&w=400',
        createdAt: new Date('2024-01-18')
      }
    ]

    this.mockHomes = [
      {
        id: 'h1',
        imageUrl: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
        createdAt: new Date('2024-01-20')
      },
      {
        id: 'h2',
        imageUrl: 'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=400',
        createdAt: new Date('2024-01-21')
      }
    ]

    this.mockGeneratedMessages = []
  }


  getTiles(): MockTile[] {
    return this.mockTiles
  }

  getTileById(id: string): MockTile | undefined {
    return this.mockTiles.find(t => t.id === id)
  }

  addTile(name: string, imageUrl: string): MockTile {
    const newTile: MockTile = {
      id: `tile-${Date.now()}`,
      name,
      imageUrl,
      createdAt: new Date()
    }
    this.mockTiles.push(newTile)
    return newTile
  }

  getHomes(): MockHome[] {
    return this.mockHomes.slice(-10)
  }

  addHome(imageUrl: string): MockHome {
    const newHome: MockHome = {
      id: `home-${Date.now()}`,
      imageUrl,
      createdAt: new Date()
    }
    this.mockHomes.push(newHome)
    if (this.mockHomes.length > 10) {
      this.mockHomes.shift()
    }
    return newHome
  }

  getGeneratedMessages(): MockGeneratedMessage[] {
    return this.mockGeneratedMessages
  }

  getSavedGeneratedForTile(tileId: string): MockGeneratedMessage[] {
    return this.mockGeneratedMessages.filter(m => m.tileId === tileId && m.saved)
  }

  async generateImage(tileId: string | null, homeId: string | null, prompt: string): Promise<MockGeneratedMessage> {
    const { generateImage: apiGenerateImage } = await import('./api')

    const tile = tileId ? this.getTileById(tileId) : null
    const home = homeId ? this.mockHomes.find(h => h.id === homeId) : null

    const tileUrl = tile?.imageUrl || ''
    const homeUrl = home?.imageUrl || ''

    console.log('Generating image with URLs:', { tileUrl, homeUrl, prompt })

    try {
      const result = await apiGenerateImage(tileUrl, homeUrl, prompt)

      if (result.success) {
        const newMessage: MockGeneratedMessage = {
          id: `gen-${Date.now()}`,
          tileId,
          homeId,
          prompt,
          imageUrl: result.image_url,
          saved: false,
          createdAt: new Date()
        }

        this.mockGeneratedMessages.push(newMessage)
        return newMessage
      } else {
        throw new Error(result.error || 'Image generation failed')
      }
    } catch (error) {
      console.error('Backend error:', error)
      throw error
    }
  }

  saveGenerated(id: string): void {
    const message = this.mockGeneratedMessages.find(m => m.id === id)
    if (message) {
      message.saved = true
    }
  }

  deleteGenerated(id: string): void {
    this.mockGeneratedMessages = this.mockGeneratedMessages.filter(m => m.id !== id)
  }

  setSelectedTile(tileId: string | null): void {
    this.selectedTileId = tileId
  }

  getSelectedTile(): string | null {
    return this.selectedTileId
  }

  setSelectedHome(homeId: string | null): void {
    this.selectedHomeId = homeId
  }

  getSelectedHome(): string | null {
    return this.selectedHomeId
  }
}

export const mockStore = new MockStore()
