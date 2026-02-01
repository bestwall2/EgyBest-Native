import { QueryClient, QueryFunction } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const TMDB_API_KEY = "90a823390bd37b5c1ba175bef7e2d5a8";
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/**
 * Gets the base URL for the Express API server (e.g., "http://localhost:3000")
 * @returns {string} The API base URL
 */
export function getApiUrl(): string {
  // On web, use relative URL if we are running from the backend port
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    const isReplit =
      hostname.includes("replit.dev") || hostname.includes("repl.co");

    if (
      window.location.port === "5000" ||
      (isReplit && !window.location.port)
    ) {
      // If we are in a production/deployment environment on Replit,
      // or explicitly on port 5000, we can use the current origin.
      return `${window.location.origin}/`;
    }
  }

  let host = process.env.EXPO_PUBLIC_DOMAIN;

  if (!host || host === ":5000") {
    // Fallback for web if EXPO_PUBLIC_DOMAIN is missing or malformed
    if (typeof window !== "undefined" && window.location) {
      return `${window.location.origin}/`;
    }
    // Default to localhost if absolutely nothing else
    host = "localhost:5000";
  }

  // Ensure host doesn't have protocol
  const cleanHost = host.replace(/^https?:\/\//, "");
  const protocol = "http";
  try {
    const url = new URL(`${protocol}://${cleanHost}`);
    return url.href;
  } catch {
    return "/";
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, pageParam }) => {
    let url: URL;
    const joinedKey = queryKey.join("/") as string;

    if (
      joinedKey.startsWith("/api/tmdb/") ||
      joinedKey.startsWith("api/tmdb/")
    ) {
      const tmdbPath = joinedKey.replace(/^(\/)?api\/tmdb\//, "");
      url = new URL(`${TMDB_BASE_URL}/${tmdbPath}`);
      url.searchParams.append("api_key", TMDB_API_KEY);

      const currentLang = (await AsyncStorage.getItem("user-language")) || "ar";
      url.searchParams.append("language", currentLang);
    } else {
      const baseUrl = getApiUrl();
      url = new URL(joinedKey, baseUrl);
    }

    if (pageParam) {
      url.searchParams.append("page", String(pageParam));
    }

    const res = await fetch(url);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
