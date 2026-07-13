const raw = {
    appwriteUrl:                  import.meta.env.VITE_APPWRITE_URL,
    appwriteProjectId:            import.meta.env.VITE_APPWRITE_PROJECT_ID,
    appwriteDatabaseId:           import.meta.env.VITE_APPWRITE_DATABASE_ID,
    appwriteCollectionId:         import.meta.env.VITE_APPWRITE_COLLECTION_ID,
    appwriteBucketId:             import.meta.env.VITE_APPWRITE_BUCKET_ID,
    appwriteCommentsCollectionId: import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID,
    appwriteFollowsCollectionId:  import.meta.env.VITE_APPWRITE_FOLLOWS_COLLECTION_ID,
    geminiApiKey:                 import.meta.env.VITE_GEMINI_API_KEY,
};

// ── Dev-only sanity check ───────────────────────────────────────────────────
// If a value is missing, Vite's import.meta.env returns `undefined`, and the
// old code did String(undefined) -> the literal text "undefined". Appwrite
// then tries to fetch "undefined/v1/..." which the browser blocks/fails with
// the generic "Failed to fetch" error — very hard to debug without this log.
if (import.meta.env.DEV) {
    const missing = Object.entries(raw)
        .filter(([, value]) => !value || value === 'undefined')
        .map(([key]) => key);

    if (missing.length > 0) {
        console.error(
            `%c⚠️ Blogify config problem`,
            'font-weight:bold;color:#EC4899;',
            `\nThese .env variables are missing or empty: ${missing.join(', ')}` +
            `\n\n1. Make sure a file named exactly ".env" exists in the project root (not ".env.example").` +
            `\n2. Make sure each VITE_... value is filled in with no quotes around it.` +
            `\n3. RESTART the dev server after editing .env — Vite only reads it on startup ("npm run dev" again).`
        );
    }
}

const conf = {
    appwriteUrl:                  String(raw.appwriteUrl || ''),
    appwriteProjectId:            String(raw.appwriteProjectId || ''),
    appwriteDatabaseId:           String(raw.appwriteDatabaseId || ''),
    appwriteCollectionId:         String(raw.appwriteCollectionId || ''),
    appwriteBucketId:             String(raw.appwriteBucketId || ''),
    appwriteCommentsCollectionId: String(raw.appwriteCommentsCollectionId || ''),
    appwriteFollowsCollectionId:  String(raw.appwriteFollowsCollectionId || ''),
    geminiApiKey:                 String(raw.geminiApiKey || ''),
};

export default conf;
