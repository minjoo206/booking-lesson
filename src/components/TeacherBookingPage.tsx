import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Star, Video, CheckCircle, ShoppingCart, X, CreditCard, Check } from 'lucide-react';
import { db } from '../firebase/config';
import { doc, getDoc, collection, getDocs, setDoc, updateDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { checkAllSlotsAvailability } from '../utils/bookingUtils';

interface Teacher {
  id: string;
  name: string;
  email: string;
  bookingPageTitle: string;
  description: string;
  rating: number;
  totalLessons: number;
  languages: string[];
  specialties: string[];
  meetingRoom: 'google-meet' | 'zoom' | 'other';
  customMeetingRoom?: string;
  avatar?: string;
}

interface LessonPackage {
  id: string;
  name: string;
  lessons: number;
  price: number;
  description: string;
  popular?: boolean;
}

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  duration: number;
  lessonType?: '1on1' | 'group';
  groupSize?: number;
  currentBookings?: number;
  maxGroupSize?: number;
}

const TeacherBookingPage: React.FC = () => {
  const { customSlug } = useParams<{ customSlug: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [bookingMode, setBookingMode] = useState<'package' | 'flexible' | 'buy-lessons'>('package');
  const [selectedProduct, setSelectedProduct] = useState<LessonPackage | null>(null);

  const lessonPackages: LessonPackage[] = [
    {
      id: '1',
      name: '1 Lesson Package',
      lessons: 1,
      price: 25,
      description: 'Perfect for trying out a lesson'
    },
    {
      id: '2',
      name: '5 Lessons Package',
      lessons: 5,
      price: 100,
      description: 'Best value for regular learning',
      popular: true
    },
    {
      id: '3',
      name: '10 Lessons Package',
      lessons: 10,
      price: 180,
      description: 'Great for committed learners'
    }
  ];

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!customSlug) return;

      try {
        // For now, we'll use a hardcoded teacher ID for minjoo
        // In a real app, you'd look up the teacher by their custom slug
        const teacherId = 'XVcZhgJOtUeZ7vcvsQPodNyPW5I3'; // Minjoo's ID
        
        const teacherSettingsRef = doc(db, 'teacherSettings', teacherId);
        const settingsDoc = await getDoc(teacherSettingsRef);

        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setTeacher({
            id: teacherId,
            name: data.name || 'Teacher',
            email: data.email || '',
            bookingPageTitle: data.bookingPageTitle || 'Korean Lessons',
            description: data.description || 'Learn Korean with me!',
            rating: 4.9,
            totalLessons: 150,
            languages: data.languages || ['Korean', 'English'],
            specialties: data.specialties || ['Conversational Korean', 'Business Korean'],
            meetingRoom: data.meetingRoom || 'google-meet',
            customMeetingRoom: data.customMeetingRoom,
            avatar: data.avatar
          });
        }

        // Load teacher's available time slots
        await loadTeacherTimeSlots(teacherId);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [customSlug]);

  const loadTeacherTimeSlots = async (teacherId: string) => {
    if (!db) {
      // Mock data for development
      const mockSlots: TimeSlot[] = [
        {
          id: '1',
          date: '2025-10-06',
          time: '10:00',
          available: true,
          duration: 50,
          lessonType: '1on1',
          groupSize: 1,
          currentBookings: 0,
          maxGroupSize: 1
        },
        {
          id: '2',
          date: '2025-10-06',
          time: '11:00',
          available: true,
          duration: 50,
          lessonType: '1on1',
          groupSize: 1,
          currentBookings: 0,
          maxGroupSize: 1
        },
        {
          id: '3',
          date: '2025-10-07',
          time: '14:00',
          available: true,
          duration: 50,
          lessonType: '1on1',
          groupSize: 1,
          currentBookings: 0,
          maxGroupSize: 1
        },
        {
          id: '4',
          date: '2025-10-07',
          time: '15:00',
          available: false, // This slot is booked
          duration: 50,
          lessonType: '1on1',
          groupSize: 1,
          currentBookings: 1,
          maxGroupSize: 1
        },
        {
          id: '5',
          date: '2025-10-08',
          time: '09:00',
          available: true,
          duration: 50,
          lessonType: '1on1',
          groupSize: 1,
          currentBookings: 0,
          maxGroupSize: 1
        },
        {
          id: '6',
          date: '2025-10-08',
          time: '10:00',
          available: true,
          duration: 50,
          lessonType: '1on1',
          groupSize: 1,
          currentBookings: 0,
          maxGroupSize: 1
        },
        {
          id: '7',
          date: '2025-10-09',
          time: '13:00',
          available: true,
          duration: 50,
          lessonType: '1on1',
          groupSize: 1,
          currentBookings: 0,
          maxGroupSize: 1
        },
        {
          id: '8',
          date: '2025-10-09',
          time: '14:00',
          available: true,
          duration: 50,
          lessonType: '1on1',
          groupSize: 1,
          currentBookings: 0,
          maxGroupSize: 1
        }
      ];
      setTimeSlots(mockSlots);
      return;
    }

    try {
      // In a real app, you would fetch from teacherSlots collection
      // For now, using mock data
      const mockSlots: TimeSlot[] = [
        {
          id: '1',
          date: '2025-10-06',
          time: '10:00',
          available: true,
          duration: 50,
          lessonType: '1on1',
          groupSize: 1,
          currentBookings: 0,
          maxGroupSize: 1
        },
        {
          id: '2',
          date: '2025-10-06',
          time: '11:00',
          available: true,
          duration: 50,
          lessonType: '1on1',
          groupSize: 1,
          currentBookings: 0,
          maxGroupSize: 1
        },
        {
          id: '3',
          date: '2025-10-07',
          time: '14:00',
          available: true,
          duration: 50,
          lessonType: '1on1',
          groupSize: 1,
          currentBookings: 0,
          maxGroupSize: 1
        },
        {
          id: '4',
          date: '2025-10-07',
          time: '15:00',
          available: false, // This slot is booked
          duration: 50,
          lessonType: '1on1',
          groupSize: 1,
          currentBookings: 1,
          maxGroupSize: 1
        },
        {
          id: '5',
          date: '2025-10-08',
          time: '09:00',
          available: true,
          duration: 50,
          lessonType: '1on1',
          groupSize: 1,
          currentBookings: 0,
          maxGroupSize: 1
        },
        {
          id: '6',
          date: '2025-10-08',
          time: '10:00',
          available: true,
          duration: 50,
          lessonType: '1on1',
          groupSize: 1,
          currentBookings: 0,
          maxGroupSize: 1
        },
        {
          id: '7',
          date: '2025-10-09',
          time: '13:00',
          available: true,
          duration: 50,
          lessonType: '1on1',
          groupSize: 1,
          currentBookings: 0,
          maxGroupSize: 1
        },
        {
          id: '8',
          date: '2025-10-09',
          time: '14:00',
          available: true,
          duration: 50,
          lessonType: '1on1',
          groupSize: 1,
          currentBookings: 0,
          maxGroupSize: 1
        }
      ];
      setTimeSlots(mockSlots);
    } catch (error) {
      console.error('Error loading time slots:', error);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;

    setSelectedSlots(prev => {
      const isSelected = prev.some(s => s.id === slot.id);
      if (isSelected) {
        return prev.filter(s => s.id !== slot.id);
      } else {
        return [...prev, slot];
      }
    });
  };

  const handleBookLesson = () => {
    if (bookingMode === 'buy-lessons' && selectedProduct) {
      // Navigate to checkout with package purchase
      navigate('/checkout', { 
        state: { 
          bookingMode: 'buy-lessons',
          selectedProduct: selectedProduct,
          teacherId: teacher?.id,
          teacherName: teacher?.name,
          classPrice: selectedProduct.price / selectedProduct.lessons
        } 
      });
    } else if (selectedSlots.length > 0) {
      // Navigate to checkout with time slots
      navigate('/checkout', { 
        state: { 
          selectedSlots,
          teacherId: teacher?.id,
          teacherName: teacher?.name,
          classPrice: 25,
          bookingMode: 'flexible'
        } 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teacher profile...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Teacher not found</h1>
          <p className="text-gray-600">The teacher you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Teacher Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-primary-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{teacher.bookingPageTitle}</h1>
              <p className="text-gray-600 mb-4">{teacher.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>{teacher.rating}</span>
                </div>
                <span>•</span>
                <span>{teacher.totalLessons} lessons taught</span>
                <span>•</span>
                <span>Languages: {teacher.languages.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Options */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Booking Options */}
          <div className="space-y-6">
            {/* How would you like to book? */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">How would you like to book?</h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => setBookingMode('package')}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${
                    bookingMode === 'package'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Book a specific time</h3>
                      <p className="text-sm text-gray-600">Choose from available time slots</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setBookingMode('flexible')}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${
                    bookingMode === 'flexible'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-primary-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Flexible booking</h3>
                      <p className="text-sm text-gray-600">Book now, schedule later</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setBookingMode('buy-lessons')}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${
                    bookingMode === 'buy-lessons'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-primary-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Buy lessons first (booking later)</h3>
                      <p className="text-sm text-gray-600">Purchase lesson packages and book later</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Package Selection */}
            {bookingMode === 'buy-lessons' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Choose a lesson package</h2>
                
                <div className="grid gap-4">
                  {lessonPackages.map((product) => {
                    const isSelected = selectedProduct?.id === product.id;
                    return (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`p-4 text-left border-2 rounded-lg transition-colors ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${product.popular ? '' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.description}</p>
                            <p className="text-lg font-bold text-primary-600 mt-2">
                              ${product.price} for {product.lessons} lesson{product.lessons > 1 ? 's' : ''}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-6 w-6 text-primary-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Time Slots (when applicable) */}
          {(bookingMode === 'package' || bookingMode === 'flexible') && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Available Times</h2>
              <p className="text-gray-600 mb-6">Select the time slots you'd like to book.</p>
              
              {timeSlots.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">No time slots available at the moment.</p>
                  <p className="text-sm text-gray-500">Please contact the teacher directly or try the flexible booking option.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedSlots.some(s => s.id === slot.id);
                    return (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!slot.available}
                        className={`w-full p-3 text-left border-2 rounded-lg transition-colors ${
                          !slot.available
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isSelected
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {new Date(slot.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm">
                              {slot.time} ({slot.duration} min)
                            </p>
                          </div>
                          <div className="text-right">
                            {!slot.available ? (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                Booked
                              </span>
                            ) : isSelected ? (
                              <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded">
                                Selected
                              </span>
                            ) : (
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                Available
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Cart Button */}
        {(selectedSlots.length > 0 || (bookingMode === 'buy-lessons' && selectedProduct)) && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="bg-primary-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>
                {bookingMode === 'buy-lessons' && selectedProduct
                  ? `${selectedProduct.name} - $${selectedProduct.price}`
                  : `${selectedSlots.length} slot${selectedSlots.length > 1 ? 's' : ''} selected`
                }
              </span>
            </button>
          </div>
        )}

        {/* Cart Modal */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Complete Your Purchase</h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {bookingMode === 'buy-lessons' && selectedProduct ? (
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{selectedProduct.name}</h4>
                        <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${selectedProduct.price}</p>
                        <p className="text-sm text-gray-600">{selectedProduct.lessons} lessons</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  selectedSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between text-sm">
                      <span>{slot.date} at {slot.time}</span>
                      <span className="font-medium">$25</span>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg">
                    ${bookingMode === 'buy-lessons' && selectedProduct 
                      ? selectedProduct.price 
                      : selectedSlots.length * 25
                    }
                  </span>
                </div>
                
                <button
                  onClick={handleBookLesson}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {bookingMode === 'buy-lessons' ? 'Buy Lessons' : 'Book Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherBookingPage;