import React, { useState } from 'react';
import { ADMIN_AUTH_KEY } from '../constants';
import { fetchAdminCredentials } from '../firebase';
import { AuthContext } from './auth-context';

export type AuthErrorCode = 'credentials-not-found' | 'invalid-credentials' | 'network';

export function createAuthError(code: AuthErrorCode): Error {
  const err = new Error(code);
  err.name = 'AuthError';
  return err;
}

export function isAuthError(err: unknown): err is Error {
  return err instanceof Error && err.name === 'AuthError';
}

export function getAuthErrorCode(err: Error): AuthErrorCode {
  return err.message as AuthErrorCode;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true',
  );

  const signIn = async (username: string, password: string) => {
    let creds: Record<string, unknown> | null;
    try {
      creds = await fetchAdminCredentials();
    } catch {
      throw createAuthError('network');
    }

    if (!creds) {
      throw createAuthError('credentials-not-found');
    }

    if (
      username !== String(creds.username || '') ||
      password !== String(creds.password || '')
    ) {
      throw createAuthError('invalid-credentials');
    }

    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    setIsAuthenticated(true);
  };

  const signOutUser = async () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading: false, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
