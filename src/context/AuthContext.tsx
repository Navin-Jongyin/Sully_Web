import React, { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { ADMIN_AUTH_KEY } from '../constants';
import { auth, fetchAdminCredentials, googleProvider } from '../firebase';
import { syncUserToFirestore } from '../lib/sync-user-firestore';
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true',
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          await syncUserToFirestore(firebaseUser);
        } catch (err) {
          console.error('Failed to sync user to Firestore:', err);
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email.trim(), password);
  };

  const signOutGoogle = async () => {
    await signOut(auth);
  };

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
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOutGoogle,
        isAuthenticated,
        signIn,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
