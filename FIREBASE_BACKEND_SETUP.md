# Firebase Backend Setup Guide - Smart Campus Access Map

## Overview

This guide will help you set up a complete Firebase backend for your Smart Campus Access Map. Once configured, you'll be able to:

✅ Store all reported issues in the cloud  
✅ Sync data in real-time across users  
✅ Export collected data to Excel for analysis  
✅ Generate analytics reports  
✅ Access data offline and sync when online  
✅ Set up role-based access control  

**Estimated Setup Time:** 15-20 minutes

---

## Step 1: Create a Firebase Project

### 1.1 Go to Firebase Console

1. Open https://console.firebase.google.com
2. Sign in with your Google account (create one if needed)

### 1.2 Create a New Project

1. Click **"Create project"** button
2. **Project name:** `Smart Campus Access Map`
3. Click **Continue**
4. **Enable Google Analytics:** Uncheck (optional, not needed for MVP)
5. Click **Create project**
6. **Wait 1-2 minutes** for Firebase to initialize

You'll see: ✅ **"Your new Cloud project is ready"**

---

## Step 2: Create a Web App

### 2.1 Register Your Web App

1. In Firebase Console, click **Web icon** `</>`
2. **App nickname:** `Smart Campus Web`
3. **Check:** "Also set up Firebase Hosting" (optional, for future deployment)
4. Click **Register app**

### 2.2 Copy Your Firebase Config

You'll see a configuration block like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "smart-campus-abc123.firebaseapp.com",
  projectId: "smart-campus-abc123",
  storageBucket: "smart-campus-abc123.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

**Copy this entire block** - you'll need it next.

---

## Step 3: Update Firebase Configuration File

### 3.1 Edit firebase-config.js

1. **Open** `firebase-config.js` in your project
2. **Replace the placeholder values** with your actual Firebase config:

```javascript
const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY_HERE",  // ← Replace with your apiKey
    authDomain: "YOUR_AUTH_DOMAIN",  // ← Replace
    projectId: "YOUR_PROJECT_ID",  // ← Replace
    storageBucket: "YOUR_STORAGE_BUCKET",  // ← Replace
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",  // ← Replace
    appId: "YOUR_APP_ID"  // ← Replace
};
```

### 3.2 Example

If your Firebase config is:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD_X1234567890abcdefg",
  authDomain: "campus-app-xyz.firebaseapp.com",
  projectId: "campus-app-xyz",
  storageBucket: "campus-app-xyz.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:abc123def456"
};
```

Then update your `firebase-config.js` to:
```javascript
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyD_X1234567890abcdefg",
    authDomain: "campus-app-xyz.firebaseapp.com",
    projectId: "campus-app-xyz",
    storageBucket: "campus-app-xyz.appspot.com",
    messagingSenderId: "987654321098",
    appId: "1:987654321098:web:abc123def456"
};
```

3. **Save the file**

---

## Step 4: Enable Firestore Database

### 4.1 Create Firestore Database

1. In **Firebase Console**, click **Firestore Database** (left sidebar)
2. Click **Create database**
3. **Location:** Select closest region to your users
4. **Security rules:** Choose **Start in test mode** (for development)
5. Click **Enable**

⏳ **Wait 1-2 minutes** for Firestore to initialize

You'll see: ✅ **"Firestore Database is ready"**

### 4.2 Verify Collections

After initialization, you should see an empty database. The app will create these collections automatically:

```
issues/          ← User-reported accessibility issues
  └─ {issueId}
     ├── type: "blocked-ramp"
     ├── location: "Main Building"
     ├── severity: "high"
     └── status: "pending"

