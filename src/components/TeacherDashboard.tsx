import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, User, Copy, ExternalLink, Settings, Eye, BookOpen } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';

interface Booking {
  id: string;
  studentName: string;
  studentEmail: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  meetLink: string;
  className?: string;
  bookingReference?: string;
}

const TeacherDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [teacherBookingLink, setTeacherBookingLink] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'teacher') return;

    const teacherId = currentUser.id;

    // Fetch teacher settings to get the correct booking link
    const fetchTeacherLink = async () => {
      if (!db) {
        // Fallback to auto-generated link if Firebase is disabled
        const autoLink = `${window.location.origin}/teacher/${teacherId}/book`;
        setTeacherBookingLink(autoLink);
        return;
      }

      try {
        const teacherSettingsRef = doc(db, 'teacherSettings', teacherId);
        const settingsDoc = await getDoc(teacherSettingsRef);
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          // Use bookingLink if exists, otherwise use auto-generated
          const bookingLink = data.bookingLink || `${window.location.origin}/teacher/${teacherId}/book`;
          setTeacherBookingLink(bookingLink);
        } else {
          // No settings yet, use auto-generated link
          const autoLink = `${window.location.origin}/teacher/${teacherId}/book`;
          setTeacherBookingLink(autoLink);
        }
      } catch (error) {
        console.error('Error fetching teacher link:', error);
        // Fallback to auto-generated link
        const autoLink = `${window.location.origin}/teacher/${teacherId}/book`;
        setTeacherBookingLink(autoLink);
      }
    };

    fetchTeacherLink();

    // Fetch real bookings from Firebase with real-time listener
    let unsubscribeBookings: (() => void) | undefined;

    if (!db) {
      // Mock data if Firebase is disabled
      setUpcomingBookings([]);
    } else {
      try {
        console.log('TeacherDashboard: Setting up real-time listener for teacher:', teacherId);
        
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef,
          where('teacherId', '==', teacherId),
          where('status', '==', 'confirmed'),
          orderBy('date', 'asc')
        );
        
        // Use getDocs instead of onSnapshot to avoid Firestore conflicts
        const fetchBookings = async () => {
          try {
            console.log('TeacherDashboard: Fetching bookings for teacher:', teacherId);
            
            const snapshot = await getDocs(q);
            console.log('TeacherDashboard: Received bookings snapshot', snapshot.docs.length, 'documents');
            
            const bookings: Booking[] = snapshot.docs.map(doc => {
              const data = doc.data();
              console.log('TeacherDashboard: Processing booking data:', data);
              
              // Parse the date - it's stored as "Monday, October 6, 2025" format
              let lessonDate: Date;
              try {
                // Try to parse the full date string first
                lessonDate = new Date(data.date);
                
                // If that fails, try parsing with time
                if (isNaN(lessonDate.getTime())) {
                  lessonDate = new Date(`${data.date}T${data.time}`);
                }
                
                // If still invalid, try a different approach
                if (isNaN(lessonDate.getTime())) {
                  // Extract date parts from "Monday, October 6, 2025"
                  const dateMatch = data.date.match(/(\w+), (\w+) (\d+), (\d+)/);
                  if (dateMatch) {
                    const [, , monthName, day, year] = dateMatch;
                    const monthMap: { [key: string]: number } = {
                      'January': 0, 'February': 1, 'March': 2, 'April': 3,
                      'May': 4, 'June': 5, 'July': 6, 'August': 7,
                      'September': 8, 'October': 9, 'November': 10, 'December': 11
                    };
                    const month = monthMap[monthName];
                    if (month !== undefined) {
                      lessonDate = new Date(parseInt(year), month, parseInt(day));
                    }
                  }
                }
                
                console.log('TeacherDashboard: Parsed lessonDate:', lessonDate);
              } catch (error) {
                console.error('TeacherDashboard: Error parsing date:', error);
                lessonDate = new Date(); // Fallback to current time
              }
              
              return {
                id: doc.id,
                studentName: data.studentName,
                studentEmail: data.studentEmail,
                date: data.date,
                time: data.time,
                duration: data.duration || 50,
                status: data.status,
                meetLink: data.meetingLink || '',
                className: data.className || data.teacherName + ' Lesson', // Fallback to teacherName + Lesson
                bookingReference: data.bookingReference || doc.id
              };
            });
            
            // Filter to only show future bookings
            const now = new Date();
            const futureBookings = bookings.filter(booking => {
              try {
                const bookingDate = new Date(booking.date);
                return bookingDate >= now;
              } catch (error) {
                console.error('Error filtering booking date:', error);
                return false;
              }
            });
            
            console.log('TeacherDashboard: Upcoming bookings:', futureBookings.length);
            setUpcomingBookings(futureBookings);
          } catch (error) {
            console.error('TeacherDashboard: Error fetching bookings:', error);
            setUpcomingBookings([]);
          }
        };

        fetchBookings();
      } catch (error) {
        console.error('TeacherDashboard: Error setting up listener:', error);
        setUpcomingBookings([]);
      }
    }

    // No cleanup needed since we're using getDocs instead of onSnapshot
  }, [currentUser]);

  const copyBookingLink = async () => {
    try {
      await navigator.clipboard.writeText(teacherBookingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCompleteLesson = async (bookingId: string) => {
    if (!db) return;
    
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'completed'
      });
      console.log('Lesson marked as completed:', bookingId);
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (dateString: string) => {
    try {
      // Try to parse the full date string first
      let date = new Date(dateString);
      
      // If that fails, try parsing the "Monday, October 6, 2025" format
      if (isNaN(date.getTime())) {
        const dateMatch = dateString.match(/(\w+), (\w+) (\d+), (\d+)/);
        if (dateMatch) {
          const [, , monthName, day, year] = dateMatch;
          const monthMap: { [key: string]: number } = {
            'January': 0, 'February': 1, 'March': 2, 'April': 3,
            'May': 4, 'June': 5, 'July': 6, 'August': 7,
            'September': 8, 'October': 9, 'November': 10, 'December': 11
          };
          const month = monthMap[monthName];
          if (month !== undefined) {
            date = new Date(parseInt(year), month, parseInt(day));
          }
        }
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original string if parsing fails
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {currentUser?.name || 'Teacher'} ☀️
          </h1>
          <p className="text-xl text-gray-600">
            Manage your bookings and share your booking page with students
          </p>
        </div>

        {/* Main Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* My Booking Page Card */}
          <div className="card">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My booking page</h2>
                <a
                  href="/teacher-dashboard/edit"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Edit booking page"
                >
                  <Settings className="h-5 w-5" />
                </a>
              </div>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {currentUser?.name || 'Teacher'}'s Korean Lessons
                </h3>
                <p className="text-gray-600 mb-4">
                  Your unique booking link for students
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm font-mono text-gray-700 break-all">
                    {teacherBookingLink}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href="/teacher-dashboard/edit"
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Edit Booking Page</span>
                </a>

                <button
                  onClick={copyBookingLink}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  }`}
                >
                  <Copy className="h-4 w-4" />
                  <span>{copied ? 'Copied!' : 'Copy Booking Link'}</span>
                </button>
                
                <a
                  href={teacherBookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview Booking Page</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              
            </div>
          </div>

          {/* Lesson Balance Card */}
          <div className="card">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upcoming bookings</h2>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <BookOpen className="h-5 w-5" />
                </button>
              </div>

              {upcomingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No upcoming bookings
                  </h3>
                  <p className="text-gray-600 mb-6">
                    As soon as someone books a time with you it will show up here.
                  </p>
                  <a
                    href="#"
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View all bookings
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {booking.className}
                          </h4>
                          <p className="text-sm text-gray-600">
                            with {booking.studentName}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {booking.studentEmail}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{booking.time} ({booking.duration} min)</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <a
                          href={booking.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Join Google Meet →
                        </a>
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleCompleteLesson(booking.id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                          >
                            Complete Lesson
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center pt-4">
                    <a
                      href="#"
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      View all bookings
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {upcomingBookings.length}
              </h3>
              <p className="text-gray-600">Upcoming Lessons</p>
            </div>
          </div>

          <div className="card">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">12</h3>
              <p className="text-gray-600">Total Students</p>
            </div>
          </div>

          <div className="card">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">48</h3>
              <p className="text-gray-600">Hours Taught</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
