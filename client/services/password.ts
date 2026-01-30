import AsyncStorage from "@react-native-async-storage/async-storage";


// Correct raw GitHub URL to the data.json on the main branch
const REMOTE_URL =
  "https://raw.githubusercontent.com/bestwall2/EgyBest-Native/main/data.json";

let SecureStore: any = null;
try {
  // optional dependency; fallback to AsyncStorage if not available
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SecureStore = require("react-native-encrypted-storage");
} catch (e) {
  SecureStore = null;
}

const TOKEN_KEY = "__egyb_password_token";

export async function fetchRemotePassword(): Promise<string | null> {
  try {
    const res = await fetch(REMOTE_URL, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    // accept string or numeric password values and normalize to string
    if (
      json &&
      (typeof json.password === "string" || typeof json.password === "number")
    )
      return String(json.password);
    return null;
  } catch (e) {
    return null;
  }
}

async function secureGet(key: string) {
  if (SecureStore && SecureStore.getItem) {
    return await SecureStore.getItem(key);
  }
  return await AsyncStorage.getItem(key);
}

async function secureSet(key: string, value: string) {
  if (SecureStore && SecureStore.setItem) {
    return await SecureStore.setItem(key, value);
  }
  return await AsyncStorage.setItem(key, value);
}

async function secureRemove(key: string) {
  if (SecureStore && SecureStore.removeItem) {
    return await SecureStore.removeItem(key);
  }
  return await AsyncStorage.removeItem(key);
}

export async function getStoredToken(): Promise<string | null> {
  try {
    return await secureGet(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export async function setStoredToken(value: string): Promise<void> {
  try {
    await secureSet(TOKEN_KEY, value);
  } catch (e) {
    // ignore
  }
}

export async function clearStoredToken(): Promise<void> {
  try {
    await secureRemove(TOKEN_KEY);
  } catch (e) {
    // ignore
  }
}

export async function shouldPromptForPassword(): Promise<boolean> {
  const remote = await fetchRemotePassword();
  if (!remote) return false;
  const stored = await getStoredToken();
  if (!stored) return true;
  return stored !== remote;
}

export async function verifyAndStore(
  passwordAttempt: string,
): Promise<boolean> {
  const remote = await fetchRemotePassword();
  if (!remote) return false;
  if (passwordAttempt === remote) {
    await setStoredToken(remote);
    return true;
  }
  return false;
}

clearStoredToken();