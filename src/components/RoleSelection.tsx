import React, { useState } from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: 'student' | 'teacher') => void;
  userName?: string;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole, userName }) => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      onSelectRole(selectedRole);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome{userName ? `, ${userName}` : ''}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Tell us how you'll be using LessonBook
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Student Option */}
          <div
            onClick={() => setSelectedRole('student')}
            className={`card cursor-pointer transition-all duration-200 ${
              selectedRole === 'student'
                ? 'ring-4 ring-primary-500 bg-primary-50'
                : 'hover:shadow-soft-lg hover:-translate-y-1'
            }`}
          >
            <div className="p-8 text-center">
              <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                selectedRole === 'student'
                  ? 'bg-primary-500'
                  : 'bg-gradient-to-br from-primary-400 to-primary-600'
              }`}>
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">I'm a Student</h2>
              <p className="text-gray-600 mb-6">
                I want to learn Korean and book lessons with teachers
              </p>
              <ul className="text-left space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Browse teacher profiles
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Book and manage lessons
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Track lesson progress
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Join via Google Meet
                </li>
              </ul>
            </div>
          </div>

          {/* Teacher Option */}
          <div
            onClick={() => setSelectedRole('teacher')}
            className={`card cursor-pointer transition-all duration-200 ${
              selectedRole === 'teacher'
                ? 'ring-4 ring-secondary-500 bg-secondary-50'
                : 'hover:shadow-soft-lg hover:-translate-y-1'
            }`}
          >
            <div className="p-8 text-center">
              <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                selectedRole === 'teacher'
                  ? 'bg-secondary-500'
                  : 'bg-gradient-to-br from-secondary-400 to-secondary-600'
              }`}>
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">I'm a Teacher</h2>
              <p className="text-gray-600 mb-6">
                I want to teach Korean and manage my students
              </p>
              <ul className="text-left space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Create booking page
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Set availability schedule
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Manage student bookings
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Share booking link
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="btn-primary px-12 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue as {selectedRole ? (selectedRole === 'student' ? 'Student' : 'Teacher') : '...'}
          </button>
          <p className="mt-4 text-sm text-gray-500">
            You can change this later in your account settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;




