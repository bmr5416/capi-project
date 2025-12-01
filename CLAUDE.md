# CLAUDE.md

Guidance for Claude Code when working with this codebase.

## Project Overview

Internal tool for guiding marketing teams through Meta Conversions API (CAPI) setup across multiple data platforms. Features wizard-based client onboarding, progress tracking, and documentation.

**Stack:** React 18 + Vite | Node.js + Express | Google Sheets API

## Codebase Map

```
capi-project/
│
├── client/                         # React Frontend
│   ├── public/
│   │   ├── agents/Clippy/map.png   # Clippy sprite sheet (124x93px frames)
│   │   └── logos/                  # Platform logos (9 PNGs)
│   └── src/
│       ├── components/
│       │   ├── common/             # Shared UI components
│       │   │   ├── Button.jsx      #   Polymorphic button/link
│       │   │   ├── Card.jsx        #   Content container
│       │   │   ├── Icon.jsx        #   SVG icon library
│       │   │   ├── Layout.jsx      #   App shell with sidebar
│       │   │   ├── FunModeToggle.jsx #  Retro/Fun mode switch
│       │   │   ├── LoadingAnimation.jsx
│       │   │   ├── ProgressBar.jsx
│       │   │   ├── SettingsBar.jsx  #  Combined theme controls
│       │   │   ├── StatusBadge.jsx
│       │   │   └── ThemeToggle.jsx  #  Dark/light mode switch
│       │   ├── imp/                # Imp assistant (Clippy-like helper)
│       │   │   ├── Imp.jsx         #   Main orchestration component
│       │   │   ├── ImpBalloon.jsx  #   Speech balloon with word reveal
│       │   │   └── ImpSprite.jsx   #   Animated Clippy sprite
│       │   └── wizard/             # Wizard-specific components
│       │       ├── ChecklistItem.jsx  # Expandable checklist item
│       │       └── NoteEditor.jsx     # Inline note input
│       ├── contexts/
│       │   ├── FunModeContext.jsx  # Retro/Fun mode state
│       │   ├── ImpContext.jsx      # Imp assistant state
│       │   └── ThemeContext.jsx    # Dark mode state
│       ├── data/
│       │   ├── funModeMessages.js  # Quest-style loading messages
│       │   ├── impAnimations.js    # Clippy animation frame data
│       │   ├── impTips.js          # Context-aware tip definitions
│       │   ├── platforms.js        # Platform definitions (9 platforms)
│       │   └── wizardSteps.js      # Step definitions by phase
│       ├── hooks/
│       │   ├── useClients.js       # Client data fetching
│       │   ├── useImpTip.js        # Imp tip context detection
│       │   └── useMinLoadingTime.js # Loading state debounce
│       ├── pages/
│       │   ├── Dashboard.jsx       # Client list + stats
│       │   ├── ClientDetail.jsx    # Single client + platforms
│       │   ├── NewClient.jsx       # Client creation form
│       │   ├── Wizard.jsx          # 6-phase setup wizard
│       │   └── Documentation.jsx   # Markdown doc viewer
│       ├── services/
│       │   └── api.js              # API client with error handling
│       ├── styles/
│       │   ├── animations.module.css
│       │   ├── fun-mode.css        # Fun Mode design tokens
│       │   └── index.css           # Design tokens + globals
│       ├── App.jsx                 # Router setup
│       └── main.jsx                # Entry point
│
├── server/                         # Express Backend
│   ├── middleware/
│   │   └── errorHandler.js         # Centralized error handling
│   ├── routes/
│   │   ├── clients.js              # CRUD + platform assignment
│   │   ├── progress.js             # Step/item completion
│   │   ├── notes.js                # Note CRUD
│   │   └── docs.js                 # Markdown + checklist content
│   ├── services/
│   │   └── sheets.js               # Google Sheets operations + mock data
│   └── index.js                    # Express app setup
│
├── docs/                           # Internal documentation
│   ├── animations.md               # Animation guidelines
│   ├── design.md                   # Design system reference
│   ├── fun-design.md               # Fun Mode design system
│   └── sayings.md                  # Loading message content
│
├── package.json                    # Workspace root
├── .eslintrc.js
└── CLAUDE.md
```

## Commands

```bash
npm install              # Install all dependencies
npm run dev              # Run client (5173) + server (3001)
npm run dev:client       # Frontend only
npm run dev:server       # Backend only
npm run build            # Production build
npm run lint             # ESLint check
```

## API Routes

