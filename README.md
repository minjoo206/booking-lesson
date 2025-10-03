# Lesson Booking Website

A modern web application for students to find teachers, purchase lesson packages, and book lessons. Built with React, TypeScript, Firebase, and Stripe.

## Features

### For Students
- **Dashboard**: View upcoming lessons and lesson balance
- **Lesson Packages**: Purchase 1, 5, or 10 lesson packages with Stripe
- **Teacher Discovery**: Browse available teachers and their schedules
- **Booking System**: Book lessons that automatically deduct from lesson balance
- **Lesson Management**: View lesson history and upcoming appointments

### For Teachers
- **Availability Management**: Set available time slots
- **Student Management**: View booked lessons and student information
- **Profile Management**: Update bio, subjects, and hourly rates

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Payments**: Stripe
- **Routing**: React Router
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Firebase project with Firestore enabled
- Stripe account for payment processing

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd booking-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication and Firestore
   - Copy your Firebase config to `.env`

5. Configure Stripe:
   - Create a Stripe account at https://stripe.com
   - Get your publishable key and add it to `.env`

6. Start the development server:
```bash
npm start
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── Login.tsx       # Login form
│   ├── Register.tsx    # Registration form
│   ├── StudentDashboard.tsx  # Student dashboard
│   ├── LessonPackages.tsx    # Lesson package purchase
│   └── TeacherAvailability.tsx # Teacher booking interface
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── firebase/           # Firebase configuration
│   └── config.ts       # Firebase setup
├── stripe/             # Stripe configuration
│   └── config.ts       # Stripe setup
├── types/              # TypeScript type definitions
│   └── index.ts        # Application types
└── App.tsx             # Main application component
```

## Database Schema

### Users Collection
```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  createdAt: Date;
}
```

### Teachers Collection
```typescript
{
  id: string;
  name: string;
  email: string;
  subjects: string[];
  bio: string;
  hourlyRate: number;
  availability: AvailabilitySlot[];
}
```

### Lessons Collection
```typescript
{
  id: string;
  studentId: string;
  teacherId: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  subject: string;
  notes?: string;
}
```

### Lesson Balances Collection
```typescript
{
  studentId: string;
  totalLessons: number;
  usedLessons: number;
  remainingLessons: number;
  lastUpdated: Date;
}
```

### Availability Collection
```typescript
{
  id: string;
  teacherId: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
  bookedBy?: string;
}
```

## Payment Flow

1. Student selects a lesson package (1, 5, or 10 lessons)
2. Stripe payment form is displayed
3. Payment is processed through Stripe
4. On success, lesson balance is updated in Firestore
5. Student can now book lessons with teachers

## Booking Flow

1. Student browses available teachers
2. Selects a teacher and views their availability
3. Chooses an available time slot
4. System checks if student has remaining lessons
5. If yes, lesson is booked and lesson balance is decremented
6. Availability slot is marked as booked

## Environment Variables

Create a `.env` file with the following variables:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to your preferred hosting platform (Vercel, Netlify, etc.)

3. Set up environment variables in your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.