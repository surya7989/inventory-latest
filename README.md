# NexaRats Pro — Secure & Simple Inventory Control

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

A professional inventory management system built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

## Features

- 📊 **Dashboard** — Real-time stats, revenue charts, stock alerts
- 💰 **Billing / POS** — Cart, payment modes (cash, UPI, card, split, bank transfer)
- 📦 **Inventory** — Grid/list views, add/edit/delete products, GST rates
- 👥 **Customers & Vendors** — CRUD with contact info and payment tracking
- 📈 **Analytics** — Revenue vs expenses, category distribution, top products
- 📋 **Reports** — Sales, inventory, P&L, GST, customer reports with PDF/Excel export
- ⚙️ **Settings** — 9 sub-pages: Profile, Notifications, GST, WhatsApp, Security, Invoice Themes, Reminders, Account Info, Help & Support

## Run Locally

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 6 | Build tool |
| Tailwind CSS 3 | Styling |
| Recharts | Charts & analytics |
| Framer Motion | Animations |
| Lucide React | Icons |

## Project Structure

```
src/
├── types/          — TypeScript interfaces
├── data/           — Mock data
├── utils/          — Utility functions (cn)
├── hooks/          — Custom hooks (useLocalStorage)
├── components/     — Reusable UI, auth, dashboard components
├── layouts/        — Sidebar, Header
├── pages/          — All page components + settings sub-pages
├── App.tsx         — Main app with routing
└── index.tsx       — Entry point
```

## Architecture

See [backend.md](./backend.md) for the full backend architecture design including API specs, database schema, and cloud deployment diagrams.

MIT
