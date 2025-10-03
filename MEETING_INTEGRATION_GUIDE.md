# 🎥 Meeting Platform Integration Guide

## 🎯 **Overview:**

To automatically create Google Meet or Zoom meetings, you need to:
1. **Set up OAuth credentials** for Google/Zoom
2. **Teacher authorizes the app** (one-time)
3. **System creates meetings automatically** when students book

## 📋 **Three Integration Options:**

### **Option 1: Google Meet (via Google Calendar API)** ⭐ RECOMMENDED

**How it works:**
1. Teacher clicks "Connect Google Meet" in settings
2. Google OAuth popup → Teacher signs in
3. App gets permission to create calendar events
4. When student books → System creates Calendar event with Meet link
5. Both teacher and student get email with Meet link

**Pros:**
- ✅ Free (no additional cost)
- ✅ Automatic meeting links
- ✅ Integrated with Gmail/Calendar
- ✅ Most teachers already have Google accounts
- ✅ Easy to use

**Cons:**
- ⚠️ Requires OAuth setup
- ⚠️ Teacher must authorize

---

### **Option 2: Zoom Integration**

**How it works:**
1. Teacher clicks "Connect Zoom" in settings
2. Zoom OAuth popup → Teacher signs in
3. App gets permission to create meetings
4. When student books → System creates Zoom meeting
5. Returns meeting link and password

**Pros:**
- ✅ Professional features (waiting room, recording, etc.)
- ✅ Familiar to many users
- ✅ Good for larger classes

**Cons:**
- ⚠️ Requires paid Zoom account for unlimited meetings
- ⚠️ More complex setup
- ⚠️ Additional API costs possible

---

### **Option 3: Custom URL** (Current Implementation)

**How it works:**
1. Teacher provides a fixed meeting link (e.g., personal Zoom room)
2. System uses this same link for all bookings
3. Manual process - teacher manages meetings

**Pros:**
- ✅ Simple - no OAuth needed
- ✅ Works immediately
- ✅ Teacher has full control

**Cons:**
- ⚠️ Same link for all students (less secure)
- ⚠️ Manual meeting management
- ⚠️ No automatic calendar events

## 🚀 **Recommended Implementation:**

For your Korean lesson platform, I recommend this priority:

1. **Start with Custom URL** (you already have this! ✅)
   - Teachers can use it immediately
   - Good for MVP/testing

2. **Add Google Meet OAuth** (next step)
   - Most teachers have Google accounts
   - Free and automatic
   - Professional

3. **Add Zoom later** (optional)
   - For teachers who prefer Zoom
   - Additional feature

## 📝 **Step-by-Step: Google Meet Integration**

### **Step 1: Set Up Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Korean Lesson Booking"
3. Enable **Google Calendar API**:
   - APIs & Services → Library
   - Search "Google Calendar API"
   - Click "Enable"

### **Step 2: Create OAuth Credentials**

1. APIs & Services → Credentials
2. Click "Create Credentials" → OAuth client ID
3. Configure consent screen:
   - User type: External
   - App name: "Korean Lesson Booking"
   - Support email: your email
   - Scopes: `https://www.googleapis.com/auth/calendar.events`
4. Create OAuth Client ID:
   - Application type: Web application
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:3000/oauth/google/callback`
     - `https://yourdomain.com/oauth/google/callback`
5. Save **Client ID** and **Client Secret**

### **Step 3: Add to .env**

```bash
# Google Calendar API (for Google Meet)
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_SECRET=your-client-secret
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/google/callback
```

### **Step 4: Teacher Authorization Flow**

**In Edit Booking Page:**
```
┌─────────────────────────────────────────┐
│ Meeting Room Settings                   │
│                                         │
│ ○ Google Meet (Recommended)             │
│   [Connect Google Account] ← Click     │
│                                         │
│ ○ Zoom                                  │
│   [Connect Zoom Account]                │
│                                         │
│ ○ Other (Custom URL)                    │
│   [Enter custom meeting URL]            │
└─────────────────────────────────────────┘
```

**When teacher clicks "Connect Google Account":**
1. Popup opens → Google sign-in
2. Teacher approves calendar access
3. System stores access token in Firebase
4. Button changes to: "✓ Google Meet Connected"

### **Step 5: Create Meeting When Student Books**

**Backend function (Firebase Cloud Function):**
```javascript
// When booking is created
const createGoogleMeetEvent = async (bookingData) => {
  // 1. Get teacher's Google access token from Firebase
  const teacherToken = await getTeacherGoogleToken(bookingData.teacherId);
  
  // 2. Create Calendar event with Google Meet
  const event = {
    summary: `Korean Lesson with ${bookingData.studentName}`,
    description: `Online Korean lesson`,
    start: {
      dateTime: bookingData.startTime,
      timeZone: 'America/Los_Angeles'
    },
    end: {
      dateTime: bookingData.endTime,
      timeZone: 'America/Los_Angeles'
    },
    attendees: [
      { email: bookingData.teacherEmail },
      { email: bookingData.studentEmail }
    ],
    conferenceData: {
      createRequest: {
        requestId: bookingData.id,
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    }
  };
  
  // 3. Insert event via Google Calendar API
  const response = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    resource: event,
    sendNotifications: true
  });
  
  // 4. Return Google Meet link
  return response.data.hangoutLink;
};
```

## 🔐 **Security & Token Storage:**

### **Firebase Structure:**
```
teacherOAuthTokens/
├── teacher123/
│   ├── googleAccessToken: "ya29.a0AfH6..."
│   ├── googleRefreshToken: "1//0gH..."
│   ├── googleTokenExpiry: 1640000000
│   ├── zoomAccessToken: "eyJh..."
│   └── zoomRefreshToken: "eyJh..."
```

