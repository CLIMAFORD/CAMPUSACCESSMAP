/**
 * Firebase Configuration
 * 
 * IMPORTANT: Replace the configuration values with your actual Firebase project credentials
 * Get these from: Firebase Console → Project Settings → Your apps
 * 
 * Instructions:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project or select existing
 * 3. Enable Firestore Database
 * 4. Enable Realtime Database (optional, for faster real-time sync)
 * 5. Copy your web app configuration
 * 6. Replace PLACEHOLDER values below
 * 7. Update security rules in Firebase Console
 */

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBVBL7IBMy0QVdD-E3jKPIMXWYHQHJPGYY",
    authDomain: "smart-campus-access-map.firebaseapp.com",
    projectId: "smart-campus-access-map",
    storageBucket: "smart-campus-access-map.firebasestorage.app",
    messagingSenderId: "982905245198",
    appId: "1:982905245198:web:42b6cdb809adb547f9365f"
};

/**
 * Validate Firebase configuration
 */
function validateFirebaseConfig() {
    const hasPlaceholder = FIREBASE_CONFIG.apiKey.includes("xxxxxxxxxxx");
    if (hasPlaceholder) {
        console.error('❌ Firebase configuration not set up. See firebase-config.js for instructions.');
        console.warn('⚠️  Running in local-only mode. Firebase sync disabled.');
        return false;
    }
    console.log('✅ Firebase configuration loaded');
    return true;
}

// Auto-validate on load
const FIREBASE_ENABLED = validateFirebaseConfig();
