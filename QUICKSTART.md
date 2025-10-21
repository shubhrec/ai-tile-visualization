# AI Tile Visualization Tool - Quick Start Guide

## Phase 1 - Mock Frontend Only

This is a complete, runnable Next.js application with mock data and no backend dependencies.

## Installation & Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Workflow

### 1. Login
- Navigate to http://localhost:3000
- Enter any email and password
- Click "Sign In"

### 2. Explore Catalog
- View pre-loaded mock tiles (4 sample tiles)
- Click "Upload Tile" to add a new tile
- Click any tile to view its reference page

### 3. Generate Visualizations
- From a tile's reference page, click "Generate Visualizations"
- Or navigate directly to /chat
- Click "Add Tile Image" to select a tile
- Click "Add Home Image" to select/upload a home photo
- Enter a prompt (e.g., "Modern kitchen with white subway tiles")
- Click "Generate"
- Wait 2 seconds for mock generation

### 4. Save & Manage
- Click "Save" on any generated image
- Saved images appear in the tile's gallery
- Click "Delete" to remove from chat history
- Click "View" to preview full-size

### 5. Gallery
- Return to any tile's reference page
- View all saved visualizations in the gallery
- Click "View" on any saved image for full preview

## Features in Phase 1

✅ Mock authentication (any credentials work)  
✅ Tile catalog with upload  
✅ Home image uploads (keeps last 10)  
✅ Mock AI generation (2s delay)  
✅ Save/delete generated images  
✅ Tile-specific galleries  
✅ Image preview modals  
✅ Responsive design (mobile to desktop)  
✅ Clean, modern UI with Tailwind  

## Limitations in Phase 1

❌ No data persistence (refresh clears state)  
❌ No real authentication  
❌ No actual AI generation  
❌ No backend API  
❌ Camera functionality disabled  
❌ No Supabase integration  

## Technologies Used

- **Next.js 13** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Hooks** (useState, useEffect)
- **Lucide React** (icons)
- **Pexels** (stock images for mocks)

## Project Commands

```bash
# Development
npm run dev          # Start dev server on port 3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Quality
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

## File Structure Highlights

```
app/
├── login/           Mock authentication
├── catalog/         Tile grid and upload
├── reference/       Tile details & gallery
├── chat/            Generation interface
└── select/          Tile & home selection

components/
├── Navbar.tsx       App header
├── ImageGrid.tsx    Reusable grid
├── ChatMessage.tsx  Generated item card
├── GenerateBar.tsx  Bottom input bar
└── Modal.tsx        Image preview

lib/
├── mockStore.ts     Client-side state (Phase 1)
└── supabaseClient.ts Supabase setup (Phase 2)
```

## Mock Data

The app comes with 4 pre-loaded tiles and 2 home images using Pexels stock photos. All generated images are randomly selected from a pool of mock URLs.

## Next Steps

After testing Phase 1, proceed to Phase 2 for:
- Real Supabase authentication
- Persistent database storage
- FastAPI backend with actual AI generation
- Supabase Storage for images
- Production deployment

See `README.md` for the complete Phase 2 implementation plan.

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Build errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**TypeScript errors:**
```bash
npm run typecheck
```

## Support

This is a Phase 1 scaffold with all Phase 2 integration points clearly marked in code comments. Look for:

```typescript
// TODO PHASE-2: replace with actual implementation
```

Happy testing!
