// src/lib/utils/auth.ts

/**
 * Retrieves the JWT token from localStorage.
 * @returns The JWT token string, or null if not found.
 */
export const getToken = (): string | null => {
  return localStorage.getItem('jwt_token');
};

/**
 * Stores a JWT token in localStorage.
 * @param token The JWT token string to store.
 */
export const setToken = (token: string): void => {
  localStorage.setItem('jwt_token', token);
};

/**
 * Removes the JWT token from localStorage.
 */
export const removeToken = (): void => {
  localStorage.removeItem('jwt_token');
};