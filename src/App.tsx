import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import LessonPackages from './components/LessonPackages';
import MyBookings from './components/MyBookings';
import TeacherAvailability from './components/TeacherAvailability';
import StripeStylePaymentPage from './components/StripeStylePaymentPage';
import StandalonePaymentPage from './components/StandalonePaymentPage';
import PaymentDemo from './components/PaymentDemo';
import FirebaseTest from './components/FirebaseTest';
import FirebaseConnectionTest from './components/FirebaseConnectionTest';
import SimpleHomePage from './components/SimpleHomePage';
import LessonBooking from './components/LessonBooking';
import TeacherDashboard from './components/TeacherDashboard';
import TeacherBookingPage from './components/TeacherBookingPage';
import TeacherBookingEditor from './components/TeacherBookingEditor';
import RoleSelection from './components/RoleSelection';
import ProfileSetup from './components/ProfileSetup';
import UserProfile from './components/UserProfile';
import GuestCheckout from './components/GuestCheckout';
import FirebaseDebug from './components/FirebaseDebug';

const TeacherAvailabilityWrapper: React.FC = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  return <TeacherAvailability teacherId={teacherId || ''} />;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'student' | 'teacher' }> = ({ 
  children, 
  requiredRole 
}) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (currentUser) {
    // Redirect teachers to teacher dashboard, students to student dashboard
    if (currentUser.role === 'teacher') {
      return <Navigate to="/teacher-dashboard" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { needsRoleSelection, needsProfileSetup, pendingUser, setUserRole, completeProfile } = useAuth();

  // Show role selection if needed
  if (needsRoleSelection && pendingUser) {
    return <RoleSelection onSelectRole={setUserRole} userName={pendingUser.name} />;
  }

  // Show profile setup if needed
  if (needsProfileSetup && pendingUser && pendingUser.role) {
    return (
      <ProfileSetup 
        userName={pendingUser.name}
        userEmail={pendingUser.email}
        userRole={pendingUser.role}
        isGoogleUser={!!pendingUser.isGoogleUser}
        onComplete={completeProfile}
      />
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/lessons" 
            element={
              <ProtectedRoute requiredRole="student">
                <MyBookings />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/teacher/:teacherId" 
            element={
              <ProtectedRoute requiredRole="student">
                <TeacherAvailabilityWrapper />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/payment" 
            element={<LessonPackages />} 
          />
          
          <Route 
            path="/payment/integrated" 
            element={<StripeStylePaymentPage />} 
          />

          <Route 
            path="/buy-lessons" 
            element={<StripeStylePaymentPage />} 
          />

          <Route 
            path="/checkout" 
            element={<GuestCheckout />} 
          />
          
          <Route 
            path="/book-lesson" 
            element={<LessonBooking />} 
          />
          
          <Route 
            path="/teacher-dashboard" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/teacher-dashboard/edit" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherBookingEditor />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/teacher/:teacherId/book" 
            element={<TeacherBookingPage />} 
          />

          <Route 
            path="/book/:customSlug" 
            element={<TeacherBookingPage />} 
          />
          
          <Route 
            path="/firebase-test" 
            element={<FirebaseTest />} 
          />
          
          <Route 
            path="/firebase-test-connection" 
            element={<FirebaseConnectionTest />} 
          />
          
          <Route 
            path="/firebase-debug" 
            element={<FirebaseDebug />} 
          />
        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
