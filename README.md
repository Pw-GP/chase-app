# Chase — Construction Action Tracker

A lightweight Next.js web app for tracking RFIs, approvals, submittals, variations, EOTs, defects, site instructions and actions across construction projects.

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **CSS** (no framework — custom design system)
- **Anthropic Claude API** — server-side only, key never exposed to browser
- **localStorage** — client-side state (no database yet)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your API key

Create `.env.local` in the project root:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

> ⚠️ Never commit `.env.local` to git. It is listed in `.gitignore`.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/app` | Dashboard — register table + KPIs |
| `/app/paste-email` | Paste email → AI extraction → save to register |
| `/app/projects` | Projects list |
| `/app/settings` | Profile and configuration |
| `/api/extract` | Server-side API route — calls Anthropic, returns structured JSON |

## Deploy to Vercel

1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add environment variable: `ANTHROPIC_API_KEY = sk-ant-...`
4. Deploy

The API key is stored as a Vercel environment variable — it is **never sent to the browser**.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key. Server-side only. |

## Register types

| Code | Name | Terminal status |
|------|------|----------------|
| RFI | Request for information | Closed |
| APR | Approval | Approved |
| SUB | Submittal | Closed |
| VAR | Variation | Closed |
| EOT | Extension of time | Accepted |
| DEF | Defect | Closed |
| SI | Site instruction | Closed |
| ACT | Action | Done |
