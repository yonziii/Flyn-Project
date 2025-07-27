import { createBrowserClient } from '@supabase/ssr';
import { CONFIG } from './config.js';

const supabaseClient = createBrowserClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

export async function signInWithGoogle() {
    return await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            scopes: CONFIG.GOOGLE_SCOPES,
            queryParams: { access_type: 'offline', prompt: 'consent' },
            redirectTo: `${window.location.origin}/auth/callback`
        },
    });
}

export async function signOut() {
    await supabaseClient.auth.signOut();
}

export async function getSession() {
    const { data } = await supabaseClient.auth.getSession();
    return data.session;
}

export function onAuthStateChange(callback) {
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
        (event, session) => { callback(event, session); }
    );
    return () => subscription.unsubscribe();
}