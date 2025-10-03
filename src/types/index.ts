export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  dateOfBirth?: string;
  profileComplete?: boolean;
  createdAt: Date;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  bio: string;
  hourlyRate: number;
  availability: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  id: string;
  teacherId: string;
  startTime: Date | { seconds: number; nanoseconds: number };
  endTime: Date | { seconds: number; nanoseconds: number };
  isBooked: boolean;
  bookedBy?: string; // student ID
}

export interface Lesson {
  id: string;
  studentId: string;
  teacherId: string;
  startTime: Date | { seconds: number; nanoseconds: number };
  endTime: Date | { seconds: number; nanoseconds: number };
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  subject: string;
  notes?: string;
}

export interface LessonPackage {
  id: string;
  name: string;
  numberOfLessons: number;
  price: number;
  description: string;
}

export interface StudentLessonBalance {
  studentId: string;
  totalLessons: number;
  usedLessons: number;
  remainingLessons: number;
  lastUpdated: Date;
}

export interface Payment {
  id: string;
  studentId: string;
  packageId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  stripePaymentIntentId?: string;
  createdAt: Date;
}

export interface SavedTeacher {
  teacherId: string;
  teacherName: string;
  bookingLink: string;
  lastBooked?: Date;
  totalBookings: number;
  isFavorite?: boolean;
  lastVisited?: Date;
  visitCount?: number;
  savedAt: Date;
}
