import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "cmp_access_token";

function isWeb() {
  return Platform.OS === "web";
}

export async function getStoredToken(): Promise<string | null> {
  try {
    if (isWeb()) {
      return typeof localStorage !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setStoredToken(token: string | null): Promise<void> {
  if (isWeb()) {
    if (typeof localStorage === "undefined") return;
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  if (!token) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}
