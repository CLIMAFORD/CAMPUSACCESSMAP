# Firebase Backend - Quick Reference Card

## 🚀 5-Minute Setup Checklist

- [ ] Create Firebase project: https://console.firebase.google.com
- [ ] Create web app and copy config (6 values)
- [ ] Paste config into `firebase-config.js`
- [ ] Create Firestore database
- [ ] Publish security rules from `FIRESTORE_RULES.md`
- [ ] Test: Open app, report issue, check Firestore
- [ ] Done! 🎉

---

## 📊 Export Data in 3 Steps

1. Click **Analytics** tab (right sidebar)
2. Scroll to **Export Data** section
3. Click button:
   - 📊 **Export to Excel** → CSV file (Excel)
   - 💾 **Export to JSON** → Backup file
   - 📋 **Generate Report** → HTML report
   - 📈 **Export Analytics** → Statistics JSON

---

## 📁 Key Files

| File | Purpose | Location |
|------|---------|----------|
| `firebase-config.js` | Your credentials | Root folder |
| `js/firebase-export.js` | Export functions | `js/` folder |
| `FIREBASE_BACKEND_SETUP.md` | Setup guide | Read this! |
| `DATA_EXPORT_GUIDE.md` | Export tutorial | Reference |
| `FIRESTORE_RULES.md` | Security rules | For Firebase Console |

---

## 🔗 Important Links

| Resource | URL |
|----------|-----|
| Firebase Console | https://console.firebase.google.com |
| Firestore Database | https://console.firebase.google.com/u/0/project/_/firestore |
| Security Rules | https://console.firebase.google.com/u/0/project/_/firestore/rules |

---

## ⚙️ Configuration Template

### firebase-config.js

```javascript
const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

---

## ✅ Verification Steps

After setup:

1. **Open browser console** (`F12` → Console)
2. **Look for message:** ✅ Firebase initialized
3. **Report a test issue**
4. **Check Firestore:** Console → Firestore → issues collection
5. **Export to Excel** to verify data

---

## 📞 When Things Go Wrong

| Problem | Solution |
|---------|----------|
| "Not initialized" | Check firebase-config.js has real values (no "REPLACE_WITH") |
| "Permission denied" | Publish security rules in Firestore Console |
| "No issues to export" | Report at least one issue first |
| CSV won't open | Use Excel's UTF-8 import option |
| Data not syncing | Check internet connection and Firestore permissions |

---

## 🎯 What You Can Do Now

✅ Report accessibility issues with location & photo  
✅ See issues in real-time across all users  
✅ Export all data to Excel for analysis  
✅ Generate HTML reports for stakeholders  
✅ Track accessibility improvements over time  
✅ Access data offline and sync when online  

---

## 📚 Read These First

1. **FIREBASE_BACKEND_SETUP.md** ← Start here (15 min read)
2. **DATA_EXPORT_GUIDE.md** ← How to export (10 min read)
3. **FIRESTORE_RULES.md** ← Security (reference only)

---

## 💾 Firebase Database Structure

```
issues/
├── type: "blocked-ramp"
├── location: "Main Building"
├── severity: "high"
├── status: "pending"
├── createdAt: Timestamp
├── updatedAt: Timestamp
├── reporter: "Name"
└── auditTrail: [...]
```

---

## 🔐 Security by Default

- ✅ Public read (transparency)
- ✅ Authenticated create (quality control)
- ✅ Owner-only update (data integrity)
- ✅ Admin-only delete (compliance)
- ✅ Complete audit trail

---

## 📋 Excel Export Includes

- Issue ID
- Type & Severity
- Location & Building
- Description & Notes
- Status & Dates
- Reporter & Contact
- Coordinates (lat/lon)

Open in Excel → Analyze → Create Dashboard

---

## 🎓 Quick Tips

### Enable Firestore:
Firebase Console → Firestore Database → Create → Test Mode → Enable

### Publish Rules:
Firebase Console → Firestore Rules → Paste rules → Publish

### Test Export:
1. Report issue
2. Analytics tab → Export to Excel
3. Open CSV in Excel
4. Done!

### Debug Issues:
1. Press F12 (Developer Tools)
2. Click Console tab
3. Look for error messages
4. Check Network tab

---

## 🆘 Emergency Quick Fixes

**Firebase shows no connection:**
- Verify config in firebase-config.js
- Check Firestore database exists
- Check internet connection

**Export buttons don't work:**
- Report at least one issue first
- Reload page
- Check browser console for errors

**Data not in Firestore:**
- Check security rules are published
- Check network tab for API calls
- Try clearing browser cache

---

## 📞 Support Files

- **Setup Help:** FIREBASE_BACKEND_SETUP.md
- **Export Help:** DATA_EXPORT_GUIDE.md
- **Security Help:** FIRESTORE_RULES.md
- **Architecture:** ARCHITECTURE.md

---

**Status:** ✅ Ready to Use  
**Version:** 1.0  
**Updated:** January 2024

---

## Next Action

👉 **Read FIREBASE_BACKEND_SETUP.md now!**

It has step-by-step instructions with screenshots guidance. You'll be set up in 15 minutes.
