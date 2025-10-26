# Wagerloo - Co-op Salary Prediction Market

A prediction market platform where users can bet on Waterloo co-op salaries using fake money. Built with Next.js, Prisma, and Tailwind CSS.

## Features

- **User Authentication**: Simple email-based authentication (no password required for demo)
- **Profile Creation**: Upload your co-op profile (name, program, year, bio, previous co-ops)
- **Prediction Markets**: Bet on salary ranges using an automated market maker (AMM)
- **Real-time Odds**: Probabilities update dynamically based on betting activity
- **Virtual Currency**: Each user starts with $10,000 in fake money

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma migrate dev
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal)

## How to Use

1. **Sign In**: Enter your email (no password needed for demo)
2. **Create a Profile**: Click "Create Profile" and fill in your information
3. **Browse Markets**: View all active prediction markets on the home page
4. **Place Bets**: Click on a market to view details and buy shares in different wage ranges
5. **Watch Odds Change**: As more people bet, the probabilities adjust automatically

## How the Betting Works

This app uses a simple Automated Market Maker (AMM) model:

- Each wage range starts with 100 shares
- Price per share = current probability (shares / total shares)
- When you buy shares, the price increases for that outcome
- Winning shares will eventually pay out when the market resolves

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: SQLite (via Prisma ORM)
- **Authentication**: NextAuth.js
- **State Management**: React hooks

## Project Structure

```
wagerloo-app/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── auth/                 # Authentication pages
│   ├── market/               # Market detail pages
│   └── profile/              # Profile pages
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   └── navbar.tsx            # Navigation bar
├── lib/                      # Utility functions
│   ├── auth.ts               # NextAuth configuration
│   ├── prisma.ts             # Prisma client
│   └── utils.ts              # Helper functions
└── prisma/                   # Database schema and migrations
    └── schema.prisma         # Database models
```

## Database Schema

- **User**: User accounts with balance
- **Profile**: Co-op profiles that can be bet on
- **Market**: Prediction markets for each profile
- **Outcome**: Wage range outcomes (e.g., $30-35/hr)
- **Position**: User's shares in each outcome
- **Transaction**: History of all bets

## Future Enhancements

- Resume/PDF upload functionality
- Market resolution with proof of salary
- Leaderboard for top traders
- Portfolio view showing all your positions
- Sell shares functionality
- Charts showing odds history over time
- Social features (comments, profiles)

## License

MIT
