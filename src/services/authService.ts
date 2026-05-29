let GoogleSignin: any = null;
try {
  GoogleSignin =
    require('@react-native-google-signin/google-signin').GoogleSignin;
} catch {}

import {supabase} from './supabase';

const DUMMY_EMAIL = 'demo@ecoreward.id';
const DUMMY_PASSWORD = 'password123';

function createDummySession() {
  return {
    user: {
      id: 'dummy-user-id',
      email: DUMMY_EMAIL,
    },
    session: {
      access_token: 'dummy-token',
      refresh_token: 'dummy-refresh',
      expires_at: Date.now() + 3600000,
      user: {
        id: 'dummy-user-id',
        email: DUMMY_EMAIL,
      },
    },
  };
}

let googleConfigured = false;

function ensureGoogleConfigured() {
  if (googleConfigured || !GoogleSignin) return;
  GoogleSignin.configure({
    webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
  googleConfigured = true;
}

export async function signInWithGoogle(): Promise<{user: any; session: any}> {
  if (!GoogleSignin) {
    throw new Error(
      'Google Sign-In is not available. Please install @react-native-google-signin/google-signin.',
    );
  }
  ensureGoogleConfigured();
  await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

  // Sign out first to force a fresh token request
  await GoogleSignin.signOut();
  const signInResult = await GoogleSignin.signIn();

  // v13+ signIn returns { type, data: { idToken, user, ... } }
  const idToken =
    (signInResult as any).data?.idToken || (signInResult as any).idToken;

  if (!idToken) {
    throw new Error(
      'No ID token present in Google sign-in result. ' +
      'Ensure GOOGLE_WEB_CLIENT_ID is set in .env',
    );
  }

  const {data, error} = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) throw error;
  return {user: data.user, session: data.session};
}

export async function signOut(): Promise<void> {
  ensureGoogleConfigured();
  if (GoogleSignin) {
    await GoogleSignin.signOut();
  }
  await supabase.auth.signOut();
}

export async function getCurrentSession() {
  const {data} = await supabase.auth.getSession();
  return data.session;
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{user: any; session: any}> {
  if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
    return createDummySession();
  }

  const {data, error} = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return {user: data.user, session: data.session};
}

export function onAuthStateChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
