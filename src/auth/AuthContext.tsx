import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useClerk, useUser } from '@clerk/react';
import {
  type AuthSession,
  type LoginInput,
  type SignupInput,
  type UserRole,
  guestSession,
  normalizeAuthUser,
} from './mockAuth';

type AuthContextValue = {
  session: AuthSession;
  login: (input?: LoginInput) => Promise<AuthSession | void>;
  signup: (input?: SignupInput) => Promise<AuthSession | void>;
  logout: () => Promise<AuthSession | void>;
  resetPassword: (email: string) => { ok: boolean; message: string };
  setRole: (role: UserRole) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const session = useMemo<AuthSession>(() => {
    if (!isLoaded || !isSignedIn || !user) {
      return guestSession;
    }

    const profile = ((user.unsafeMetadata as Record<string, unknown> | undefined)?.profile as Record<string, unknown> | undefined) ?? {};
    const normalizedUser = normalizeAuthUser({
      id: user.id,
      userId: user.id,
      fullName:
        (typeof profile.fullName === 'string' && profile.fullName.trim()) ||
        user.fullName ||
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.username ||
        'PackSure User',
      name:
        (typeof profile.fullName === 'string' && profile.fullName.trim()) ||
        user.firstName ||
        user.username ||
        user.fullName ||
        'PackSure User',
      email: user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? 'unknown@packsure.local',
      role: ((user.unsafeMetadata as Record<string, unknown> | undefined)?.role as UserRole | undefined) ??
        ((user.publicMetadata as Record<string, unknown> | undefined)?.role as UserRole | undefined) ??
        'manufacturer',
      company:
        (typeof profile.companyName === 'string' && profile.companyName.trim()) ||
        ((user.publicMetadata as Record<string, unknown> | undefined)?.company as string | undefined) ||
        'PackSure Workspace',
    });

    return {
      isAuthenticated: true,
      user: normalizedUser,
      role: normalizedUser?.role ?? 'manufacturer',
    };
  }, [isLoaded, isSignedIn, user]);

  const login = async (_input?: LoginInput) => session;

  const signup = async (_input?: SignupInput) => session;

  const logout = async () => {
    await signOut({ redirectUrl: '/' });
    return guestSession;
  };

  const resetPassword = (email: string) => ({
    ok: true,
    message: `Password reset instructions were prepared for ${email}.`,
  });

  const setRole = async (role: UserRole) => {
    if (!user) return;
    await user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        role,
      },
    });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      login,
      signup,
      logout,
      resetPassword,
      setRole,
    }),
    [session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
