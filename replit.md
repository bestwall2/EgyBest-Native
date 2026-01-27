# StreamFlix (EGYBEST) - Movie & TV Streaming Discovery App

## Overview
StreamFlix is a React Native Expo application for discovering and tracking movies and TV series using the TMDB (The Movie Database) API. The app features a premium, cinematic dark theme with Netflix-inspired aesthetic and EGYBEST branding.

## Recent Changes
- January 27, 2026: Fixed detail screen "Failed to load details" bug with proper error handling and retry mechanism
- Added enhanced HeroCarousel with auto-play (6 second intervals), swipe gestures, and progress dots
- Implemented custom NavHeader with EGYBEST branding, settings and search icons
- Added movie/TV show images API endpoints for logo support
- Improved loading states and error handling throughout the app

## Architecture

### Frontend (React Native Expo)
- **Navigation**: Bottom tab navigation with 4 tabs (Home, Browse, Search, Library)
- **Stack Navigation**: Detail screen pushed on top for movie/show details
- **State Management**: React Query for server state, AsyncStorage for local persistence
- **Styling**: Dark theme with cinematic luxury aesthetic (#E50914 primary accent)
- **Animations**: React Native Reanimated for smooth transitions and gestures

### Backend (Express.js)
- TMDB API proxy routes at `/api/tmdb/*`
- Handles API key securely on server-side
- Routes for movies, TV shows, search, genres, images, and person details

### Key Components
- **HeroCarousel**: Full-screen carousel with backdrop images, PLAY/INFO buttons, auto-play
- **NavHeader**: Fixed navigation with EGYBEST logo, settings and search icons
- **MediaCard**: Animated card component with poster, rating, and press feedback
- **HorizontalList**: Scrollable list of media cards with section headers

### Key Directories
```
client/
├── components/     # Reusable UI components (MediaCard, HeroCarousel, NavHeader, etc.)
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
- Cinematic luxury aesthetic with Netflix-red accent color (#E50914)
- EGYBEST branding in navigation header
- Local-first data storage for watchlist/favorites

## Running the App
1. Ensure `TMDB_API_KEY` secret is set
2. Backend runs on port 5000
3. Frontend runs on port 8081
4. Scan QR code in Expo Go to test on physical device

## Features
- **Home**: Hero carousel with trending content, horizontal lists for movies/TV shows
- **Browse**: Filter by genre, switch between Movies/TV Shows, infinite scroll
- **Search**: Real-time search with history, multi-category results
- **Library**: Watchlist, Favorites, Watch History tabs
- **Detail**: Full movie/show info, cast, similar content, Play/My List buttons

## API Endpoints
- `GET /api/tmdb/trending/:mediaType/:timeWindow` - Trending content (movie, tv, or all)
- `GET /api/tmdb/movie/:id` - Movie details with optional append_to_response
- `GET /api/tmdb/tv/:id` - TV show details
- `GET /api/tmdb/movie/:id/images` - Movie images/logos
- `GET /api/tmdb/tv/:id/images` - TV show images/logos
- `GET /api/tmdb/search/:type` - Search movies, TV shows, or multi
- `GET /api/tmdb/discover/:type` - Discover with genre filters
- `GET /api/tmdb/genre/:type/list` - Genre lists
