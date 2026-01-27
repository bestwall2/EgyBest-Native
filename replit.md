# StreamFlix - Movie & TV Streaming Discovery App

## Overview
StreamFlix is a React Native Expo application for discovering and tracking movies and TV series using the TMDB (The Movie Database) API. The app features a premium, cinematic dark theme with a Netflix-inspired aesthetic.

## Recent Changes
- January 27, 2026: Initial MVP implementation with Home, Browse, Search, and Library screens
- TMDB API integration via backend proxy endpoints
- Local storage for watchlist, favorites, and watch history
- Generated custom app icons and empty state illustrations

## Architecture

### Frontend (React Native Expo)
- **Navigation**: Bottom tab navigation with 4 tabs (Home, Browse, Search, Library)
- **Stack Navigation**: Detail screen pushed on top for movie/show details
- **State Management**: React Query for server state, AsyncStorage for local persistence
- **Styling**: Dark theme with cinematic luxury aesthetic (#E50914 primary accent)

### Backend (Express.js)
- TMDB API proxy routes at `/api/tmdb/*`
- Handles API key securely on server-side
- Routes for movies, TV shows, search, genres, and person details

### Key Directories
```
client/
├── components/     # Reusable UI components (MediaCard, HorizontalList, etc.)
├── navigation/     # Navigation structure
├── screens/        # App screens (Home, Browse, Search, Library, Detail)
├── services/       # TMDB API and AsyncStorage services
├── types/          # TypeScript type definitions
├── utils/          # Helper functions
└── constants/      # Theme configuration

server/
├── routes.ts       # TMDB API proxy endpoints
└── index.ts        # Express server setup
```

## Environment Variables Required
- `TMDB_API_KEY`: API key from TMDB (https://www.themoviedb.org/settings/api)

## User Preferences
- Dark theme preferred (force dark mode)
- Cinematic luxury aesthetic with Netflix-red accent color
- Local-first data storage for watchlist/favorites

## Running the App
1. Ensure `TMDB_API_KEY` secret is set
2. Backend runs on port 5000
3. Frontend runs on port 8081
4. Scan QR code in Expo Go to test on physical device

## Features
- **Home**: Hero banner, trending movies, popular content, TV shows
- **Browse**: Filter by genre, switch between Movies/TV Shows, infinite scroll
- **Search**: Real-time search with history, multi-category results
- **Library**: Watchlist, Favorites, Watch History tabs
- **Detail**: Full movie/show info, cast, similar content, add to watchlist/favorites
