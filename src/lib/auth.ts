// Thin client for the Better Auth endpoints under /api/auth (server/src/auth.ts)
// plus a tiny session store that useAuth() subscribes to.
import { apiFetch, type Untyped } from "./api";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  twoFactorEnabled?: boolean | null;
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  session: { id: string; expiresAt: string };
}

type Listener = (session: AuthSession | null) => void;

let current: AuthSession | null = null;
let loaded = false;
let pending: Promise<AuthSession | null> | null = null;
const listeners = new Set<Listener>();

function set(session: AuthSession | null) {
  current = session;
  loaded = true;
  listeners.forEach((l) => l(session));
}

const post = <T = Untyped>(path: string, body: unknown = {}) => apiFetch<T>(`/api/auth${path}`, { method: "POST", json: body });

export const auth = {
  /** Current session, fetched once and then cached; pass refresh to reload it from the server. */
  async getSession(refresh = false): Promise<AuthSession | null> {
    if (loaded && !refresh) return current;
    pending ??= apiFetch<AuthSession | null>("/api/auth/get-session").then(({ data }) => {
      pending = null;
      set(data && data.user ? data : null);
      return current;
    });
    return pending;
  },

  peek: () => ({ session: current, loaded }),

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** The optional nickname travels as Better Auth's "name"; the server copies it into the profile. */
  async signUp(input: { email: string; password: string; nickname: string; altcha: string }) {
    return post("/sign-up/email", {
      email: input.email,
      password: input.password,
      name: input.nickname,
      altcha: input.altcha,
      callbackURL: "/dashboard",
    });
  },

  /** Returns twoFactorRequired when the account has 2FA and a TOTP code is needed. */
  async signIn(email: string, password: string) {
    const res = await post<{ twoFactorRedirect?: boolean }>("/sign-in/email", { email, password });
    if (res.error) return { error: res.error, twoFactorRequired: false };
    if (res.data?.twoFactorRedirect) return { error: null, twoFactorRequired: true };
    await auth.getSession(true);
    return { error: null, twoFactorRequired: false };
  },

  async verifyTotp(code: string, trustDevice = false) {
    const res = await post("/two-factor/verify-totp", { code, trustDevice });
    if (!res.error) await auth.getSession(true);
    return res;
  },

  async signOut() {
    await post("/sign-out");
    set(null);
  },

  requestPasswordReset: (email: string, altcha: string) =>
    post("/request-password-reset", { email, altcha, redirectTo: "/auth?reset=true" }),

  resetPassword: (token: string, newPassword: string) => post("/reset-password", { token, newPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    post("/change-password", { currentPassword, newPassword, revokeOtherSessions: true }),

  changeEmail: (newEmail: string) => post("/change-email", { newEmail, callbackURL: "/account" }),

  resendVerification: (email: string) => post("/send-verification-email", { email, callbackURL: "/dashboard" }),

  async deleteUser(password: string) {
    const res = await post("/delete-user", { password });
    if (!res.error) set(null);
    return res;
  },

  twoFactor: {
    /** Starts enrollment; 2FA becomes active after the first verifyTotp. */
    enable: (password: string) => post<{ totpURI: string; backupCodes: string[] }>("/two-factor/enable", { password }),
    verify: async (code: string) => {
      const res = await post("/two-factor/verify-totp", { code });
      if (!res.error) await auth.getSession(true);
      return res;
    },
    disable: async (password: string) => {
      const res = await post("/two-factor/disable", { password });
      if (!res.error) await auth.getSession(true);
      return res;
    },
  },
};