```
Clients
  GET    /api/clients                    List all clients
  GET    /api/clients/:id                Get client with platforms/progress
  POST   /api/clients                    Create client
  PUT    /api/clients/:id                Update client
  DELETE /api/clients/:id                Delete client
  POST   /api/clients/:id/platforms      Add platform
  DELETE /api/clients/:id/platforms/:p   Remove platform

Progress
  GET    /api/progress/:client/:platform              Get step progress
  POST   /api/progress/:client/:platform/:step        Mark step complete
  DELETE /api/progress/:client/:platform/:step        Mark step incomplete
  GET    /api/progress/:client/:platform/:step/items  Get item progress
  POST   /api/progress/:client/:platform/:step/items/:idx   Complete item
  DELETE /api/progress/:client/:platform/:step/items/:idx   Uncomplete item

Notes
  GET    /api/notes/:client/:platform/:step    Get notes
  POST   /api/notes/:client/:platform/:step    Save note
  DELETE /api/notes/:client/:platform/:step    Delete note

Docs
  GET    /api/docs                      Doc structure
  GET    /api/docs/content/:stepId      Checklist content from Sheets
  GET    /api/docs/:category/:slug      Markdown doc
```

## Data Model (Google Sheets)

| Sheet | Purpose |
|-------|---------|
| Clients | Client records (id, name, email, status, notes) |
| ClientPlatforms | Platform assignments per client |
| StepProgress | Wizard step completion status |
| ChecklistProgress | Individual checklist item completion |
| ChecklistContent | Editable checklist instructions (from Sheets) |
| Notes | Step and item-level notes |

## Wizard Phases

1. Prerequisites - Business Manager access verification
2. Meta Setup - Pixel ID and access token configuration
3. Platform Setup - Data source connection
4. Data Mapping - Event and field mapping
5. Testing - Test event validation
6. Go Live - Production enablement

## Supported Platforms

| Category | Platforms |
|----------|-----------|
| Data Warehouses | Snowflake, Redshift, BigQuery |
| CRMs/CDPs | Salesforce, HubSpot, Segment |
| Analytics | Amplitude, Mixpanel, GA4 |

## Environment Variables

```bash
# Google Sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=...

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173  # For CORS in production

# Client (Vite)
VITE_API_URL=http://localhost:3001/api
```

## Code Conventions

- Functional components only
- CSS Modules for styling
- PropTypes for component props
- `useCallback`/`useMemo` for performance-critical code
- Error handling via centralized middleware
- Design tokens in `index.css` (spacing, colors, transitions)

## Design Tokens

Primary: `--color-primary` (rgb 37,55,70)
Accent: `--color-primary-light` (rgb 160,216,226)
Background: `--color-gray-50` (rgb 242,240,233)
Spacing: `--space-1` through `--space-10` (4px increments)
Transitions: `--transition-fast` (150ms), `--transition-base` (200ms)

## Status Values

| Status | Description |
|--------|-------------|
| not_started | No work begun |
| in_progress | Work underway |
| completed | Successfully finished |
| pending_review | Awaiting verification |
| needs_attention | Issues detected |
| error | Critical failure |

## Fun Mode

Toggleable retro/8-bit aesthetic that transforms the UI into a Windows 98-inspired theme. Coexists with light/dark mode (4 combinations: light, dark, light+fun, dark+fun).

**Technical Implementation:**
- Uses `data-fun-mode="true"` attribute on document root
- Tokens defined in `fun-mode.css`, imported after `index.css`
- Component overrides use `:global([data-fun-mode="true"])` selectors
- State managed via `FunModeContext.jsx`, persisted to localStorage

**Key Design Elements:**
- Win98-style 3D borders (raised/inset using 4-way border-color)
- Pixel fonts: Press Start 2P (display), VT323 (body)
- Sharp corners (all border-radius = 0)
- Pixel drop shadows
- Quest-style loading messages

See `docs/fun-design.md` for complete design system reference.

### Imp Assistant

"Imp" is a Clippy-like context-aware assistant that appears only in Fun Mode. The name puns on "impressions" (advertising metric) while fitting the retro RPG aesthetic.

**Components:**
- `Imp.jsx` - Main orchestrator, route change detection
- `ImpSprite.jsx` - Animated Clippy using sprite sheet
- `ImpBalloon.jsx` - Speech balloon with word-by-word reveal

**Data Files:**
- `impAnimations.js` - Frame coordinates for animations (Idle, Wave, Thinking, Explain, etc.)
- `impTips.js` - 40+ tips organized by page, platform, and wizard phase

**Behavior:**
- Shows contextual tip 2 seconds after route change
- Click sprite to get new tip when minimized
- Escape key or X button dismisses
- Seen tips tracked in localStorage (prioritizes unseen tips)

**Code Attribution:**
- Sprite sheet: [modern-clippy](https://github.com/vchaindz/modern-clippy) (MIT)
- Balloon logic: [clippyjs](https://github.com/pi0/clippyjs) (MIT)
