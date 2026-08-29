const TOKEN_KEY = "three_way_match_token";

export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
  isAuthenticated: (): boolean => {
    return !!authStorage.getToken();
  },
};
