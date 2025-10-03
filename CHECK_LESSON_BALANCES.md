# How to Check Student Lesson Balances

## 📊 **In Firebase Console**

### **Step 1: Open Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on **Firestore Database** in the left sidebar

### **Step 2: View Lesson Balances Collection**
1. Find the `lessonBalances` collection
2. Each document ID = Student's User ID
3. Click on any document to see:

```
lessonBalances/{studentId}
├── studentId: "abc123"
├── totalLessons: 10        ← Total lessons ever purchased
├── usedLessons: 3          ← Lessons already taken
├── remainingLessons: 7     ← Lessons available
└── lastUpdated: Timestamp
```

### **Step 3: View Individual Student Balance**
- Click on a specific student document
- You'll see all their lesson information

---

## 🔍 **How Lesson Balances Work**

### **When Student Buys Lessons:**
```javascript
Payment: 5 lessons → 
lessonBalances updates:
  totalLessons: +5
  remainingLessons: +5
```

### **Example Flow:**
```
1. Student starts with: 0 lessons
2. Buys 5 lessons
   → totalLessons: 5
   → usedLessons: 0
   → remainingLessons: 5

3. Books 2 lessons
   (Note: Currently this doesn't decrease balance yet)
   → We'll need to add this logic

4. After completing 2 lessons:
   → totalLessons: 5
   → usedLessons: 2
   → remainingLessons: 3
```

---

## 📱 **In the App (Student Dashboard)**

Students can see their balance on the dashboard:

```
┌─────────────────────────┐
│ 📚 My Lesson Balance    │
├─────────────────────────┤
│ Total Purchased: 10     │
│ Lessons Used: 3         │
│ Remaining: 7 lessons    │
└─────────────────────────┘
```

---

## 🔧 **Current Implementation Status**

### ✅ **What's Working:**
1. **Balance Creation** - When student signs up
2. **Balance Update** - When student purchases lessons
3. **Balance Display** - On student dashboard
4. **Booking Creation** - Saves to `bookings` collection

### ⚠️ **What's Missing (To Do):**
1. **Decrease balance when lesson is completed** (not booked)
2. **Prevent booking if balance = 0**
3. **Track payment history** in separate collection

---

## 📝 **Example Queries (If You Want to Check Manually)**

### Check specific student balance:
```javascript
// In Firebase Console → Firestore → Run Query
Collection: lessonBalances
Document ID: {studentUserId}
```

### Check all students with lessons:
```javascript
// In Firebase Console → Firestore
Collection: lessonBalances
// Shows all students and their balances
```

### Check bookings for a student:
```javascript
Collection: bookings
Where: studentId == {studentUserId}
Order by: date
```

---

## 🎯 **Quick Check Steps:**

1. **After student buys 5 lessons:**
   - Go to `lessonBalances/{studentId}`
   - Should see: `totalLessons: 5`, `remainingLessons: 5`

2. **Check their bookings:**
   - Go to `bookings` collection
   - Filter by `studentId`
   - Count confirmed bookings

3. **Verify on dashboard:**
   - Log in as student
   - See balance card on dashboard

---

## 🚀 **Next Steps to Complete System:**

1. Add logic to prevent booking if `remainingLessons = 0`
2. Update `usedLessons` when lesson status changes to "completed"
3. Add payment history tracking
4. Show transaction history to students

---

**Now you can easily check student lesson balances in Firebase!** 📊✨




