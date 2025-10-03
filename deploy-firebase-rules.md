# Deploy Firebase Security Rules

## Issue
The student dashboard isn't showing lesson details because Firebase Firestore has default security rules that deny all reads and writes.

## Solution
You need to deploy the security rules I've created to allow authenticated users to access their data.

## Steps to Deploy Rules

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in your project (if not already done)
```bash
firebase init firestore
```
- Select your Firebase project
- Use the existing `firestore.rules` file I created
- Use the existing `firestore.indexes.json` file I created

### 4. Deploy the rules
```bash
firebase deploy --only firestore:rules
```

## What the Rules Do

The security rules I created allow:

1. **Users to access their own user document**
2. **Students to read/write their lesson balance**
3. **Students to read/write their own bookings**
4. **Teachers to read/write their teacher settings**
5. **Anyone to read teacher settings (for public booking pages)**
6. **Teachers to see bookings where they are the teacher**

## Alternative: Temporary Test Rules

If you want to test quickly, you can temporarily use these rules in the Firebase Console:

1. Go to Firebase Console → Firestore Database → Rules
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ WARNING: These rules allow any authenticated user to read/write any document. Only use for testing!**

## Check Current User Authentication

Make sure the user is properly authenticated by checking the browser console for:
- "StudentDashboard: Loading data for student [user-id] [email]"
- "StudentDashboard: Firebase db available: true"

If you see permission errors, the rules need to be deployed.



