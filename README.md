# BiteBuddy

A social accountability app for sharing healthy meals with friends and staying motivated to eat healthier.

## Features
- Post meals with health scores (1-10)
- Rate friends' meals (1-5 stars)
- Earn points for posting and rating
- Leaderboard to track progress
- Nutrition coach mode to monitor clients
- Friend system to see only their meals

## Getting Started

### Local Development
1. Install dependencies: `npm install`
2. Start: `npm start`
3. Open [http://localhost:3000](http://localhost:3000)

### Deploy to Vercel
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New" → "Project"
4. Import your GitHub repo
5. Click "Deploy"
6. Your app is live!

## Tech Stack
- React 18
- Local Storage for data persistence
- Lucide React for icons

## Notes
- Data is stored in browser's local storage (not a server database)
- Each user's browser stores their own data
- For production, would need a backend (Firebase, Supabase, etc.)
