import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createGoogleMeetInvitation, sendGoogleMeetInvitation } from '../services/googleMeet';
import { Calendar, Clock, Video, MapPin, User, CheckCircle } from 'lucide-react';

interface LessonSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  teacher: string;
}

const LessonBooking: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<LessonSlot | null>(null);
  const [lessonBalance, setLessonBalance] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [meetLink, setMeetLink] = useState<string>('');

  // Mock lesson slots data
  const lessonSlots: LessonSlot[] = [
    { id: '1', date: '2024-01-15', time: '10:00 AM', available: true, teacher: 'Sarah Johnson' },
    { id: '2', date: '2024-01-15', time: '2:00 PM', available: true, teacher: 'Mike Chen' },
    { id: '3', date: '2024-01-16', time: '9:00 AM', available: true, teacher: 'Sarah Johnson' },
    { id: '4', date: '2024-01-16', time: '3:00 PM', available: true, teacher: 'Emily Davis' },
    { id: '5', date: '2024-01-17', time: '11:00 AM', available: true, teacher: 'Mike Chen' },
    { id: '6', date: '2024-01-17', time: '4:00 PM', available: true, teacher: 'Sarah Johnson' },
  ];

  useEffect(() => {
    // Mock lesson balance - in real app, fetch from Firebase
    setLessonBalance(5); // User bought 5 lessons
  }, []);

  const handleBookLesson = async () => {
    if (!selectedSlot || !currentUser) return;

    setIsBooking(true);
    
    try {
      // Create Google Meet invitation
      const invitation = await createGoogleMeetInvitation({
        studentEmail: currentUser.email || '',
        studentName: currentUser.name || currentUser.email || 'Student',
        teacherName: selectedSlot.teacher,
        date: selectedSlot.date,
        time: selectedSlot.time,
        duration: 50, // 50 minutes
        subject: 'Korean Language Lesson'
      });

      // Send email invitation
      const emailSent = await sendGoogleMeetInvitation({
        studentEmail: currentUser.email || '',
        studentName: currentUser.name || currentUser.email || 'Student',
        teacherName: selectedSlot.teacher,
        date: selectedSlot.date,
        time: selectedSlot.time,
        duration: 50,
        subject: 'Korean Language Lesson'
      }, invitation);

      // In real app, you would:
      // 1. Save booking to Firebase
      // 2. Update lesson balance
      // 3. Store the meeting details
      
      console.log('Lesson booked successfully:', {
        student: currentUser.email,
        teacher: selectedSlot.teacher,
        date: selectedSlot.date,
        time: selectedSlot.time,
        meetLink: invitation.meetLink,
        emailSent: emailSent
      });

      setMeetLink(invitation.meetLink);
      setIsBooking(false);
      setBookingSuccess(true);
      
    } catch (error) {
      console.error('Error booking lesson:', error);
      setIsBooking(false);
      alert('Failed to book lesson. Please try again.');
    }
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Lesson Booked Successfully!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Your lesson with {selectedSlot?.teacher} has been confirmed
            </p>
          </div>

          <div className="card max-w-2xl mx-auto mb-8">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Lesson Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  <span className="text-gray-700"><strong>Date:</strong> {selectedSlot?.date}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary-600" />
                  <span className="text-gray-700"><strong>Time:</strong> {selectedSlot?.time}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-primary-600" />
                  <span className="text-gray-700"><strong>Teacher:</strong> {selectedSlot?.teacher}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Video className="h-5 w-5 text-primary-600" />
                  <span className="text-gray-700"><strong>Google Meet Link:</strong></span>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <a 
                    href={meetLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {meetLink}
                  </a>
                  <p className="text-sm text-gray-600 mt-2">
                    📧 An email invitation has been sent to your email address
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setBookingSuccess(false);
                setSelectedSlot(null);
              }}
              className="btn-primary"
            >
              Book Another Lesson
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your Lesson</h1>
          <p className="text-xl text-gray-600 mb-6">
            Choose your preferred date and time for your lesson
          </p>
          
          {/* Lesson Balance */}
          <div className="inline-flex items-center bg-primary-100 text-primary-800 px-6 py-3 rounded-xl font-semibold">
            <CheckCircle className="h-5 w-5 mr-2" />
            {lessonBalance} Lessons Available
          </div>
        </div>

        {/* Available Slots */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessonSlots.map((slot) => (
            <div
              key={slot.id}
              className={`card cursor-pointer transition-all duration-200 ${
                selectedSlot?.id === slot.id
                  ? 'ring-2 ring-primary-500 bg-primary-50'
                  : 'hover:shadow-soft-lg hover:-translate-y-1'
              } ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => slot.available && setSelectedSlot(slot)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary-600" />
                    <span className="font-semibold text-gray-900">{slot.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary-600" />
                    <span className="font-semibold text-gray-900">{slot.time}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">{slot.teacher}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Video className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">Google Meet</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Book Button */}
        {selectedSlot && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="card shadow-soft-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Selected Lesson</h3>
                    <p className="text-gray-600">{selectedSlot.date} at {selectedSlot.time}</p>
                    <p className="text-gray-600">with {selectedSlot.teacher}</p>
                  </div>
                  <button
                    onClick={handleBookLesson}
                    disabled={isBooking || lessonBalance === 0}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBooking ? 'Booking...' : 'Book Lesson'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lesson Balance Warning */}
        {lessonBalance === 0 && (
          <div className="text-center mt-8">
            <div className="card bg-red-50 border-red-200 max-w-md mx-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">No Lessons Available</h3>
                <p className="text-red-600 mb-4">You need to purchase more lessons to book a session.</p>
                <a href="/" className="btn-primary">
                  Buy More Lessons
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonBooking;
