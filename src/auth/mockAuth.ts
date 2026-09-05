export type UserRole = 'manufacturer' | 'packer' | 'importer' | 'distributor' | 'retailer' | 'inspector' | 'other' | 'compliance_officer';

export type AuthUser = {
  id: string;
  userId: string;
  fullName: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
};

export type AuthSession = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  role: UserRole | null;
};

export type LoginInput = {
  email: string;
  password: string;
  role?: UserRole;
};

export type SignupInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  company?: string;
};

export const ROLE_OPTIONS: Array<{
  value: UserRole;
  label: string;
  description: string;
}> = [
  {
    value: 'manufacturer',
    label: 'Manufacturer',
    description: 'Manage product declarations and packaging validation.',
  },
  {
    value: 'packer',
    label: 'Packer',
    description: 'Coordinate packing and labeling workflows.',
  },
  {
    value: 'importer',
    label: 'Importer',
    description: 'Track imported goods and compliance across shipments.',
  },
  {
    value: 'distributor',
    label: 'Distributor',
    description: 'Coordinate distribution and supply chain compliance.',
  },
  {
    value: 'retailer',
    label: 'Retailer',
    description: 'Review product compliance at the retail touchpoint.',
  },
  {
    value: 'inspector',
    label: 'Inspector',
    description: 'Review packaging compliance and quality checks.',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other stakeholder role.',
  },
  {
    value: 'compliance_officer',
    label: 'Compliance Officer',
    description: 'Review violations and approve regulatory decisions.',
  },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  manufacturer: 'Manufacturer',
  packer: 'Packer',
  importer: 'Importer',
  distributor: 'Distributor',
  retailer: 'Retailer',
  inspector: 'Inspector',
  other: 'Other',
  compliance_officer: 'Compliance Officer',
};

export const ROLE_NAV_ITEMS: Record<UserRole, string[]> = {
  manufacturer: ['Dashboard', 'Scan Product', 'My Products', 'History', 'Reports'],
  packer: ['Dashboard', 'Scan Product', 'My Products', 'History', 'Reports'],
  importer: ['Dashboard', 'Scan Product', 'Imported Products', 'History', 'Reports'],
  distributor: ['Dashboard', 'Scan Product', 'History', 'Reports'],
  retailer: ['Dashboard', 'Scan Product', 'History', 'Reports'],
  inspector: ['Dashboard', 'Scan Product', 'Inspections', 'Violations', 'Reports'],
  other: ['Dashboard', 'Scan Product', 'History', 'Reports'],
  compliance_officer: ['Dashboard', 'Scan Product', 'Inspections', 'Violations', 'Reports'],
};

const STORAGE_KEY = 'packsure_frontend_auth_session';
const USER_STORE_KEY = 'packsure_frontend_users';

export const guestSession: AuthSession = {
  isAuthenticated: false,
  user: null,
  role: null,
};

function deriveFallbackName(value: string) {
  return value
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStoredUsers(): Record<string, AuthUser> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(USER_STORE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, AuthUser>) : {};
  } catch {
    return {};
  }
}

function persistStoredUsers(users: Record<string, AuthUser>) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(USER_STORE_KEY, JSON.stringify(users));
}

export function normalizeAuthUser(input: Partial<AuthUser> | null | undefined): AuthUser | null {
  if (!input) {
    return null;
  }

  const email = (input.email ?? '').trim();
  const fullName = (input.fullName ?? input.name ?? '').trim();
  const name = (input.name ?? fullName ?? (email ? deriveFallbackName(email) : '')).trim();
  const company = (input.company ?? 'PackSure Demo Workspace').trim() || 'PackSure Demo Workspace';
  const role = input.role ?? 'manufacturer';
  const userId = (input.userId ?? input.id ?? `user-${Date.now()}`).trim() || `user-${Date.now()}`;

  const normalizedUser: AuthUser = {
    id: userId,
    userId,
    fullName: fullName || name || (email ? deriveFallbackName(email) : userId),
    name: name || fullName || (email ? deriveFallbackName(email) : userId),
    email: email || 'unknown@packsure.local',
    role,
    company,
  };

  return normalizedUser;
}

