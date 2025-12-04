# Meta CAPI Center of Excellence

Internal tool for guiding marketing teams through Meta Conversions API setup. Provides step-by-step wizards for connecting client data sources to Meta's conversion tracking.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173. Backend runs on port 3001.

## Structure

```
capi-project/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── common/         # Button, Card, Icon, Layout, StatusBadge, SettingsBar
│       │   └── wizard/         # ChecklistItem, NoteEditor
│       ├── contexts/           # FunModeContext, ImpContext
│       ├── data/               # Platform/wizard definitions, funModeMessages
│       ├── hooks/              # useClients, useMinLoadingTime
│       ├── pages/              # Dashboard, ClientDetail, Wizard, Docs
│       ├── services/           # API client
│       └── styles/             # Design tokens, fun-mode.css, animations
│
├── server/                     # Express backend
│   ├── middleware/             # Error handling
│   ├── routes/                 # clients, progress, notes, docs
│   └── services/               # Google Sheets operations
│
└── docs/                       # Design system documentation
```

## Features

- Client management with platform assignments
- 6-phase setup wizard per platform
- Checklist-based progress tracking at step and item level
- Notes attached to steps and checklist items
- Always-on dark mode
- Fun Mode: retro Win98-style theme with pixel fonts and 3D borders
- Markdown documentation viewer

## Supported Platforms

| Category | Platforms |
|----------|-----------|
| Data Warehouses | Snowflake, Redshift, BigQuery |
| CRMs/CDPs | Salesforce, HubSpot, Segment |
| Analytics | Amplitude, Mixpanel, GA4 |

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Google Sheets credentials
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-spreadsheet-id

# Optional
PORT=3001
VITE_API_URL=http://localhost:3001/api
```

Without credentials, the app runs with mock data.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Run frontend and backend concurrently |
| `npm run dev:client` | Frontend only (port 5173) |
| `npm run dev:server` | Backend only (port 3001) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |

## Tech Stack

- Frontend: React 18, Vite, React Router, CSS Modules
- Backend: Node.js, Express
- Database: Google Sheets API
- Styling: CSS custom properties (design tokens)

## Requirements

Node.js 18 or higher.
