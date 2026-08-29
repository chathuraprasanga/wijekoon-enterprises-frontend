const REFRESH_TOKEN_KEY = 'refreshToken';
const REFRESH_TOKEN_EXPIRY_KEY = 'refreshTokenExpiry';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const clearStoredRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_EXPIRY_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const wasRefreshTokenRemembered = () => localStorage.getItem(REFRESH_TOKEN_KEY) !== null;

export const persistRefreshToken = (token: string, rememberMe: boolean) => {
  clearStoredRefreshToken();
  if (rememberMe) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_EXPIRY_KEY, String(Date.now() + THIRTY_DAYS_MS));
  } else {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};

export const getStoredRefreshToken = (): string | null => {
  const remembered = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (remembered) {
    const expiry = Number(localStorage.getItem(REFRESH_TOKEN_EXPIRY_KEY));
    if (!expiry || Date.now() > expiry) {
      clearStoredRefreshToken();
      return null;
    }
    return remembered;
  }
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
};
