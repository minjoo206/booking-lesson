import { collection, doc, updateDoc, getDocs, query, where, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { format } from 'date-fns';

// Helper function to extract date and time from startAt timestamp
const formatBookingDateTime = (startAt: any): { date: string; time: string } => {
  let startDate: Date;
  
  if (startAt && startAt.toDate) {
    startDate = startAt.toDate();
  } else if (startAt) {
    startDate = new Date(startAt);
  } else {
    return { date: 'No date', time: 'No time' };
  }
  
  return {
    date: format(startDate, 'EEEE, MMMM d, yyyy'),
    time: format(startDate, 'h:mm a')
  };
};

// Generate unique booking reference number
export const generateBookingReference = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `BK-${timestamp}-${random}`.toUpperCase();
};

// New unified booking schema based on updated requirements
export interface UnifiedBooking {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  
  // Use timestamps instead of date/time strings
  startAt: any; // Firestore timestamp
  endAt: any;   // Firestore timestamp
  duration: number; // minutes
  
  meetingLink: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'rescheduled';
  cancelledAt?: any; // Firestore timestamp
  rescheduleOf?: string; // bookingId of original, if rescheduled
  slotId?: string; // if using teacherSlots
  
  bookingType: 'flexible' | 'fixed';
  currency: string;
  paymentAmount: number;
  bookingPageTitle?: string; // The lesson title from teacher's booking page
  
  createdAt: any; // Firestore timestamp
  updatedAt?: any; // Firestore timestamp
}

// Unified date format conversion function
export const normalizeDateString = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    console.log('Normalizing date string:', dateString);
    
    // If it's already in "Monday, October 6, 2025" format, convert to ISO
    if (dateString.includes(',')) {
      const dateMatch = dateString.match(/(\w+), (\w+) (\d+), (\d+)/);
      if (dateMatch) {
        const [, , monthName, day, year] = dateMatch;
        console.log('Parsed date parts:', { monthName, day, year });
        const monthMap: { [key: string]: string } = {
          'January': '01', 'February': '02', 'March': '03', 'April': '04',
          'May': '05', 'June': '06', 'July': '07', 'August': '08',
          'September': '09', 'October': '10', 'November': '11', 'December': '12'
        };
        const month = monthMap[monthName];
        if (month) {
          const result = `${year}-${month}-${day.padStart(2, '0')}`;
          console.log('Normalized result:', result);
          
          // Verify the result by parsing it back
          const verifyDate = new Date(result);
          console.log('Verification - parsed back to:', verifyDate.toISOString().split('T')[0]);
          
          return result;
        }
      }
    }
    
    // If it's already in ISO format or other format, try to parse and convert
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const result = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      console.log('Date parsed result:', result);
      return result;
    }
    
    console.log('Could not parse date, returning as-is:', dateString);
    return dateString; // Return as-is if can't parse
  } catch (error) {
    console.error('Error normalizing date string:', error);
    return dateString;
  }
};

// Unified function to get all existing bookings for a teacher
export const getTeacherBookings = async (teacherId: string): Promise<UnifiedBooking[]> => {
  if (!db) return [];
  
  try {
    console.log('getTeacherBookings: Fetching bookings for teacher ID:', teacherId);
    
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('teacherId', '==', teacherId),
      where('status', 'in', ['upcoming', 'completed'])
    );
    
    const querySnapshot = await getDocs(q);
    console.log('getTeacherBookings: Found', querySnapshot.docs.length, 'bookings for teacher', teacherId);
    
    const bookings = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        teacherId: data.teacherId,
        teacherName: data.teacherName,
        studentId: data.studentId,
        studentName: data.studentName,
        studentEmail: data.studentEmail,
        startAt: data.startAt,
        endAt: data.endAt,
        duration: data.duration,
        meetingLink: data.meetingLink || '',
        status: data.status,
        cancelledAt: data.cancelledAt,
        rescheduleOf: data.rescheduleOf,
        slotId: data.slotId,
        bookingType: data.bookingType || 'flexible',
        currency: data.currency || 'CAD',
        paymentAmount: data.paymentAmount || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      } as UnifiedBooking;
    });
    
    // Log bookings with specific timestamps (for debugging)
    const futureBookings = bookings.filter(booking => {
      if (booking.startAt && booking.startAt.toDate) {
        const startTime = booking.startAt.toDate();
        return startTime > new Date();
      }
      return false;
    });
    if (futureBookings.length > 0) {
      console.log('getTeacherBookings: Found future bookings:', futureBookings.map(b => ({
        id: b.id,
        startAt: b.startAt?.toDate ? b.startAt.toDate() : b.startAt,
        endAt: b.endAt?.toDate ? b.endAt.toDate() : b.endAt,
        status: b.status,
        studentName: b.studentName,
        teacherId: b.teacherId
      })));
    }
    
    console.log('getTeacherBookings: All bookings for teacher:', bookings.map(b => ({
      id: b.id,
      startAt: b.startAt?.toDate ? b.startAt.toDate() : b.startAt,
      endAt: b.endAt?.toDate ? b.endAt.toDate() : b.endAt,
      status: b.status,
      studentName: b.studentName
    })));
    
    return bookings;
  } catch (error) {
    console.error('Error getting teacher bookings:', error);
    return [];
  }
};

