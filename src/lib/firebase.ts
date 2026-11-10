import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase app once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Provider with Google Workspace scopes for Sheets and Drive files
export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// Session-scoped cache for the access token to persist across page reloads
let cachedAccessToken: string | null = (() => {
  try {
    return sessionStorage.getItem('oriccia_oauth_token');
  } catch {
    return null;
  }
})();
let isSigningIn = false;

// Default admin email from app metadata
export const DEFAULT_ADMIN_EMAIL = 'rara.digitalcreations@gmail.com';

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const currentToken =
        cachedAccessToken ||
        (() => {
          try {
            return sessionStorage.getItem('oriccia_oauth_token');
          } catch {
            return null;
          }
        })();
      if (onAuthSuccess) onAuthSuccess(user, currentToken);
    } else {
      cachedAccessToken = null;
      try {
        sessionStorage.removeItem('oriccia_oauth_token');
      } catch {}
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      console.warn('Access token not immediately returned from credentialFromResult, checking user credentials');
    }

    cachedAccessToken = credential?.accessToken || null;
    if (cachedAccessToken) {
      try {
        sessionStorage.setItem('oriccia_oauth_token', cachedAccessToken);
      } catch {}
    }
    return { user: result.user, accessToken: cachedAccessToken || '' };
  } catch (error: any) {
    console.error('Error in Google Sign-In:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (!cachedAccessToken) {
    try {
      cachedAccessToken = sessionStorage.getItem('oriccia_oauth_token');
    } catch {}
  }
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  try {
    if (token) {
      sessionStorage.setItem('oriccia_oauth_token', token);
    } else {
      sessionStorage.removeItem('oriccia_oauth_token');
    }
  } catch {}
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  try {
    sessionStorage.removeItem('oriccia_oauth_token');
  } catch {}
};

export const isAuthorizedAdmin = (email: string | null | undefined, authorizedEmails: string[] = []): boolean => {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  const allAuthorized = [DEFAULT_ADMIN_EMAIL.toLowerCase(), ...authorizedEmails.map(e => e.toLowerCase().trim())];
  return allAuthorized.includes(normalized);
};
