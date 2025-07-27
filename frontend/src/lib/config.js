// frontend/src/lib/config.js
export const CONFIG = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    GOOGLE_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,

    // This now points to our proxy, which is a best practice
    API_BASE_URL: '/api', 

    GOOGLE_SCOPES: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly'
    ].join(' ')
};