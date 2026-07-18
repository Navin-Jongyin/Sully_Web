import { createContext } from 'react';
import type { User } from 'firebase/auth';

export interface AuthContextValue {
  /** Firebase Auth user (Google or email/password). */
  user: User | null;
  /** True while Firebase auth state is initializing. */
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOutGoogle: () => Promise<void>;
  /** Admin panel session (separate from Firebase Auth). */
  isAuthenticated: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