### **Token Refresh:**
- Access tokens expire after 1 hour
- Use refresh token to get new access token
- Store refresh token securely in Firebase
- Auto-refresh before each meeting creation

## 💻 **Implementation Code Structure:**

### **Files to Create:**

1. **`src/services/googleMeet.ts`** (UPDATED)
   - OAuth flow functions
   - Create calendar event with Meet link
   - Token refresh logic

2. **`src/services/zoomMeet.ts`** (NEW)
   - Zoom OAuth flow
   - Create Zoom meeting
   - Token management

3. **`src/components/MeetingPlatformConnector.tsx`** (NEW)
   - UI for connecting Google/Zoom
   - OAuth popup handler
   - Connection status display

4. **Firebase Cloud Functions** (OPTIONAL but RECOMMENDED)
   - Handle OAuth token storage
   - Create meetings server-side
   - More secure than client-side

## 🎨 **Updated UI Flow:**

### **Edit Booking Page - Meeting Settings:**

```
┌─────────────────────────────────────────────────┐
│ 🎥 Meeting Room Settings                        │
│                                                 │
│ Choose your meeting platform                    │
│                                                 │
│ ● Google Meet (Recommended)                     │
│   ✓ Connected as teacher@gmail.com             │
│   [Disconnect]  [Test Connection]              │
│                                                 │
│ ○ Zoom                                          │
│   [Connect Zoom Account]                        │
│                                                 │
│ ○ Other (Custom URL)                            │
│   ┌─────────────────────────────────────────┐  │
│   │ https://meet.google.com/abc-defg-hij    │  │
│   └─────────────────────────────────────────┘  │
│                                                 │
│ ℹ️ When students book, a unique meeting link   │
│    will be created automatically and sent via  │
│    email to both you and the student.          │
└─────────────────────────────────────────────────┘
```

## 📊 **Complete Booking Flow with Auto-Meeting:**

### **Student Books a Lesson:**

1. **Student selects time slot** on teacher's booking page
2. **Student confirms booking** → Click "Book Lesson"
3. **System creates booking** in Firebase `bookings` collection
4. **System checks teacher's meeting preference:**
   
   **If Google Meet:**
   - Get teacher's Google access token
   - Create Calendar event with Meet link
   - Add both teacher and student as attendees
   - Google sends email invitations automatically
   
   **If Zoom:**
   - Get teacher's Zoom access token
   - Create Zoom meeting
   - Send meeting link via email
   
   **If Custom URL:**
   - Use teacher's provided URL
   - Send confirmation email with link

5. **Both receive confirmation:**
   - Teacher: Calendar event + email
   - Student: Booking confirmation + meeting link
   - Meeting link saved in booking document

### **Email Template:**
```
Subject: Your Korean Lesson is Confirmed! 🇰🇷

Hi John,

Your Korean lesson with Hailey Kim is confirmed!

📅 Date: Monday, January 15, 2024
🕐 Time: 10:00 AM - 10:50 AM (50 minutes)
🎥 Meeting Link: https://meet.google.com/abc-defg-hij

What to Bring:
- Notebook and pen
- Any questions you have
- Positive attitude! 😊

Looking forward to seeing you!

[Join Meeting] [Add to Calendar] [Reschedule]
```

## 🔧 **Technical Implementation Priority:**

### **Phase 1: MVP (Current)** ✅
- Custom URL option
- Manual meeting management
- Simple and works

### **Phase 2: Google Meet Integration** 🎯 NEXT
1. Set up Google Cloud project
2. Create OAuth flow component
3. Store tokens in Firebase
4. Create calendar events with Meet links
5. Auto-send invitations

### **Phase 3: Zoom Integration** 📅 LATER
1. Set up Zoom app
2. Create Zoom OAuth flow
3. Create meetings via API
4. Handle meeting passwords

### **Phase 4: Advanced Features** 🚀 FUTURE
- Meeting reminders (24hr, 1hr before)
- Automatic recording
- Meeting notes/summaries
- Integration with other platforms (Microsoft Teams, etc.)

## 💰 **Costs:**

### **Google Meet:**
- **Free** for personal Google accounts
- **Free** with Google Workspace (if teacher has it)
- No API usage fees
- ✅ **Best option for starting out**

### **Zoom:**
- **Free** plan: 40-minute limit on 1-on-1 calls
- **Pro** plan: $14.99/month (unlimited 1-on-1)
- API usage: Free for basic features
- ⚠️ Teachers need Zoom account

### **Custom URL:**
- **Free** (teacher uses their own account)
- ✅ **Best for immediate launch**

## 🎯 **My Recommendation for Your Platform:**

### **NOW (This Week):**
Keep current implementation with custom URL option - it works and teachers can start immediately!

### **NEXT (After Launch):**
Add Google Meet OAuth integration:
1. Most teachers have Gmail
2. Free and automatic
3. Professional experience
4. Easy to implement

### **LATER (Based on Demand):**
Add Zoom if teachers request it

## 📝 **Quick Start Guide:**

Want me to implement Google Meet OAuth integration? Here's what I'll do:

1. ✅ Create OAuth flow component
2. ✅ Add "Connect Google" button to edit page
3. ✅ Store access tokens securely in Firebase
4. ✅ Update booking flow to create Meet links
5. ✅ Add email notifications with meeting links
6. ✅ Handle token refresh automatically

Just say the word and I'll build it! 🚀

## 🔗 **Useful Links:**

- [Google Calendar API Docs](https://developers.google.com/calendar/api/guides/overview)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Zoom API Docs](https://marketplace.zoom.us/docs/api-reference/introduction)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)

**Ready to integrate! Let me know which option you'd like to implement first!** 🇰🇷💜




