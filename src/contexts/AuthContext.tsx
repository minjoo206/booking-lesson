import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User } from '../types';

// Mock authentication for demo purposes when Firebase is disabled
const isFirebaseDisabled = !auth || !db;

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  needsRoleSelection: boolean;
  needsProfileSetup: boolean;
  pendingUser: { id: string; email: string; name: string; role?: 'student' | 'teacher'; isGoogleUser?: boolean } | null;
  returnTo: string | null;
  setReturnTo: (path: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string, role: 'student' | 'teacher') => Promise<void>;
  setUserRole: (role: 'student' | 'teacher') => Promise<void>;
  completeProfile: (profileData: { name: string; dateOfBirth: string; password?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [pendingUser, setPendingUser] = useState<{ id: string; email: string; name: string; role?: 'student' | 'teacher'; isGoogleUser?: boolean } | null>(null);
  const [returnTo, setReturnTo] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    if (isFirebaseDisabled) {
      // Mock login for demo
      const mockUser: User = {
        id: 'demo-user-id',
        email,
        name: 'Demo User',
        role: 'student',
        createdAt: new Date()
      };
      setCurrentUser(mockUser);
      return;
    }
    if (auth) {
      await signInWithEmailAndPassword(auth, email, password);
    }
  };

  const loginWithGoogle = async () => {
    if (isFirebaseDisabled) {
      // Mock Google login for demo - show role selection
      setPendingUser({
        id: 'demo-google-user-id',
        email: 'google@example.com',
        name: 'Google User'
      });
      setNeedsRoleSelection(true);
      return;
    }

    if (auth && db) {
      const provider = new GoogleAuthProvider();
      
      try {
        const result = await signInWithPopup(auth, provider);
        
        // Check if we actually got a user
        if (!result || !result.user) {
          throw new Error('No user data received');
        }
        
        const user = result.user;

        // Check if user document exists
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          // First time Google sign-in - show role selection
          setPendingUser({
            id: user.uid,
            email: user.email!,
            name: user.displayName || user.email!.split('@')[0],
            isGoogleUser: true
          });
          setNeedsRoleSelection(true);
        }
      } catch (error: any) {
        // Re-throw the error so Login/Register components can handle it
        throw error;
      }
    }
  };

  const setUserRole = async (role: 'student' | 'teacher') => {
    if (!pendingUser) return;

    // Move to profile setup after role selection
    setPendingUser({ ...pendingUser, role });
    setNeedsRoleSelection(false);
    setNeedsProfileSetup(true);
  };

  const completeProfile = async (profileData: { name: string; dateOfBirth: string; password?: string }) => {
    if (!pendingUser || !pendingUser.role) return;

    if (isFirebaseDisabled) {
      // Mock user with complete profile
      const mockUser: User = {
        id: pendingUser.id,
        email: pendingUser.email,
        name: profileData.name,
        role: pendingUser.role,
        dateOfBirth: profileData.dateOfBirth,
        profileComplete: true,
        createdAt: new Date()
      };
      setCurrentUser(mockUser);
      setNeedsProfileSetup(false);
      setPendingUser(null);
      return;
    }

    if (auth && db) {
      // Update password if provided (email users only)
      if (profileData.password && !pendingUser.isGoogleUser && auth.currentUser) {
        const { updatePassword } = await import('firebase/auth');
        await updatePassword(auth.currentUser, profileData.password);
      }

      // Create/update user document with complete profile
      const userData: User = {
        id: pendingUser.id,
        email: pendingUser.email,
        name: profileData.name,
        role: pendingUser.role,
        dateOfBirth: profileData.dateOfBirth,
        profileComplete: true,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', pendingUser.id), userData);
      setCurrentUser(userData);
      setNeedsProfileSetup(false);
      setPendingUser(null);
    }
  };

  const register = async (email: string, password: string, name: string, role: 'student' | 'teacher') => {
    if (isFirebaseDisabled) {
      // Mock registration for demo
      const mockUser: User = {
        id: 'demo-user-id',
        email,
        name,
        role,
        createdAt: new Date()
      };
      setCurrentUser(mockUser);
      return;
    }
    
    if (auth && db) {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      const userData: User = {
        id: user.uid,
        email: user.email!,
        name,
        role,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      // If student, create lesson balance document
      if (role === 'student') {
        await setDoc(doc(db, 'lessonBalances', user.uid), {
          studentId: user.uid,
          totalLessons: 0,
          usedLessons: 0,
          remainingLessons: 0,
          lastUpdated: new Date()
        });
      }
    }
  };

  const logout = async () => {
    if (isFirebaseDisabled) {
      setCurrentUser(null);
      return;
    }
    if (auth) {
      await signOut(auth);
    }
  };

  useEffect(() => {
    if (isFirebaseDisabled) {
      // Skip Firebase auth state listening when disabled
      setLoading(false);
      return;
    }
    
    if (auth && db) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setCurrentUser(userData);
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    }
  }, []);

  const handleSetReturnTo = (path: string | null) => {
    console.log('AuthContext: Setting returnTo URL:', path);
    setReturnTo(path);
  };

  const value = {
    currentUser,
    loading,
    needsRoleSelection,
    needsProfileSetup,
    pendingUser,
    returnTo,
    setReturnTo: handleSetReturnTo,
    login,
    loginWithGoogle,
    register,
    setUserRole,
    completeProfile,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
