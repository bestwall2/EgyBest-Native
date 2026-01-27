# TMDB Streaming App - Design Guidelines

## Brand Identity

**Purpose**: A premium streaming discovery platform that helps users explore and track movies & TV series using TMDB's extensive database.

**Aesthetic Direction**: **Cinematic luxury** - Dark, immersive theater experience with dramatic contrasts, premium materials, and elegant content presentation. Think Netflix-meets-boutique-cinema.

**Memorable Element**: Gradient-overlay hero sections that create depth and draw the eye to featured content, making every poster feel like a theatrical premiere.

---

## Navigation Architecture

**Root Navigation**: Bottom Tab Bar (4 tabs)
- Home (featured/trending content)
- Browse (filtered discovery)
- Search (multi-category search)
- Library (watchlist, favorites, history)

**Screen List**:
1. Home - Discover trending and curated content
2. Browse - Filter and explore by genre/category
3. Search - Find specific movies/shows/people
4. Library - Access saved and watched content
5. Detail (Modal Stack) - View full movie/show information
6. Video Player (Modal Stack) - Play trailers/clips
7. Cast/Person Detail (Modal Stack) - View actor/crew filmography

---

## Screen-by-Screen Specifications

### Home Screen
- **Header**: Transparent with app logo (left), user avatar button (right)
- **Layout**: Vertical scroll
  - Hero banner (full-width, 16:9 aspect ratio) with gradient overlay
  - Horizontal scrollable sections: Trending, Popular, Top Rated, By Genre
  - Each section: title + horizontal FlatList of media cards
- **Safe Area**: Top inset = headerHeight + Spacing.xl, Bottom inset = tabBarHeight + Spacing.xl
- **Empty State**: Show skeleton loaders during initial load

### Browse Screen
- **Header**: Default with title "Browse", filter button (right)
- **Layout**: 
  - Filter chips row (horizontal scroll): Genre tags
  - Tabs: Movies | TV Shows
  - Grid of media cards (2 columns) with infinite scroll
- **Safe Area**: Top inset = Spacing.xl (non-transparent header), Bottom inset = tabBarHeight + Spacing.xl
- **Empty State**: empty-browse.png with "No content found" message

### Search Screen
- **Header**: Custom search bar (full-width, animated)
- **Layout**:
  - Search history chips (if no active search)
  - Multi-category tabs: All | Movies | TV | People
  - Search results grid/list
- **Safe Area**: Top inset = headerHeight + Spacing.xl, Bottom inset = tabBarHeight + Spacing.xl
- **Empty State**: empty-search.png with "Start searching for movies..."

### Library Screen
- **Header**: Default with title "My Library"
- **Layout**: Vertical scroll
  - Continue Watching carousel (horizontal)
  - Watchlist section with grid
  - Favorites section with grid
- **Safe Area**: Top inset = Spacing.xl, Bottom inset = tabBarHeight + Spacing.xl
- **Empty State**: empty-library.png for each empty section

### Detail Screen (Modal)
- **Header**: Transparent with back button (left), share + watchlist buttons (right)
- **Layout**: Vertical scroll
  - Backdrop image (full-width) with gradient overlay
  - Poster, title, rating, runtime, release date
  - Overview text (expandable)
  - Cast carousel (horizontal scroll, circular avatars)
  - Trailers section
  - Similar content section
- **Safe Area**: Top inset = headerHeight + Spacing.xl, Bottom inset = insets.bottom + Spacing.xl
- **Action Button**: Floating "Add to Watchlist" button (bottom-right, with drop shadow)

### Video Player (Modal)
- **Header**: Minimal with close button
- **Layout**: Full-screen video player with custom controls overlay
- **Safe Area**: None (full-screen)

---

## Design System

### Color Palette
- **Primary**: #E50914 (Netflix red, bold accent)
- **Background**: #0A0A0A (deep black for theater feel)
- **Surface**: #1A1A1A (elevated cards/sections)
- **Surface Variant**: #2A2A2A (interactive elements)
- **Text Primary**: #FFFFFF
- **Text Secondary**: #B3B3B3
- **Semantic Success**: #46D369
- **Semantic Warning**: #FFB800

### Typography
- **Font**: System default (SF Pro on iOS, Roboto on Android) for legibility
- **Type Scale**:
  - Hero: 32pt, Bold
  - H1: 24pt, Bold
  - H2: 20pt, Semibold
  - Body: 16pt, Regular
  - Caption: 14pt, Regular
  - Label: 12pt, Medium

### Visual Design
- **Icons**: Feather icons from @expo/vector-icons (white or primary color)
- **Cards**: Rounded corners (12pt), subtle elevation via background color difference
- **Floating Buttons**: Drop shadow with shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2
- **Touchable Feedback**: Opacity 0.7 on press for all touchable elements
- **Gradients**: Linear gradients on hero images (transparent to background color, top to bottom)

---

## Assets to Generate

**App Icon & Splash**:
- icon.png - Film reel or play button in primary red on dark background | WHERE USED: Device home screen
- splash-icon.png - Simplified version of app icon | WHERE USED: App launch screen

**Empty States**:
- empty-browse.png - Film reels or popcorn illustration | WHERE USED: Browse screen when no results
- empty-search.png - Magnifying glass with film strip | WHERE USED: Search screen before/after no results
- empty-library.png - Empty theater seats illustration | WHERE USED: Library sections when empty
- empty-watchlist.png - Bookmark with film icon | WHERE USED: Watchlist tab when empty
- empty-favorites.png - Heart with star icon | WHERE USED: Favorites tab when empty

**Decorative**:
- hero-placeholder.png - Cinematic gradient pattern | WHERE USED: Hero banner loading state

All illustrations should use the primary red accent sparingly on dark backgrounds, with a minimalist, elegant style matching the cinematic luxury aesthetic.