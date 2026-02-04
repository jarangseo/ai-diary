# AI Diary

An AI-powered diary application

## Tech Stack

### Backend
- Next.js 16
- OpenAI API
- Zod (validation)
- TypeScript

### Frontend
- React 19
- Vite 7
- TailwindCSS 4
- TanStack Query (server state management)
- Zustand (client state management)
- React Router
- TypeScript

## Requirements

- Node.js 22 (see `.nvmrc`)

## Project Structure

```
ai-diary/
├── backend/          # Next.js API server
│   └── app/          # App Router
├── frontend/         # React SPA
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       ├── stores/
│       └── utils/
└── .nvmrc
```

## Getting Started

### 1. Set Node.js Version

```bash
nvm use
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Run Development Servers

**Backend** (Terminal 1)
```bash
cd backend
npm run dev
```
→ http://localhost:3000

**Frontend** (Terminal 2)
```bash
cd frontend
npm run dev
```
→ http://localhost:5173

## Scripts

### Backend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier formatting |
