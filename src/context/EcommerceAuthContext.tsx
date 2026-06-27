import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  ensureUserDocument,
  fetchUserProfile,
  onAuthStateChange,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
} from '../lib/firebase/auth';
import { mergeGuestCartIntoFirestore } from '../ecommerce/lib/mergeGuestCart';
import type { UserProfile } from '../ecommerce/types';

interface EcommerceAuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const EcommerceAuthContext = createContext<EcommerceAuthContextValue | null>(null);

export const EcommerceAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await fetchUserProfile(firebaseUser.uid);
        setProfile(p || (await ensureUserDocument(firebaseUser)));
        await mergeGuestCartIntoFirestore(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const u = await signUpWithEmail(email, password, displayName);
    setProfile(await fetchUserProfile(u.uid));
  };

  const signIn = async (email: string, password: string) => {
    const u = await signInWithEmail(email, password);
    setProfile(await fetchUserProfile(u.uid));
  };

  const signInGoogle = async () => {
    const u = await signInWithGoogle();
    setProfile(await fetchUserProfile(u.uid));
  };

  const signOut = async () => {
    await signOutUser();
    setUser(null);
    setProfile(null);
  };

  return (
    <EcommerceAuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signInGoogle,
        signOut,
        isAdmin: profile?.role === 'admin',
      }}
    >
      {children}
    </EcommerceAuthContext.Provider>
  );
};

export function useEcommerceAuth() {
  const ctx = useContext(EcommerceAuthContext);
  if (!ctx) throw new Error('useEcommerceAuth must be used within EcommerceAuthProvider');
  return ctx;
}