// Unified function to check if a specific slot is available
export const checkSlotAvailability = async (
  teacherId: string,
  date: string,
  time: string,
  lessonType: '1on1' | 'group',
  maxGroupSize?: number
): Promise<{ available: boolean; currentBookings?: number; maxSize?: number }> => {
  if (!db) return { available: true };
  
  try {
    // Get teacher settings for group size if not provided
    if (lessonType === 'group' && !maxGroupSize) {
      const teachersRef = doc(db, 'teachers', teacherId);
      const teachersDoc = await getDoc(teachersRef);
      
      if (teachersDoc.exists()) {
        const settings = teachersDoc.data();
        maxGroupSize = settings.groupSize || 10;
      } else {
        maxGroupSize = 10; // Default fallback
      }
    }
    
    // Get all bookings for this teacher
    const allBookings = await getTeacherBookings(teacherId);
    
    // Normalize the date string for comparison
    const normalizedDate = normalizeDateString(date);
    
    // Find bookings for this specific date and time
    const existingBookings = allBookings.filter(booking => {
      const { date: bookingDate, time: bookingTime } = formatBookingDateTime(booking.startAt);
      const bookingNormalizedDate = normalizeDateString(bookingDate);
      return bookingNormalizedDate === normalizedDate && bookingTime === time;
    });
    
    const currentBookings = existingBookings.length;
    
    if (lessonType === '1on1') {
      // For 1:1 lessons, slot is unavailable if any booking exists
      return {
        available: currentBookings === 0,
        currentBookings,
        maxSize: 1
      };
    } else {
      // For group lessons, slot is available if under capacity
      return {
        available: currentBookings < (maxGroupSize || 10),
        currentBookings,
        maxSize: maxGroupSize || 10
      };
    }
  } catch (error) {
    console.error('Error checking slot availability:', error);
    return { available: true }; // Default to available on error
  }
};

// Unified function to check availability for all slots at once
export const checkAllSlotsAvailability = async (
  teacherId: string,
  slots: Array<{ date: string; time: string; duration: number }>,
  lessonType: '1on1' | 'group',
  maxGroupSize?: number
): Promise<Array<{ date: string; time: string; duration: number; available: boolean; currentBookings?: number; maxSize?: number }>> => {
  if (!db) return slots.map(slot => ({ ...slot, available: true }));
  
  try {
    // Get all bookings for this teacher once
    const allBookings = await getTeacherBookings(teacherId);
    
    // Get teacher settings for group size if not provided
    if (lessonType === 'group' && !maxGroupSize) {
      const teachersRef = doc(db, 'teachers', teacherId);
      const teachersDoc = await getDoc(teachersRef);
      
      if (teachersDoc.exists()) {
        const settings = teachersDoc.data();
        maxGroupSize = settings.groupSize || 10;
      } else {
        maxGroupSize = 10; // Default fallback
      }
    }
    
    // Check each slot
    return slots.map(slot => {
      const normalizedDate = normalizeDateString(slot.date);
      
      // Debug October 20th specifically
      if (slot.date.includes('October 20, 2025') && slot.time === '12:00 PM') {
        console.log('checkAllSlotsAvailability: Checking October 20, 12:00 PM slot');
        console.log('checkAllSlotsAvailability: Normalized slot date:', normalizedDate);
        console.log('checkAllSlotsAvailability: All bookings for teacher:', allBookings.map(b => {
          const { date: bookingDate, time: bookingTime } = formatBookingDateTime(b.startAt);
          return {
            id: b.id,
            date: bookingDate,
            time: bookingTime,
            normalizedDate: normalizeDateString(bookingDate),
            status: b.status
          };
        }));
      }
      
      // Find bookings for this specific date and time
      const existingBookings = allBookings.filter(booking => {
        const { date: bookingDate, time: bookingTime } = formatBookingDateTime(booking.startAt);
        const bookingNormalizedDate = normalizeDateString(bookingDate);
        return bookingNormalizedDate === normalizedDate && bookingTime === slot.time;
      });
      
      // Debug October 20th matching
      if (slot.date.includes('October 20, 2025') && slot.time === '12:00 PM') {
        console.log('checkAllSlotsAvailability: Found matching bookings:', existingBookings.map(b => {
          const { date: bookingDate, time: bookingTime } = formatBookingDateTime(b.startAt);
          return {
            id: b.id,
            date: bookingDate,
            time: bookingTime,
            normalizedDate: normalizeDateString(bookingDate)
          };
        }));
      }
      
      const currentBookings = existingBookings.length;
      
      if (lessonType === '1on1') {
        return {
          ...slot,
          available: currentBookings === 0,
          currentBookings,
          maxSize: 1
        };
      } else {
        return {
          ...slot,
          available: currentBookings < (maxGroupSize || 10),
          currentBookings,
          maxSize: maxGroupSize || 10
        };
      }
    });
  } catch (error) {
    console.error('Error checking all slots availability:', error);
    return slots.map(slot => ({ ...slot, available: true }));
  }
};

