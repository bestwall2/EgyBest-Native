import { QueryClient, QueryFunction } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Gets the base URL for the Express API server (e.g., "http://localhost:3000")
 * @returns {string} The API base URL
 */
export function getApiUrl(): string {
  // On web, use relative URL if we are running from the backend port
  if (typeof window !== "undefined") {
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

  if (!host) {
    // Fallback for web if EXPO_PUBLIC_DOMAIN is missing
    if (typeof window !== "undefined") {
      return `${window.location.origin}/`;
    }
    throw new Error("EXPO_PUBLIC_DOMAIN is not set");
  }

  // Ensure host doesn't have protocol
  const cleanHost = host.replace(/^https?:\/\//, "");
  const protocol =
    cleanHost.includes("localhost") || cleanHost.includes("127.0.0.1")
      ? "http"
      : "https";
  const url = new URL(`${protocol}://${cleanHost}`);

  return url.href;
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
    const baseUrl = getApiUrl();
    const joinedKey = queryKey.join("/") as string;
    const url = new URL(joinedKey, baseUrl);

    // Add language as query parameter for TMDB API calls
    if (joinedKey.includes("/api/tmdb/")) {
      const currentLang = (await AsyncStorage.getItem("user-language")) || "en";
      url.searchParams.append("language", currentLang);
    }

    if (pageParam) {
      url.searchParams.append("page", String(pageParam));
    }

    const res = await fetch(url, {
      // Credentials not needed for proxy
    });

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
