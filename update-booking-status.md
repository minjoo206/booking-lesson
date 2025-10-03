# Update Booking Status in Firebase

## Current Issue
Hailey's booking (document ID: `7rp6gFzPz8DWWJgK8Ino`) has status `"cancelled"`, which is why it's not showing up in upcoming lessons.

## Solution
You need to update the booking status from `"cancelled"` to `"confirmed"` in Firebase.

## Steps to Fix:

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/project/booking-website-66194/firestore/data)
2. Navigate to `bookings` collection
3. Find document `7rp6gFzPz8DWWJgK8Ino`
4. Click on the document
5. Change the `status` field from `"cancelled"` to `"confirmed"`
6. Save the changes

### Option 2: Add className Field (Optional)
While you're in the Firebase Console, you can also add a `className` field:
1. In the same document (`7rp6gFzPz8DWWJgK8Ino`)
2. Add a new field:
   - **Field name:** `className`
   - **Field value:** `"Korean Conversation Lesson"` (or whatever you prefer)

## Expected Results After Update:

### Student Dashboard (`/dashboard`):
- **Lessons Booked:** Should show `1`
- **Upcoming Lessons:** Should show Hailey's lesson with minjoo

### Teacher Dashboard (`/teacher-dashboard`):
- **Upcoming Bookings:** Should show "Korean Conversation Lesson with Hailey K"

### Lessons Page (`/lessons`):
- Should show the lesson in the upcoming lessons list

## Current Booking Data:
```json
{
  "id": "7rp6gFzPz8DWWJgK8Ino",
  "studentId": "K77LoB2gHzTEt4FMBUn8L5vvk7u2",
  "studentEmail": "haileykim206@gmail.com",
  "studentName": "Hailey K",
  "teacherId": "XVcZhgJOtUeZ7vcvsQPodNyPW5I3",
  "teacherName": "minjoo",
  "date": "Monday, October 6, 2025",
  "time": "10:00 AM",
  "duration": 50,
  "status": "cancelled", // ← Change this to "confirmed"
  "currency": "CAD",
  "paymentAmount": 1,
  "meetingLink": "",
  "className": "Korean Conversation Lesson" // ← Add this field
}
```

After updating, both dashboards should show the lesson correctly!



