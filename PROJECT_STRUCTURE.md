# AI Tile Visualization Tool - Complete Project Structure

## Phase 1 Complete File Tree

```
project/
├── .bolt/
│   ├── config.json
│   ├── ignore
│   └── prompt
├── .env
├── .eslintrc.json
├── .gitignore
├── README.md
├── PROJECT_STRUCTURE.md
├── components.json
├── next.config.js
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
│
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx (redirects to /login)
│   ├── login/
│   │   └── page.tsx
│   ├── catalog/
│   │   └── page.tsx
│   ├── reference/
│   │   └── [tileId]/
│   │       └── page.tsx
│   ├── chat/
│   │   └── page.tsx
│   └── select/
│       ├── tile/
│       │   └── page.tsx
│       └── home/
│           └── page.tsx
│
├── components/
│   ├── Navbar.tsx
│   ├── ImageGrid.tsx
│   ├── UploadButton.tsx
│   ├── ChatMessage.tsx
│   ├── GenerateBar.tsx
│   ├── Modal.tsx
│   └── ui/ (shadcn components)
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       └── tooltip.tsx
│
├── hooks/
│   └── use-toast.ts
│
└── lib/
    ├── utils.ts
    ├── supabaseClient.ts (Phase 2 ready)
    └── mockStore.ts (Phase 1 mock state)
```

## Key Files Overview

### Core Application Files

**app/page.tsx**
- Root page that redirects to /login
- Entry point for the application

**app/login/page.tsx**
- Mock authentication interface
- Accepts any email/password combination
- Redirects to /catalog on success

**app/catalog/page.tsx**
- Displays grid of tile images
- Upload new tiles functionality
- Click tiles to navigate to reference page

**app/reference/[tileId]/page.tsx**
- Shows selected tile details
- Displays saved gallery for the tile
- "Generate" button to start visualization

**app/chat/page.tsx**
- Main generation interface
- Chronological list of generated images
- Save/Delete functionality
- Bottom fixed input bar

**app/select/tile/page.tsx**
- Tile image selection interface
- Grid view of available tiles
- Upload new tile option

**app/select/home/page.tsx**
- Home image selection interface
- Shows last 10 uploaded homes
- Upload new home option

### Components

**components/Navbar.tsx**
- Shared navigation header
- Logout functionality
- App title/branding

**components/ImageGrid.tsx**
- Reusable grid component
- Responsive layout (1-4 columns)
- Used across catalog and selection pages

**components/UploadButton.tsx**
- Local file picker integration
- Returns File and local URL
- Customizable label and variant

**components/ChatMessage.tsx**
- Individual generated message card
- Image preview
- Save/Delete action buttons
- Timestamp display

**components/GenerateBar.tsx**
- Fixed bottom input bar
- "Add Tile" and "Add Home" buttons
- Prompt text input
- Generate button with loading state

**components/Modal.tsx**
- Full-screen image preview
- Close button
- Click outside to dismiss

### State Management

**lib/mockStore.ts**
- Singleton client-side state store
- Mock user authentication
- In-memory tile/home/generated data
- Mock generation with 2s delay
- Save/delete/selection operations

**lib/supabaseClient.ts**
- Supabase client initialization
- Phase 2 ready (currently unused)
- Environment variable configuration

## Data Flow (Phase 1)

```
User Login → Mock Auth → Catalog
   ↓
View Tile → Reference Page → Generate
   ↓
Chat Interface → Select Tile/Home → Generate
   ↓
Save Generated → Gallery on Reference Page
```

## Mock Data Structure

### MockUser
```typescript
{
  id: string
  email: string
}
```

### MockTile
```typescript
{
  id: string
  name: string
  localPreviewUrl: string
  createdAt: Date
}
```

### MockHome
```typescript
{
  id: string
  localPreviewUrl: string
  createdAt: Date
}
```

### MockGeneratedMessage
```typescript
{
  id: string
  tileId: string | null
  homeId: string | null
  prompt: string
  imageUrl: string
  saved: boolean
  createdAt: Date
}
```

## Phase 2 Integration Points

All Phase 2 integration points are marked with comments:
```typescript
// TODO PHASE-2: replace with actual implementation
```

Key files to modify in Phase 2:
1. `lib/mockStore.ts` → Replace with API service layer
2. `app/login/page.tsx` → Integrate Supabase Auth
3. `app/catalog/page.tsx` → Load tiles from Supabase
4. `app/chat/page.tsx` → Call backend /generate API
5. All upload functions → Use Supabase Storage

See README.md for complete Phase 2 plan and implementation order.
