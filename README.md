# AI Diary

AI-powered personal diary with emotion analysis, built with React and Next.js.

Write daily entries and receive AI-driven emotional insights, trend visualizations, and reflective questions to support self-awareness.

## Features

- **AI Emotion Analysis** - Analyze diary entries using OpenAI GPT-4o or Google Gemini
- **Emotion Calendar** - Color-coded calendar view reflecting daily emotional states
- **Trend Visualization** - Monthly emotion trend chart with Recharts
- **Safety Alerts** - Automatic detection of crisis keywords with local helpline resources
- **Multi-language** - Full support for English, Korean, and German
- **OAuth Authentication** - Sign in with Google or GitHub via NextAuth.js
- **Cloud Sync** - Persistent storage via Supabase
- **Responsive Design** - Mobile-first UI with bottom navigation

## Tech Stack

### Frontend
| Category | Technology |
|----------|-----------|
| Framework | React 19 + TypeScript |
| Bundler | Vite 7 |
| Styling | TailwindCSS 4 |
| Routing | React Router v7 |
| State | Zustand (client) + TanStack Query (server) |
| Charts | Recharts |
| Testing | Vitest + Testing Library |

### Backend
| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Auth | NextAuth.js (Google, GitHub OAuth) |
| AI | OpenAI API (GPT-4o-mini) / Google Gemini |
| Validation | Zod |
| Database | Supabase (PostgreSQL) |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Vite)                   │
│  React 19 + TypeScript + TailwindCSS                │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐│
│  │  Pages   │ │Components│ │   State Management   ││
│  │  - Home  │ │  - Layout│ │  - Zustand (auth,    ││
│  │  - Write │ │  - Error │ │    settings, lang)   ││
│  │  - Detail│ │  Boundary│ │  - TanStack Query    ││
│  │  - Login │ │  - Route │ │    (server state)    ││
│  │  - Settngs│ │  Guard  │ │                      ││
│  └──────────┘ └──────────┘ └──────────────────────┘│
│                      │                              │
│              ┌───────┴────────┐                     │
│              │   Services     │                     │
│              │  - API client  │                     │
│              │  - Supabase DB │                     │
│              └───────┬────────┘                     │
└──────────────────────┼──────────────────────────────┘
                       │ HTTP
┌──────────────────────┼──────────────────────────────┐
│              Backend (Next.js 16)                    │
│                      │                              │
│  ┌───────────────────┴──────────────────────────┐   │
│  │              API Routes                       │   │
│  │  POST /api/analyze     - Emotion analysis     │   │
│  │  GET  /api/auth/[...]  - OAuth endpoints      │   │
│  │  GET  /api/auth/session - Session info        │   │
│  └──────┬────────────────────────┬──────────────┘   │
│         │                        │                  │
│  ┌──────┴──────┐          ┌──────┴──────┐           │
│  │  OpenAI API │          │ NextAuth.js │           │
│  │  Gemini API │          │  (OAuth)    │           │
│  └─────────────┘          └─────────────┘           │
└─────────────────────────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────┐
│              Supabase (PostgreSQL)                   │
│  - diaries table (CRUD, per-user isolation)         │
│  - Row Level Security                               │
└─────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 22+ (see `.nvmrc`)
- npm

### 1. Clone and set Node version

```bash
git clone <repository-url>
cd ai-diary
nvm use
```

### 2. Install dependencies

```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### 3. Configure environment variables

**Backend** (`backend/.env`):
```env
# AI APIs (at least one required)
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key

# Set to true for development without API keys
USE_MOCK=true

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run development servers

```bash
# Terminal 1 - Backend
cd backend && npm run dev    # http://localhost:3000

# Terminal 2 - Frontend
cd frontend && npm run dev   # http://localhost:5173
```

> Set `USE_MOCK=true` in backend `.env` to run without AI API keys.

## Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run format` | Format code (Prettier) |

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |

## Testing

```bash
cd frontend
npm test              # Run all tests
npm run test:watch    # Watch mode
```

Test structure:
- `src/utils/__tests__/` - Utility function unit tests
- `src/components/__tests__/` - Component tests with Testing Library
- `src/services/__tests__/` - Service layer tests with Supabase mocking

## Deployment

### Frontend (Vercel / Netlify)

1. Set build command: `cd frontend && npm run build`
2. Set output directory: `frontend/dist`
3. Add environment variables (`VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

### Backend (Vercel)

1. Set root directory: `backend`
2. Framework preset: Next.js
3. Add environment variables (API keys, OAuth credentials, `FRONTEND_URL`)

### Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/` to create the `diaries` table
3. Enable Row Level Security
4. Copy project URL and anon key to frontend env

## CI/CD

GitHub Actions runs on every push/PR to `main`:
- **Frontend**: install → lint → type-check → test → build
- **Backend**: install → lint → build

Both jobs run in parallel. See `.github/workflows/ci.yml`.

## Project Structure

```
ai-diary/
├── .github/workflows/    # CI/CD pipelines
├── backend/              # Next.js 16 API server
│   └── src/app/api/      # API routes (analyze, auth)
├── frontend/             # React 19 SPA
│   └── src/
│       ├── components/   # Shared components (Layout, ErrorBoundary, ProtectedRoute)
│       ├── constants/    # i18n translations
│       ├── hooks/        # Custom hooks (useTranslation)
│       ├── lib/          # External service clients (Supabase)
│       ├── pages/        # Route pages (Home, Write, Detail, Settings, Login)
│       ├── services/     # Data layer (API client, DB operations)
│       ├── stores/       # Zustand stores (auth, language, settings)
│       ├── types/        # TypeScript type definitions
│       └── utils/        # Utility functions (emotion colors)
├── supabase/             # Database migrations
└── .nvmrc                # Node.js version (v22)
```

## License

MIT
