import { storage } from './storage';

const TOKEN_KEY = 'user_token';

/** Read token (undefined if none) */
export const getToken = (): string | undefined => {
  return storage.getString(TOKEN_KEY) ?? undefined;
};

/** Save token (sync) */
export const setToken = (token: string) => {
  storage.set(TOKEN_KEY, token);
};

/** Delete token */
export const clearToken = () => {
  storage.delete(TOKEN_KEY);
};
