import React, { useState, useEffect } from 'react';
import { Clock, User, Star, BookOpen } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { collection, query, where, orderBy, onSnapshot, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Teacher, AvailabilitySlot, StudentLessonBalance } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Helper function to convert Firestore timestamp or Date to Date object
const toDate = (timestamp: Date | { seconds: number; nanoseconds: number }): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp.seconds * 1000);
};

interface TeacherAvailabilityProps {
  teacherId: string;
}

const TeacherAvailability: React.FC<TeacherAvailabilityProps> = ({ teacherId }) => {
  const { currentUser } = useAuth();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [lessonBalance, setLessonBalance] = useState<StudentLessonBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    // Fetch teacher data
    const fetchTeacher = async () => {
      try {
        // You would implement getDoc here to fetch teacher data
        // For now, we'll use mock data
        setTeacher({
          id: teacherId,
          name: 'John Smith',
          email: 'john@example.com',
          subjects: ['Math', 'Physics'],
          bio: 'Experienced math and physics tutor with 10+ years of experience.',
          hourlyRate: 50,
          availability: []
        });
      } catch (error) {
        console.error('Error fetching teacher:', error);
      }
    };

    // Fetch availability for the selected week
    const fetchAvailability = () => {
      if (!db) {
        // Mock data when Firebase is disabled
        setAvailability([]);
        setLoading(false);
        return () => {};
      }
      
      const startOfWeekDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const endOfWeekDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
      
      const availabilityQuery = query(
        collection(db, 'availability'),
        where('teacherId', '==', teacherId),
        where('startTime', '>=', startOfWeekDate),
        where('startTime', '<=', endOfWeekDate),
        orderBy('startTime', 'asc')
      );

      const unsubscribe = onSnapshot(availabilityQuery, (snapshot) => {
        const slots = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AvailabilitySlot[];
        setAvailability(slots);
        setLoading(false);
      });

      return unsubscribe;
    };

    // Fetch student's lesson balance
    const fetchLessonBalance = async () => {
      if (currentUser && currentUser.role === 'student') {
        try {
          // You would implement getDoc here to fetch balance
          // For now, we'll use mock data
          setLessonBalance({
            studentId: currentUser.id,
            totalLessons: 10,
            usedLessons: 3,
            remainingLessons: 7,
            lastUpdated: new Date()
          });
        } catch (error) {
          console.error('Error fetching lesson balance:', error);
        }
      }
    };

    fetchTeacher();
    const unsubscribeAvailability = fetchAvailability();
    fetchLessonBalance();

    return () => {
      unsubscribeAvailability();
    };
  }, [teacherId, selectedDate, currentUser]);

  const handleBookLesson = async () => {
    if (!selectedSlot || !currentUser || !lessonBalance) return;

    if (lessonBalance.remainingLessons === 0) {
      alert('You have no lessons remaining. Please purchase more lessons.');
      return;
    }

    setBooking(true);

    try {
      if (!db) {
        // Mock booking when Firebase is disabled
        alert('Lesson booked successfully! (Demo mode)');
        setSelectedSlot(null);
        return;
      }

      // Create lesson booking
      const lessonData = {
        studentId: currentUser.id,
        teacherId: teacherId,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        status: 'scheduled',
        subject: teacher?.subjects[0] || 'General',
        createdAt: new Date()
      };

      await addDoc(collection(db, 'lessons'), lessonData);

      // Update availability slot
      await updateDoc(doc(db, 'availability', selectedSlot.id), {
        isBooked: true,
        bookedBy: currentUser.id
      });

      // Update student's lesson balance
      await updateDoc(doc(db, 'lessonBalances', currentUser.id), {
        usedLessons: lessonBalance.usedLessons + 1,
        remainingLessons: lessonBalance.remainingLessons - 1,
        lastUpdated: new Date()
      });

      alert('Lesson booked successfully!');
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error booking lesson:', error);
      alert('Failed to book lesson. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const getWeekDays = () => {
    const startOfWeekDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const endOfWeekDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startOfWeekDate, end: endOfWeekDate });
  };

  const getAvailableSlotsForDate = (date: Date) => {
    return availability.filter(slot => 
      isSameDay(toDate(slot.startTime), date) && !slot.isBooked
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!teacher) {
    return <div>Teacher not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Teacher Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{teacher.name}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center text-gray-600">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span>4.8 (24 reviews)</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>${teacher.hourlyRate}/hour</span>
              </div>
            </div>
            <p className="text-gray-600 mt-2">{teacher.bio}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {teacher.subjects.map((subject) => (
                <span
                  key={subject}
                  className="px-2 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Balance */}
      {currentUser && currentUser.role === 'student' && lessonBalance && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-primary-600 mr-2" />
              <span className="text-gray-700">Your lesson balance:</span>
            </div>
            <span className="text-lg font-semibold text-primary-600">
              {lessonBalance.remainingLessons} lessons remaining
            </span>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Available Times</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Previous Week
            </button>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Next Week
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {getWeekDays().map((day) => {
            const slots = getAvailableSlotsForDate(day);
            return (
              <div
                key={day.toISOString()}
                className={`p-3 text-center border rounded-lg cursor-pointer ${
                  isSameDay(day, selectedDate)
                    ? 'bg-primary-100 border-primary-500'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="text-sm font-medium text-gray-900">
                  {format(day, 'EEE')}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {format(day, 'd')}
                </div>
                <div className="text-xs text-gray-600">
                  {slots.length} slots
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Slots */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          {getAvailableSlotsForDate(selectedDate).length === 0 ? (
            <p className="text-gray-600 py-4">No available slots for this date.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {getAvailableSlotsForDate(selectedDate).map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 text-sm border rounded-lg text-center hover:bg-gray-50 ${
                    selectedSlot?.id === slot.id
                      ? 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  {format(toDate(slot.startTime), 'h:mm a')}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Booking Button */}
        {selectedSlot && currentUser && currentUser.role === 'student' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Selected Time</h4>
                <p className="text-gray-600">
                  {format(toDate(selectedSlot.startTime), 'EEEE, MMMM d, yyyy')} at{' '}
                  {format(toDate(selectedSlot.startTime), 'h:mm a')}
                </p>
              </div>
              <button
                onClick={handleBookLesson}
                disabled={booking || !lessonBalance || lessonBalance.remainingLessons === 0}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking ? 'Booking...' : 'Book Lesson'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAvailability;
