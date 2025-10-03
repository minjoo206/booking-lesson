import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, User, LogOut, BookOpen, CreditCard } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-soft border-b border-primary-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-18">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  LessonBook
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              {currentUser ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      location.pathname === '/dashboard'
                        ? 'bg-primary-500 text-white shadow-soft'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Dashboard</span>
                  </Link>

                  {currentUser.role === 'student' && (
                    <>
                      <Link
                        to="/lessons"
                        className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                          location.pathname === '/lessons'
                            ? 'bg-primary-500 text-white shadow-soft'
                            : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                        }`}
                      >
                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">My Lessons</span>
                      </Link>
                      <Link
                        to="/payment"
                        className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                          location.pathname === '/payment'
                            ? 'bg-primary-500 text-white shadow-soft'
                            : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                        }`}
                      >
                        <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Buy Lessons</span>
                      </Link>
                    </>
                  )}

                  {currentUser.role === 'teacher' && (
                    <Link
                      to="/teacher-dashboard"
                      className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                        location.pathname === '/teacher-dashboard'
                          ? 'bg-primary-500 text-white shadow-soft'
                          : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                      }`}
                    >
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Teacher Dashboard</span>
                    </Link>
                  )}

                  <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                    <Link 
                      to={currentUser.role === 'teacher' ? '/teacher-dashboard/edit?tab=profile' : '/profile'}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-primary-50 transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 group-hover:text-primary-700">{currentUser.name}</span>
                        <span className="text-xs text-primary-600 capitalize">{currentUser.role}</span>
                      </div>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-primary-600 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 hover:bg-primary-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
