'use client'

export interface MockUser {
  id: string
  email: string
}

export interface MockTile {
  id: string
  name: string
  localPreviewUrl: string
  createdAt: Date
}

export interface MockHome {
  id: string
  localPreviewUrl: string
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
  private currentUser: MockUser | null = null
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
        localPreviewUrl: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=400',
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Black Slate',
        localPreviewUrl: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=400',
        createdAt: new Date('2024-01-16')
      },
      {
        id: '3',
        name: 'Terracotta',
        localPreviewUrl: 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=400',
        createdAt: new Date('2024-01-17')
      },
      {
        id: '4',
        name: 'Blue Ceramic',
        localPreviewUrl: 'https://images.pexels.com/photos/1358900/pexels-photo-1358900.jpeg?auto=compress&cs=tinysrgb&w=400',
        createdAt: new Date('2024-01-18')
      }
    ]

    this.mockHomes = [
      {
        id: 'h1',
        localPreviewUrl: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
        createdAt: new Date('2024-01-20')
      },
      {
        id: 'h2',
        localPreviewUrl: 'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=400',
        createdAt: new Date('2024-01-21')
      }
    ]

    this.mockGeneratedMessages = []
  }

  login(email: string, password: string): boolean {
    if (email && password) {
      this.currentUser = { id: 'mock-user-1', email }
      return true
    }
    return false
  }

  logout() {
    this.currentUser = null
  }

  getCurrentUser(): MockUser | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  getTiles(): MockTile[] {
    return this.mockTiles
  }

  getTileById(id: string): MockTile | undefined {
    return this.mockTiles.find(t => t.id === id)
  }

  addTile(name: string, localPreviewUrl: string): MockTile {
    const newTile: MockTile = {
      id: `tile-${Date.now()}`,
      name,
      localPreviewUrl,
      createdAt: new Date()
    }
    this.mockTiles.push(newTile)
    return newTile
  }

  getHomes(): MockHome[] {
    return this.mockHomes.slice(-10)
  }

  addHome(localPreviewUrl: string): MockHome {
    const newHome: MockHome = {
      id: `home-${Date.now()}`,
      localPreviewUrl,
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
    await new Promise(resolve => setTimeout(resolve, 2000))

    const mockImageUrls = [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=600'
    ]

    const newMessage: MockGeneratedMessage = {
      id: `gen-${Date.now()}`,
      tileId,
      homeId,
      prompt,
      imageUrl: mockImageUrls[Math.floor(Math.random() * mockImageUrls.length)],
      saved: false,
      createdAt: new Date()
    }

    this.mockGeneratedMessages.push(newMessage)
    return newMessage
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
