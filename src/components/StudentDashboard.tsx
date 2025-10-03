import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, BookOpen, CreditCard, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Lesson, StudentLessonBalance } from '../types';

// Helper function to convert Firestore timestamp or Date to Date object
const toDate = (timestamp: Date | { seconds: number; nanoseconds: number }): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp.seconds * 1000);
};

const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([]);
  const [lessonBalance, setLessonBalance] = useState<StudentLessonBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') return;

    // Fetch upcoming lessons
    const lessonsQuery = query(
      collection(db, 'lessons'),
      where('studentId', '==', currentUser.id),
      where('status', '==', 'scheduled'),
      orderBy('startTime', 'asc')
    );

    const unsubscribeLessons = onSnapshot(lessonsQuery, (snapshot) => {
      const lessons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lesson[];
      
      // Filter to only show future lessons
      const now = new Date();
      const futureLessons = lessons.filter(lesson => 
        toDate(lesson.startTime) > now
      );
      
      setUpcomingLessons(futureLessons);
    });

    // Fetch lesson balance
    const fetchLessonBalance = async () => {
      try {
        const balanceDoc = await getDoc(doc(db, 'lessonBalances', currentUser.id));
        if (balanceDoc.exists()) {
          setLessonBalance(balanceDoc.data() as StudentLessonBalance);
        }
      } catch (error) {
        console.error('Error fetching lesson balance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonBalance();

    return () => {
      unsubscribeLessons();
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {currentUser?.name}! 👋
            </h1>
            <p className="text-primary-100 text-lg">
              Here's your lesson overview and upcoming schedule.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Balance Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-2">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-3">
                <BookOpen className="h-5 w-5 text-primary-600" />
              </div>
              Lesson Balance
            </h2>
            <p className="text-gray-600">
              {lessonBalance?.remainingLessons || 0} lessons remaining
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              {lessonBalance?.remainingLessons || 0}
            </div>
            <div className="text-sm text-gray-500">
              of {lessonBalance?.totalLessons || 0} total
            </div>
          </div>
        </div>
        
        {lessonBalance && lessonBalance.remainingLessons === 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-1">No lessons remaining</h3>
                <p className="text-yellow-700 mb-4">
                  Purchase a lesson package to continue booking lessons with your teachers.
                </p>
                <button className="btn-primary flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Buy Lessons</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Lessons */}
      <div className="card">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-3">
            <Calendar className="h-5 w-5 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Upcoming Lessons</h2>
        </div>
        
        {upcomingLessons.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming lessons</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {lessonBalance && lessonBalance.remainingLessons > 0
                ? "Book a lesson with your teacher to get started."
                : "Purchase lessons to start booking with teachers."
              }
            </p>
            {lessonBalance && lessonBalance.remainingLessons > 0 && (
              <button className="btn-primary">
                Browse Teachers
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingLessons.slice(0, 5).map((lesson) => (
              <div key={lesson.id} className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 hover:shadow-soft transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {lesson.subject} Lesson
                      </h3>
                      <p className="text-gray-600">
                        {format(toDate(lesson.startTime), 'EEEE, MMMM d, yyyy')} at{' '}
                        {format(toDate(lesson.startTime), 'h:mm a')}
                      </p>
                    </div>

                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Scheduled
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {upcomingLessons.length > 5 && (
              <div className="text-center pt-4">
                <button className="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200">
                  View all {upcomingLessons.length} lessons →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
              <Plus className="h-4 w-4 text-primary-600" />
            </div>
            Quick Actions
          </h3>
          <div className="space-y-4">
            <button className="w-full text-left p-4 bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl hover:from-primary-100 hover:to-primary-200 transition-all duration-200 group">
              <div className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-200">Browse Teachers</div>
              <div className="text-sm text-gray-600 mt-1">Find and book lessons with available teachers</div>
            </button>
            <button className="w-full text-left p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-200 group">
              <div className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-200">View Lesson History</div>
              <div className="text-sm text-gray-600 mt-1">See your completed and cancelled lessons</div>
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center mr-3">
              <BookOpen className="h-4 w-4 text-secondary-600" />
            </div>
            Account Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Total lessons purchased:</span>
              <span className="font-bold text-lg text-gray-900">{lessonBalance?.totalLessons || 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Lessons completed:</span>
              <span className="font-bold text-lg text-gray-900">{lessonBalance?.usedLessons || 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200">
              <span className="text-gray-700 font-medium">Lessons remaining:</span>
              <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">{lessonBalance?.remainingLessons || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
