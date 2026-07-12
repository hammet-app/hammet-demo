# Hammet AI Studies — Frontend

Frontend application for the Hammet AI Studies platform.

Built with:
- Next.js 14
- TypeScript
- App Router
- PWA support
- Dexie.js (IndexedDB)
- Serwist service workers

---

## Requirements

- Node.js 20+
- npm 10+
- Docker (optional)

---

## Getting Started

Clone the repository:

```bash
git clone <repo-url>
cd hammetlabs-frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Application runs on:

```text
http://localhost:3000
```

---

## Environment Variables

Create a `.env.local` file in the project root.

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Scripts

```bash
npm run dev        # Development server
npm run lint       # Run linting
npm run build      # Production build
npm run start      # Start production server
```

---

## Project Structure

```text
app/                # App Router pages
components/         # Shared UI components
lib/                # Utilities and helpers
types/              # Shared TypeScript types
public/             # Static assets
```

---

## PWA Support

The app supports:
- Offline lesson access
- Background sync
- IndexedDB storage
- Install to Home Screen
- Service worker caching

Main technologies:
- Serwist
- Dexie.js

---

## Docker Setup

### Build Image

```bash
docker build -t hammet-frontend .
```

### Run Container

```bash
docker run -p 3000:3000 hammet-frontend
```

### Docker Compose

```bash
docker compose up
```

---

## Docker Development Notes

If hot reload fails on Windows:

```yaml
environment:
  - WATCHPACK_POLLING=true
```

---

## Branching

Recommended workflow:

```text
main        -> production
develop     -> staging/dev
feature/*   -> feature branches
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 |
| Language | TypeScript |
| Styling | CSS Modules |
| Offline Storage | Dexie.js |
| PWA | Serwist |
| Hosting | Vercel |

---

## Deployment

Frontend is deployed on:
- Vercel
- Cloudflare proxy/CDN

---

## Notes

- Do not commit `.env.local`
- Always commit `package-lock.json`
- Use Node.js 20
- Keep modules offline-safe