// Update booking status (affects both teacher and student views)
export const updateBookingStatus = async (
  bookingId: string, 
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
  additionalData?: Partial<UnifiedBooking>
): Promise<void> => {
  if (!db) {
    console.error('Firebase not available');
    return;
  }

  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    await updateDoc(bookingRef, updateData);
    console.log(`Booking ${bookingId} status updated to ${status}`);
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Get bookings for a user (works for both teachers and students)
export const getUserBookings = async (
  userId: string, 
  userType: 'student' | 'teacher',
  status?: string
): Promise<UnifiedBooking[]> => {
  if (!db) {
    console.error('Firebase not available');
    return [];
  }

  try {
    const bookingsRef = collection(db, 'bookings');
    let q;

    // Build query based on user type
    if (userType === 'student') {
      q = query(bookingsRef, where('studentId', '==', userId));
    } else {
      q = query(bookingsRef, where('teacherId', '==', userId));
    }

    // Add status filter if provided
    if (status) {
      // For status filtering, we need to use a compound query
      // But we'll handle this in the component with fallback
      try {
        q = query(bookingsRef, 
          where(userType === 'student' ? 'studentId' : 'teacherId', '==', userId),
          where('status', '==', status)
        );
      } catch (error) {
        console.log('Compound query failed, using simple query with client-side filtering');
        // Keep the simple query, filter on client side
      }
    }

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UnifiedBooking[];

    // Client-side filtering if compound query failed
    if (status && !q.toString().includes('status')) {
      return bookings.filter(booking => booking.status === status);
    }

    return bookings;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }
};

// Get booking statistics for a user
export const getUserBookingStats = async (
  userId: string,
  userType: 'student' | 'teacher'
): Promise<{
  upcoming: number;
  completed: number;
  cancelled: number;
  total: number;
  thisMonth: number;
}> => {
  try {
    const bookings = await getUserBookings(userId, userType);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      upcoming: 0,
      completed: 0,
      cancelled: 0,
      total: bookings.length,
      thisMonth: 0
    };

    bookings.forEach(booking => {
      // Count by status
      if (booking.status === 'upcoming') {
        // Check if it's in the future
        if (booking.startAt) {
          let startDate: Date;
          if (booking.startAt.toDate) {
            startDate = booking.startAt.toDate();
          } else {
            startDate = new Date(booking.startAt);
          }
          if (startDate >= now) {
            stats.upcoming++;
          }
        }
      } else if (booking.status === 'completed') {
        stats.completed++;
      } else if (booking.status === 'cancelled') {
        stats.cancelled++;
      }

      // Count this month's completed lessons
      if (booking.status === 'completed' && booking.startAt) {
        let startDate: Date;
        if (booking.startAt.toDate) {
          startDate = booking.startAt.toDate();
        } else {
          startDate = new Date(booking.startAt);
        }
        if (startDate >= startOfMonth) {
          stats.thisMonth++;
        }
      }
    });

    return stats;
  } catch (error) {
    console.error('Error calculating booking stats:', error);
    return {
      upcoming: 0,
      completed: 0,
      cancelled: 0,
      total: 0,
      thisMonth: 0
    };
  }
};

// Format booking for display
export const formatBookingForDisplay = (booking: UnifiedBooking) => {
  const { date, time } = formatBookingDateTime(booking.startAt);
  
  return {
    ...booking,
    displayDate: booking.startAt ? date : 'TBD',
    displayTime: booking.startAt ? time : 'TBD',
    statusColor: getStatusColor(booking.status),
    isUpcoming: booking.status === 'upcoming',
    isCompleted: booking.status === 'completed',
    isCancelled: booking.status === 'cancelled'
  };
};

// Get status color for UI
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'rescheduled':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

// Validate booking data
export const validateBookingData = (booking: Partial<UnifiedBooking>): string[] => {
  const errors: string[] = [];
  
  if (!booking.studentId) errors.push('Student ID is required');
  if (!booking.teacherId) errors.push('Teacher ID is required');
  if (!booking.startAt) errors.push('Start time is required');
  if (!booking.endAt) errors.push('End time is required');
  if (!booking.duration || booking.duration <= 0) errors.push('Valid duration is required');
  if (!booking.status) errors.push('Status is required');

  return errors;
};
