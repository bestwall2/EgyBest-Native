import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * services/password.ts
 * Replaced fetchRemotePassword with cache-busting and safer checks.
 */

const REMOTE_URL =
  "https://raw.githubusercontent.com/bestwall2/EgyBest-Native/main/data.json";
const TOKEN_KEY = "__egyb_password_token";

let SecureStore: any = null;

try {
  // optional encrypted storage

  SecureStore = require("react-native-encrypted-storage");
} catch (e) {
  SecureStore = null;
}

/**
 * Fetch remote JSON with cache-busting so we always get the latest data.
 * Returns { password, getCode } or null on failure.
 */
export async function fetchRemotePassword(): Promise<{
  password: string;
  getCode?: string;
} | null> {
  try {
    // append timestamp to bypass CDN caches
    const url = `${REMOTE_URL}${REMOTE_URL.includes("?") ? "&" : "?"}t=${Date.now()}`;

    const res = await fetch(url, {
      method: "GET",
      // ask intermediate caches / browsers to not serve cached content
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      // React Native fetch supports "cache": "no-store" in some environments — include if available
      // @ts-ignore
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn("[fetchRemotePassword] non-ok response:", res.status);
      return null;
    }

    const json = await res.json();
    if (!json) return null;

    // Accept numeric or string password, normalize to string
    if (
      json.password !== undefined &&
      (typeof json.password === "string" || typeof json.password === "number")
    ) {
      return {
        password: String(json.password).trim(),
        getCode: typeof json.GETCODE === "string" ? json.GETCODE : undefined,
      };
    }

    return null;
  } catch (err) {
    console.warn("[fetchRemotePassword] error:", err);
    return null;
  }
}

/* ---------- secure storage helpers (encryptedStorage fallback) ---------- */
async function secureGet(key: string): Promise<string | null> {
  try {
    if (SecureStore?.getItem) {
      const v = await SecureStore.getItem(key);
      return v ? String(v) : null;
    }
    const v = await AsyncStorage.getItem(key);
    return v;
  } catch (e) {
    console.warn("[secureGet] error", e);
    return null;
  }
}

async function secureSet(key: string, value: string): Promise<void> {
  try {
    if (SecureStore?.setItem) {
      await SecureStore.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.warn("[secureSet] error", e);
  }
}

async function secureRemove(key: string): Promise<void> {
  try {
    if (SecureStore?.removeItem) {
      await SecureStore.removeItem(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn("[secureRemove] error", e);
  }
}

/* ---------- exported token helpers ---------- */
export async function getStoredToken(): Promise<string | null> {
  const v = await secureGet(TOKEN_KEY);
  return v ? String(v).trim() : null;
}

export async function setStoredToken(value: string): Promise<void> {
  // store the normalized (trimmed) password
  await secureSet(TOKEN_KEY, String(value).trim());
}

export async function clearStoredToken(): Promise<void> {
  await secureRemove(TOKEN_KEY);
}

/* ---------- core logic ---------- */

/**
 * Should we prompt the user for password?
 * Returns true if remote password exists and stored token doesn't match it.
 * If fetching remote fails, returns false (do not prompt) — you can change this behavior if you prefer stricter checks.
 */
export async function shouldPromptForPassword(): Promise<boolean> {
  try {
    const remote = await fetchRemotePassword();
    if (!remote || !remote.password) {
      // couldn't fetch remote or remote password is empty; do not prompt.
      return false;
    }

    const stored = await getStoredToken();

    // compare trimmed strings safely
    const remotePwd = String(remote.password).trim();
    const storedPwd = stored ? String(stored).trim() : null;

    return storedPwd !== remotePwd;
  } catch (e) {
    console.warn("[shouldPromptForPassword] error", e);
    return false;
  }
}

/**
 * Verify the provided password against the remote password (fresh fetch)
 * If matches, store the remote password locally and return true.
 */
export async function verifyAndStore(
  passwordAttempt: string,
): Promise<boolean> {
  try {
    const remote = await fetchRemotePassword();
    if (!remote) return false;

    const remotePwd = remote.password ? String(remote.password).trim() : "";
    const attempt = passwordAttempt ? String(passwordAttempt).trim() : "";

    if (attempt === remotePwd) {
      await setStoredToken(remotePwd);
      return true;
    }
    return false;
  } catch (e) {
    console.warn("[verifyAndStore] error", e);
    return false;
  }
}
