# 🔥 **Firebase Setup Guide** 🔥

## 🚨 **CRITICAL: Fix Your Firebase Configuration**

Your Firebase is not working because of missing/incorrect configuration. Here's how to fix it:

---

## 📋 **Step 1: Fix Your .env File**

**Edit your `.env` file and replace `your_app_id` with the real App ID:**

```bash
# Current (WRONG):
REACT_APP_FIREBASE_APP_ID=1:210920613795:web:your_app_id

# Should be (CORRECT):
REACT_APP_FIREBASE_APP_ID=1:210920613795:web:YOUR_ACTUAL_APP_ID_HERE
```

**To get your real App ID:**
1. Go to: https://console.firebase.google.com/
2. Select project: `booking-website-66194`
3. Click the gear icon → **Project Settings**
4. Scroll to **Your apps** section
5. Copy the **App ID** (looks like `1:210920613795:web:abc123def456`)

---

## 🛠️ **Step 2: Enable Firebase Services**

### **Enable Authentication:**
1. Go to Firebase Console → **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** authentication
5. Click **Save**

### **Enable Firestore Database:**
1. Go to Firebase Console → **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location (choose closest to you)
5. Click **Done**

---

## 🔧 **Step 3: Update Firestore Security Rules**

**Go to Firestore → Rules and update to:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read lessons
    match /lessons/{lessonId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read availability
    match /availability/{availabilityId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read lesson balances
    match /lessonBalances/{balanceId} {
      allow read, write: if request.auth != null && request.auth.uid == balanceId;
    }
  }
}
```

---

## ✅ **Step 4: Test Your Setup**

After completing the above steps:

1. **Restart your development server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm start
   ```

2. **Visit:** `http://localhost:3000/firebase-test-connection`
   - This will test your Firebase connection
   - You should see green checkmarks if everything is working

3. **Try registering a user:**
   - Go to `/register`
   - Create a test account
   - Check Firebase Console → Authentication to see the user

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Firebase App not initialized"**
- **Solution:** Make sure your `.env` file has the correct App ID
- **Check:** All environment variables are properly named with `REACT_APP_` prefix

### **Issue 2: "Permission denied"**
- **Solution:** Update Firestore security rules (Step 3 above)
- **Check:** Authentication is enabled in Firebase Console

### **Issue 3: "Auth domain not authorized"**
- **Solution:** In Firebase Console → Authentication → Settings → Authorized domains
- **Add:** `localhost` to authorized domains

### **Issue 4: "Project not found"**
- **Solution:** Verify your Project ID is correct in `.env`
- **Check:** Project ID in Firebase Console matches your `.env`

---

## 📱 **Step 5: Test Your App**

Once Firebase is working:

1. **Authentication Test:**
   - Register a new user at `/register`
   - Login at `/login`
   - Check user appears in Firebase Console → Authentication

2. **Database Test:**
   - Go to `/dashboard` (after login)
   - Check data appears in Firebase Console → Firestore Database

3. **Payment Test:**
   - Go to `/payment` to see payment page demos
   - (Stripe integration ready when you want to add real payments)

---

## 🎉 **Success Indicators**

You'll know Firebase is working when:
- ✅ `/firebase-test-connection` shows all green checkmarks
- ✅ You can register and login users
- ✅ User data appears in Firebase Console
- ✅ Dashboard loads with mock data
- ✅ No console errors about Firebase

---

## 🆘 **Still Having Issues?**

If you're still having problems:

1. **Check Console Errors:** Open browser dev tools and look for Firebase errors
2. **Verify .env File:** Make sure all values are correct
3. **Restart Server:** Always restart after changing `.env`
4. **Check Firebase Console:** Verify services are enabled

**Your beautiful responsive UI is ready - just need to connect Firebase properly! 💜**

