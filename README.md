# AI Tile Visualization Tool - Phase 1

## Overview

This is the Phase 1 frontend scaffold for the AI Tile Visualization Tool. This phase includes a fully functional Next.js application with mock data and client-side state management. All backend integration points are marked with comments for Phase 2 implementation.

## Phase 1 Features

### Implemented Routes
- `/login` - Mock email/password authentication
- `/catalog` - Grid view of tiles with upload functionality
- `/reference/[tileId]` - Tile details and saved gallery
- `/chat` - Generate visualizations with chronological message list
- `/select/tile` - Tile image selection
- `/select/home` - Home image selection

### Key Components
- `Navbar` - Shared navigation header
- `ImageGrid` - Reusable grid component
- `UploadButton` - Local file picker for image uploads
- `ChatMessage` - Generated message display with save/delete
- `GenerateBar` - Bottom input bar with prompt and action buttons
- `Modal` - Image preview modal

### Mock Features
- Client-side authentication (accepts any credentials)
- In-memory tile catalog with upload
- In-memory home image storage (last 10)
- Mock image generation (2-second delay)
- Save/delete generated images
- Tile-specific saved gallery

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Type Check

```bash
npm run typecheck
```

## Project Structure

```
/app
  /login - Authentication page
  /catalog - Tile catalog with upload
  /reference/[tileId] - Tile details and gallery
  /chat - Generation interface
  /select/tile - Tile selection
  /select/home - Home selection
  layout.tsx - Root layout
  page.tsx - Root redirect
  globals.css - Global styles

/components
  Navbar.tsx - Navigation header
  ImageGrid.tsx - Reusable grid
  UploadButton.tsx - File upload
  ChatMessage.tsx - Generated message card
  GenerateBar.tsx - Bottom generation bar
  Modal.tsx - Image preview modal

/lib
  mockStore.ts - Client-side mock state management
  supabaseClient.ts - Supabase placeholder (Phase 2)
```

## Phase 1 Limitations

- All data is stored in memory (refreshing resets state)
- No real authentication (mock session)
- No actual AI generation (returns random mock images)
- Camera functionality disabled
- No persistent storage
- No backend API calls

---

## Phase 2 Plan

### Backend Integration

#### 1. Supabase Setup

**Database Tables:**
```sql
-- Users table (use Supabase Auth)
-- Tiles table
CREATE TABLE tiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Homes table
CREATE TABLE homes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  storage_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated images table
CREATE TABLE generated_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  tile_id UUID REFERENCES tiles(id),
  home_id UUID REFERENCES homes(id),
  prompt TEXT,
  storage_url TEXT NOT NULL,
  saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Storage Buckets:**
- `tiles` - Tile images
- `homes` - Home photos
- `generated` - AI-generated visualizations

**Row Level Security (RLS):**
- Enable RLS on all tables
- Users can only access their own data
- Policies for SELECT, INSERT, UPDATE, DELETE based on `user_id`

#### 2. FastAPI Backend Service

**Endpoints to Implement:**

```python
# POST /api/generate
# Input: { tile_url, home_url, prompt, user_id, tile_id }
# Process:
#   1. Download images from Supabase Storage
#   2. Call Nano Banana/Gemini API
#   3. Upload result to Supabase Storage
#   4. Return public URL
# Output: { image_url, job_id }

# POST /api/save-generated
# Input: { user_id, tile_id, home_id, prompt, image_url }
# Process: Insert into generated_images table with saved=true
# Output: { success, id }

# GET /api/gallery?tileId=...&userId=...
# Process: Query generated_images where saved=true
# Output: [ { id, image_url, prompt, created_at } ]

# POST /api/upload-tile
# Input: multipart/form-data with file and name
# Process: Upload to Supabase Storage, insert into tiles table
# Output: { id, storage_url }

# POST /api/upload-home
# Input: multipart/form-data with file
# Process: Upload to Supabase Storage, insert into homes table
# Output: { id, storage_url }
```

#### 3. Frontend Integration Points

**Files to Modify:**

**`lib/supabaseClient.ts`**
- Already configured, just ensure .env variables are set

**`lib/mockStore.ts`**
- Replace with API service layer:
  - `login()` → call `supabase.auth.signInWithPassword()`
  - `getTiles()` → fetch from `/api/tiles` or Supabase query
  - `addTile()` → call `/api/upload-tile`
  - `generateImage()` → call `/api/generate`
  - `saveGenerated()` → call `/api/save-generated`
  - All getter methods → query Supabase tables

**Look for these comment markers:**
```typescript
// TODO PHASE-2: replace mockTiles with supabase.from('tiles').select()
// TODO PHASE-2: replace mock generate with POST /api/generate
// TODO PHASE-2: replace mock auth with supabase.auth
```

**`app/login/page.tsx`**
```typescript
// Replace mockStore.login() with:
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
```

**`app/catalog/page.tsx`**
```typescript
// Replace mockStore.getTiles() with:
const { data: tiles } = await supabase
  .from('tiles')
  .select('*')
  .eq('user_id', user.id)
```

**`app/chat/page.tsx`**
```typescript
// Replace mockStore.generateImage() with:
const response = await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({ tile_url, home_url, prompt, user_id, tile_id })
})
const { image_url } = await response.json()
```

#### 4. Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Backend API (if separate service)
NEXT_PUBLIC_API_URL=http://localhost:8000

# FastAPI Backend (server-side)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key
NANO_BANANA_API_KEY=your_nano_banana_key
```

#### 5. Testing Checklist

- [ ] Supabase Auth: Sign up, sign in, sign out
- [ ] Tile upload to Supabase Storage
- [ ] Home upload to Supabase Storage
- [ ] Generate API call with real Nano Banana/Gemini
- [ ] Save generated image to database
- [ ] Load saved gallery from database
- [ ] RLS policies prevent unauthorized access
- [ ] Error handling for API failures
- [ ] Loading states for async operations

#### 6. Local Development Setup

**Option 1: Docker Compose**
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - NEXT_PUBLIC_API_URL=http://backend:8000

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
```

**Option 2: Separate Terminals**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend
uvicorn main:app --reload --port 8000
```

#### 7. Production Migration

**Infrastructure:**
- Frontend: Deploy to Vercel/Netlify
- Backend: Deploy FastAPI to Railway/Render/Cloud Run
- Database: Use hosted Supabase (already provisioned)
- Storage: Use Supabase Storage with CDN

**Optimizations:**
- Add async job queue (Celery + Redis) for generation
- Implement caching for frequent queries
- Add CDN in front of Supabase Storage
- Set up monitoring and error tracking
- Implement rate limiting on generation endpoint
- Add image compression pipeline
- Set up backup strategy for Storage buckets

**Security:**
- Rotate API keys regularly
- Enable Supabase Auth email verification
- Add CAPTCHA to prevent abuse
- Implement request rate limiting
- Add Content Security Policy headers
- Enable CORS only for trusted origins

---

## Phase 2 Implementation Order

1. Set up Supabase tables and RLS policies
2. Replace mock auth with Supabase Auth
3. Implement file upload to Supabase Storage
4. Build FastAPI backend with /generate endpoint
5. Connect frontend to backend API
6. Add async job processing for generation
7. Implement saved gallery with database queries
8. Add error handling and loading states
9. Test end-to-end flow
10. Deploy to production

---

## Notes

- Phase 1 is complete and runnable
- All integration points are marked with comments
- Mock data uses Pexels stock images
- No external API calls in Phase 1
- Camera functionality is placeholder only
