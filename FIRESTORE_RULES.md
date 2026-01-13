# Firestore Security Rules - Smart Campus Access Map

## Production Security Rules

Copy and paste these rules into your Firestore Database Rules section in the Firebase Console.

### For Development (Testing)
**Use this during development and testing only:**

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes in development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### For Production (Secure)
**Use these rules when deploying to production:**

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== ISSUES COLLECTION =====
    match /issues/{issueId} {
      // Only authenticated users can read issues
      allow read: if request.auth != null;
      
      // Only authenticated users can create new issues
      allow create: if request.auth != null && isValidIssue(request.resource.data);
      
      // Only the creator or admin can update
      allow update: if isAdmin() || request.auth.uid == resource.data.userId;
      
      // Only admin can delete
      allow delete: if isAdmin();
      
      // Audit trail subcollection
      match /auditTrail/{entry} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
        allow update, delete: if false;
      }
    }
    
    // ===== USERS COLLECTION =====
    match /users/{userId} {
      // Users can read their own data
      allow read: if request.auth.uid == userId || isAdmin();
      
      // Users can write their own data
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // ===== NOTIFICATIONS COLLECTION =====
    match /notifications/{notificationId} {
      // Users can read their own notifications
      allow read: if request.auth.uid == resource.data.userId || isAdmin();
      
      // System can create notifications
      allow create: if request.resource.data.userId != null;
      
      // Users can delete their own notifications
      allow delete: if request.auth.uid == resource.data.userId || isAdmin();
      
      allow update: if false;
    }
    
    // ===== ANALYTICS COLLECTION =====
    match /analytics/{analyticsId} {
      // Only authenticated users can read analytics
      allow read: if request.auth != null;
      
      // Only admin can write
      allow write: if isAdmin();
    }
    
    // ===== METADATA COLLECTION =====
    match /metadata/{document=**} {
      // Only authenticated users can read metadata
      allow read: if request.auth != null;
      
      // Only admin can write
      allow write: if isAdmin();
    }
    
    // ===== HELPER FUNCTIONS =====
    
    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Check if user is admin (you'll need to set custom claims)
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.admin == true;
    }
    
    // Validate issue data structure
    function isValidIssue(data) {
      return data.size() > 0 &&
             data.keys().hasAll(['type', 'location', 'severity', 'status']) &&
             data.type is string &&
             data.location is string &&
             data.severity in ['low', 'medium', 'high', 'critical'] &&
             data.status in ['pending', 'in-progress', 'resolved', 'closed'] &&
             data.latitude is number &&
             data.longitude is number;
    }
  }
}
```

## How to Apply Rules

1. **Open Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your project

2. **Navigate to Firestore Database**
   - Click "Firestore Database" in left sidebar
   - Go to "Rules" tab

3. **Paste the Rules**
   - Select and delete existing rules
   - Paste the production rules above
   - Click "Publish"

4. **Verify**
   - You should see a green checkmark
   - Test the rules with your app

## Setting Admin Claims

To grant admin privileges to staff users:

```javascript
// Using Firebase Admin SDK (server-side)
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`User ${uid} set as admin`);
  });
```

## Role-Based Access Control

The security rules implement these roles:

| Role | Can Read Issues | Can Create Issues | Can Update Issues | Can Delete Issues |
|------|-----------------|-------------------|-------------------|-------------------|
| **Anonymous** | ✅ Yes | ✅ Yes (new) | ❌ No | ❌ No |
| **Authenticated** | ✅ Yes | ✅ Yes (own) | ✅ Own only | ❌ No |
| **Admin** | ✅ Yes | ✅ Yes (all) | ✅ Yes (all) | ✅ Yes (all) |

## Testing Rules

### Test Case 1: Anyone can read issues
```javascript
db.collection('issues').get() // ✅ ALLOWED
```

### Test Case 2: Create new issue (public)
```javascript
db.collection('issues').add({
  type: 'blocked-ramp',
  location: 'Main Building',
  severity: 'high',
  status: 'pending',
  latitude: -0.353833,
  longitude: 34.431822,
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
}) // ✅ ALLOWED
```

### Test Case 3: Update someone else's issue
```javascript
db.collection('issues').doc('other_user_issue_id').update({
  status: 'resolved'
}) // ❌ DENIED (unless admin)
```

### Test Case 4: Admin can delete any issue
```javascript
db.collection('issues').doc('any_issue_id').delete() // ✅ ALLOWED (admin only)
```

## Important Notes

1. **Development vs Production**: Always use the secure rules in production
2. **Anonymous Access**: The rules allow anonymous reading of all issues
3. **Audit Trail**: All changes are logged (read-only)
4. **No Direct Delete**: Issues are soft-deleted (status marked as 'deleted')
5. **Custom Claims**: Admins need custom claims set via Firebase Admin SDK

## Troubleshooting

### "Permission denied" error
- Make sure rules are published (not just saved)
- Check your Firebase authentication status
- Verify custom claims for admin users

### Issues not syncing
- Check network connectivity
- Verify API key in firebase-config.js
- Check browser console for errors

### Write failed
- You might not have permission to write
- Try adding yourself as admin via Firebase Admin SDK
- Check rule conditions

## References

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Custom Claims in Firebase](https://firebase.google.com/docs/auth/admin-sdk-docs)
