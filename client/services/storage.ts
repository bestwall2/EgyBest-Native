import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MediaItem,
  WatchlistItem,
  FavoriteItem,
  WatchHistoryItem,
} from "@/types/tmdb";

const KEYS = {
  WATCHLIST: "@streamflix_watchlist",
  FAVORITES: "@streamflix_favorites",
  HISTORY: "@streamflix_history",
  SEARCH_HISTORY: "@streamflix_search_history",
};

// Watchlist
export async function getWatchlist(): Promise<WatchlistItem[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.WATCHLIST);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addToWatchlist(item: MediaItem): Promise<void> {
  const watchlist = await getWatchlist();
  const exists = watchlist.some(
    (w) => w.id === item.id && w.mediaType === item.mediaType
  );
  if (!exists) {
    const newItem: WatchlistItem = { ...item, addedAt: new Date().toISOString() };
    await AsyncStorage.setItem(
      KEYS.WATCHLIST,
      JSON.stringify([newItem, ...watchlist])
    );
  }
}

export async function removeFromWatchlist(
  id: number,
  mediaType: string
): Promise<void> {
  const watchlist = await getWatchlist();
  const filtered = watchlist.filter(
    (w) => !(w.id === id && w.mediaType === mediaType)
  );
  await AsyncStorage.setItem(KEYS.WATCHLIST, JSON.stringify(filtered));
}

export async function isInWatchlist(
  id: number,
  mediaType: string
): Promise<boolean> {
  const watchlist = await getWatchlist();
  return watchlist.some((w) => w.id === id && w.mediaType === mediaType);
}

// Favorites
export async function getFavorites(): Promise<FavoriteItem[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addToFavorites(item: MediaItem): Promise<void> {
  const favorites = await getFavorites();
  const exists = favorites.some(
    (f) => f.id === item.id && f.mediaType === item.mediaType
  );
  if (!exists) {
    const newItem: FavoriteItem = { ...item, addedAt: new Date().toISOString() };
    await AsyncStorage.setItem(
      KEYS.FAVORITES,
      JSON.stringify([newItem, ...favorites])
    );
  }
}

export async function removeFromFavorites(
  id: number,
  mediaType: string
): Promise<void> {
  const favorites = await getFavorites();
  const filtered = favorites.filter(
    (f) => !(f.id === id && f.mediaType === mediaType)
  );
  await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(filtered));
}

export async function isInFavorites(
  id: number,
  mediaType: string
): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((f) => f.id === id && f.mediaType === mediaType);
}

// Watch History
export async function getWatchHistory(): Promise<WatchHistoryItem[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addToWatchHistory(
  item: MediaItem,
  progress?: number
): Promise<void> {
  const history = await getWatchHistory();
  const filtered = history.filter(
    (h) => !(h.id === item.id && h.mediaType === item.mediaType)
  );
  const newItem: WatchHistoryItem = {
    ...item,
    watchedAt: new Date().toISOString(),
    progress,
  };
  const updated = [newItem, ...filtered].slice(0, 50); // Keep last 50 items
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
}

export async function clearWatchHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.HISTORY);
}

// Search History
export async function getSearchHistory(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SEARCH_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addToSearchHistory(query: string): Promise<void> {
  const history = await getSearchHistory();
  const filtered = history.filter(
    (h) => h.toLowerCase() !== query.toLowerCase()
  );
  const updated = [query, ...filtered].slice(0, 10); // Keep last 10 searches
  await AsyncStorage.setItem(KEYS.SEARCH_HISTORY, JSON.stringify(updated));
}

export async function removeFromSearchHistory(query: string): Promise<void> {
  const history = await getSearchHistory();
  const filtered = history.filter(
    (h) => h.toLowerCase() !== query.toLowerCase()
  );
  await AsyncStorage.setItem(KEYS.SEARCH_HISTORY, JSON.stringify(filtered));
}

export async function clearSearchHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.SEARCH_HISTORY);
}
