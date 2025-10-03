# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "lesson-booking-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

## Step 3: Set up Firestore Database

1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

## Step 4: Get Firebase Configuration

1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Enter app nickname (e.g., "lesson-booking-web")
6. Click "Register app"
7. Copy the Firebase configuration object

## Step 5: Update Environment Variables

Replace the values in your `.env` file with your Firebase config:

```env
REACT_APP_FIREBASE_API_KEY=your_actual_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## Step 6: Set up Firestore Security Rules

1. Go to "Firestore Database" → "Rules"
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Students can read/write their own lesson balance
    match /lessonBalances/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Students can read/write their own lessons
    match /lessons/{lessonId} {
      allow read, write: if request.auth != null && 
        (resource.data.studentId == request.auth.uid || 
         resource.data.teacherId == request.auth.uid);
    }
    
    // Anyone can read teachers and availability
    match /teachers/{teacherId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == teacherId;
    }
    
    match /availability/{slotId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Payments are read-only for students
    match /payments/{paymentId} {
      allow read: if request.auth != null && resource.data.studentId == request.auth.uid;
      allow write: if request.auth != null && request.auth.uid == resource.data.studentId;
    }
  }
}
```

3. Click "Publish"

## Step 7: Test the Connection

1. Restart your React app: `npm start`
2. Try registering a new account
3. Check Firebase Console → Authentication to see if user was created
4. Check Firestore Database to see if user document was created

## Troubleshooting

- **Authentication errors**: Make sure Email/Password is enabled
- **Firestore errors**: Check security rules and database location
- **CORS errors**: Make sure your domain is added to Firebase authorized domains
- **Environment variables**: Restart the dev server after changing .env file