export function getDisplayName(user?: Partial<AuthUser> | null): string {
  const safeUser = normalizeAuthUser(user);
  if (!safeUser) {
    return 'Operator';
  }

  const fullName = safeUser.fullName?.trim();
  if (fullName) {
    return fullName;
  }

  const name = safeUser.name?.trim();
  if (name) {
    return name;
  }

  const email = safeUser.email?.trim();
  if (email) {
    return deriveFallbackName(email);
  }

  return safeUser.userId || safeUser.id || 'Operator';
}

export function getStoredAuthSession(): AuthSession {
  if (typeof window === 'undefined') {
    return guestSession;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return guestSession;

    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.isAuthenticated) {
      return guestSession;
    }

    const normalizedUser = normalizeAuthUser(parsed.user);
    const normalizedSession: AuthSession = {
      ...parsed,
      user: normalizedUser,
      role: parsed.role ?? normalizedUser?.role ?? null,
    };

    return normalizedSession.isAuthenticated && normalizedSession.user ? normalizedSession : guestSession;
  } catch {
    return guestSession;
  }
}

export function persistAuthSession(session: AuthSession) {
  if (typeof window === 'undefined') {
    return;
  }

  if (session.isAuthenticated && session.user) {
    const normalizedUser = normalizeAuthUser(session.user);
    if (!normalizedUser) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const users = getStoredUsers();
    users[normalizedUser.email.toLowerCase()] = normalizedUser;
    persistStoredUsers(users);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...session, user: normalizedUser, role: session.role ?? normalizedUser.role }));
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function loginMock({ email, password, role = 'manufacturer' }: LoginInput): AuthSession {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail || !password.trim()) {
    throw new Error('Email and password are required to continue.');
  }

  const users = getStoredUsers();
  const existingUser = Object.values(users).find((user) => user.email.toLowerCase() === trimmedEmail);

  const user = normalizeAuthUser(
    existingUser ?? {
      id: `user-${Date.now()}`,
      userId: `user-${Date.now()}`,
      fullName: deriveFallbackName(trimmedEmail),
      name: deriveFallbackName(trimmedEmail),
      email: trimmedEmail,
      role,
      company: 'PackSure Demo Workspace',
    },
  );

  if (!user) {
    throw new Error('Unable to load user profile.');
  }

  if (!existingUser) {
    users[trimmedEmail] = user;
    persistStoredUsers(users);
  }

  const session: AuthSession = {
    isAuthenticated: true,
    user,
    role,
  };

  persistAuthSession(session);
  return session;
}

export function signupMock({ name, email, password, role, company }: SignupInput): AuthSession {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName || !trimmedEmail || !password.trim()) {
    throw new Error('Name, email, and password are required.');
  }

  const timestamp = Date.now();
  const user: AuthUser = {
    id: `user-${timestamp}`,
    userId: `user-${timestamp}`,
    fullName: trimmedName,
    name: trimmedName,
    email: trimmedEmail,
    role,
    company: company?.trim() || 'PackSure Demo Workspace',
  };

  const users = getStoredUsers();
  users[trimmedEmail] = user;
  persistStoredUsers(users);

  const session: AuthSession = {
    isAuthenticated: true,
    user,
    role,
  };

  persistAuthSession(session);
  return session;
}

export function logoutMock(): AuthSession {
  const session = guestSession;
  persistAuthSession(session);
  return session;
}

export function resetPasswordMock(email: string) {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    throw new Error('Enter your email to receive reset instructions.');
  }

  return {
    ok: true,
    message: `Password reset instructions were prepared for ${trimmedEmail}.`,
  };
}