notifications/   ← System notifications
users/           ← User profiles (optional)
analytics/       ← Analytics data (optional)
```

---

## Step 5: Set Firestore Security Rules

### 5.1 Update Security Rules

1. In **Firestore Database**, go to **Rules** tab
2. **Delete** the test rules (the blue highlighted code)
3. **Copy** the entire rule set from [FIRESTORE_RULES.md](FIRESTORE_RULES.md#for-production-secure)
4. **Paste** into the Rules editor
5. Click **Publish**

✅ You should see: **"Rules updated successfully"**

### 5.2 What These Rules Do

- ✅ Anyone can **read** all issues (public transparency)
- ✅ Anyone can **create** new issues (open reporting)
- ✅ Only creators can **update** their own issues
- ✅ Only admins can **delete** issues
- ✅ All changes are **logged** (audit trail)

---

## Step 6: Test Firebase Connection

### 6.1 Open Your App

1. **Open** `index.html` in your browser
2. **Open** Browser Developer Tools: `F12` → **Console** tab
3. **Reload** the page

### 6.2 Check Console for Firebase Message

You should see:

```
✅ Firebase configuration loaded
✅ Firebase initialized
📦 Initializing Hybrid Storage...
✅ Using Firebase + Local Storage (Hybrid Mode)
```

If you see errors, check:
- [ ] All 6 config values are correctly copied (no "REPLACE_WITH" text)
- [ ] No typos in the config values
- [ ] Firestore database is enabled (not just project created)

---

## Step 7: Test Data Collection

### 7.1 Report an Issue

1. Click **Report Issue** tab
2. Fill out the form:
   - **Issue Type:** Select an option
   - **Location:** Enter a building name
   - **Description:** Write something
   - **Severity:** Select level
3. Click **Submit Report**

### 7.2 Verify in Firebase Console

1. Go to **Firebase Console**
2. Click **Firestore Database**
3. You should see a new collection called **`issues`**
4. Click to expand and see your reported issue

✅ **Data is being saved to Firebase!**

---

## Step 8: Export Data to Excel

### 8.1 Use Export Feature

1. Click **Analytics** tab
2. Scroll down to **Export Data** section
3. Click **Export to Excel**
4. Your browser will download a CSV file

### 8.2 Open in Excel

1. **Open** the downloaded CSV file in Excel
2. You'll see columns like:
   - Issue ID
   - Type
   - Location
   - Description
   - Severity
   - Status
   - Created Date
   - Reporter

### 8.3 Export Options

You have multiple export formats:

| Button | Format | Use Case |
|--------|--------|----------|
| **Export to Excel** | CSV | Open in Excel for analysis |
| **Export to JSON** | JSON | Data backup and archiving |
| **Generate Report** | HTML | Share with stakeholders |
| **Export Analytics** | JSON | Statistical analysis |

---

## Step 9: Enable Admin Panel (Optional)

To grant admin access to maintenance staff:

### 9.1 Using Firebase Admin SDK

If you want staff to delete/manage issues:

```bash
# Using Firebase CLI (requires Node.js installed)
npm install -g firebase-tools
firebase login
firebase functions:config:set admin.emails="staff@campus.edu"
```

Or use Firebase Console to set custom claims manually.

---

## Step 10: Deploy to Production

When ready to go live:

### 10.1 Update Security Rules

Change from "test mode" to production rules:
- See [FIRESTORE_RULES.md](FIRESTORE_RULES.md#for-production-secure)

### 10.2 Enable Authentication (Optional)

For sensitive data:
1. **Firebase Console** → **Authentication**
2. **Sign-in method** → Enable "Anonymous" or "Email/Password"

### 10.3 Set Up Backups

1. **Firebase Console** → **Backups** (if available in your region)
2. Enable automatic daily backups

---

## Common Issues & Troubleshooting

### ❌ "Permission denied" when reporting issues

**Solution:**
- Check Firestore Rules are published (not just saved)
- Verify all 6 config values have no "REPLACE_WITH" text
- Refresh browser

### ❌ "Firebase not initialized" in console

**Solution:**
- Verify API key is active:
  - Firebase Console → **Project Settings** → **API keys**
  - Check **Firestore API** is enabled
- Check internet connection

### ❌ Data not appearing in Firestore

**Solution:**
- Check Console for JavaScript errors (`F12` → Console)
- Verify Firestore database is created (not just project)
- Check network tab - should see requests to `firestore.googleapis.com`

### ❌ Export buttons not working

**Solution:**
- Make sure you have at least one issue reported
- Check browser console for errors
- Try a different browser

### ❌ Offline mode showing old data

**Solution:**
- This is by design - app works offline and syncs when online
- To reset: Clear browser cache (`Ctrl+Shift+Delete`)

---

## Next Steps

### For Development:

1. ✅ Test reporting and exporting
2. ✅ Verify data appears in Firebase Console
3. ✅ Test with multiple browsers/devices
4. ✅ Check offline functionality

### For Production:

1. Update Firestore Rules (see Step 5)
2. Set up Firebase Hosting (optional)
3. Enable Authentication (for sensitive data)
4. Configure Backups
5. Set up Monitoring & Alerts
6. Train staff on data export

---

## Useful Firebase Console Links

Once your project is created, bookmark these:

- **Firestore Database:** https://console.firebase.google.com/u/0/project/_/firestore/data
- **Security Rules:** https://console.firebase.google.com/u/0/project/_/firestore/rules
- **Backups:** https://console.firebase.google.com/u/0/project/_/firestore/backups
- **Analytics:** https://console.firebase.google.com/u/0/project/_/analytics

(Replace `_` with your actual project ID)

---

## Key Features Now Enabled

### ☁️ Cloud Storage
- All issues stored permanently in Firestore
- Automatic backups
- Accessible from anywhere

### 📱 Real-Time Sync
- Multiple users see updates instantly
- No manual refresh needed
- Works across devices

### 📊 Data Export
- Download all data as Excel/CSV
- Generate analytics reports
- Archive historical data

### 🔒 Security
- Role-based access control
- Audit trails for all changes
- Rules prevent unauthorized access

### 🌐 Offline Support
- App works without internet
- Changes sync when back online
- No data loss

---

## Support & Resources

### Firebase Documentation
- [Firestore Getting Started](https://firebase.google.com/docs/firestore/quickstart)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Authentication](https://firebase.google.com/docs/auth)

### Your Project
- **Local Setup:** See `README.md`
- **Security Rules:** See `FIRESTORE_RULES.md`
- **Features:** See `ARCHITECTURE.md`

---

## Final Checklist

Before considering setup complete:

- [ ] Firebase project created
- [ ] Web app registered
- [ ] Config values copied to `firebase-config.js`
- [ ] Firestore database enabled
- [ ] Security rules published
- [ ] Firebase initialized (console shows ✅)
- [ ] Can report an issue
- [ ] Issue appears in Firestore
- [ ] Can export to Excel
- [ ] Offline data syncs when online

✅ **You're all set! Your Firebase backend is ready to use.**
