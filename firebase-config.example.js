/**
 * Example Firebase configuration (DO NOT include real credentials in source control)
 * Copy this file to `firebase-config.js` and replace placeholder values with
 * your project's credentials. Ensure `firebase-config.js` is added to .gitignore.
 */

const FIREBASE_CONFIG = {
    apiKey: "REPLACE_WITH_YOUR_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
    appId: "REPLACE_WITH_YOUR_APP_ID"
};

function validateFirebaseConfig() {
    if (!FIREBASE_CONFIG || FIREBASE_CONFIG.apiKey.includes("REPLACE_WITH")) {
        console.warn('Firebase example config loaded. Copy firebase-config.example.js to firebase-config.js and add real credentials.');
        return false;
    }
    return true;
}

// Export for consumers that import this file directly (browser global pattern used in repo)
if (typeof window !== 'undefined') {
    window.FIREBASE_CONFIG = FIREBASE_CONFIG;
}
