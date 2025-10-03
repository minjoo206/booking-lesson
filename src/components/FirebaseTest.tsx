import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const FirebaseTest: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<'testing' | 'connected' | 'error' | 'disabled'>('testing');
  const [firestoreStatus, setFirestoreStatus] = useState<'testing' | 'connected' | 'error' | 'disabled'>('testing');
  const [user, setUser] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const testFirebase = async () => {
      const results: string[] = [];
      
      try {
        // Test Authentication
        results.push('Testing Firebase Authentication...');
        if (!auth) {
          results.push('❌ Firebase Auth is disabled (demo mode)');
          setAuthStatus('disabled');
        } else {
          const authUnsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
              setUser(user);
              setAuthStatus('connected');
              results.push('✅ Authentication: Connected successfully');
            } else {
              setAuthStatus('connected');
              results.push('✅ Authentication: Ready (no user logged in)');
            }
          });
        }

        // Test Firestore
        results.push('Testing Firestore Database...');
        if (!db) {
          setFirestoreStatus('disabled');
          results.push('❌ Firebase Firestore is disabled (demo mode)');
        } else {
          try {
            const testDoc = doc(db, 'test', 'connection');
            await setDoc(testDoc, {
              timestamp: new Date(),
              test: 'Firebase connection test'
            });
            
            const docSnap = await getDoc(testDoc);
            if (docSnap.exists()) {
              setFirestoreStatus('connected');
              results.push('✅ Firestore: Connected and working');
            } else {
              setFirestoreStatus('error');
              results.push('❌ Firestore: Connection failed');
            }
          } catch (error) {
            setFirestoreStatus('error');
            results.push(`❌ Firestore: ${error}`);
          }
        }

        setTestResults(results);
        
        // Cleanup - authUnsubscribe is only available when auth is enabled
        if (auth) {
          setTimeout(() => {
            // Note: authUnsubscribe would need to be stored in scope
          }, 1000);
        }

      } catch (error) {
        setAuthStatus('error');
        setTestResults([...results, `❌ Firebase Error: ${error}`]);
      }
    };

    testFirebase();
  }, []);

  const testAnonymousAuth = async () => {
    if (!auth) {
      setTestResults(prev => [...prev, '❌ Firebase Auth is disabled (demo mode)']);
      return;
    }
    try {
      const result = await signInAnonymously(auth);
      setTestResults(prev => [...prev, '✅ Anonymous authentication successful']);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Anonymous auth failed: ${error}`]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Loader className="h-5 w-5 text-blue-600 animate-spin" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Firebase Connection Status</h1>
        
        {/* Connection Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-3">
              {getStatusIcon(authStatus)}
              <h2 className="text-lg font-semibold text-gray-900 ml-2">Authentication</h2>
            </div>
            <p className="text-gray-600">
              {authStatus === 'connected' && 'Firebase Auth is connected and ready'}
              {authStatus === 'testing' && 'Testing Firebase Auth connection...'}
              {authStatus === 'error' && 'Firebase Auth connection failed'}
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-3">
              {getStatusIcon(firestoreStatus)}
              <h2 className="text-lg font-semibold text-gray-900 ml-2">Firestore Database</h2>
            </div>
            <p className="text-gray-600">
              {firestoreStatus === 'connected' && 'Firestore is connected and working'}
              {firestoreStatus === 'testing' && 'Testing Firestore connection...'}
              {firestoreStatus === 'error' && 'Firestore connection failed'}
            </p>
          </div>
        </div>

        {/* Project Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Firebase Project Information</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Project ID:</span>
              <span className="text-blue-700 ml-2">booking-website-66194</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Auth Domain:</span>
              <span className="text-blue-700 ml-2">booking-website-66194.firebaseapp.com</span>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Test Results</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        </div>

        {/* Test Buttons */}
        <div className="space-y-4">
          <button
            onClick={testAnonymousAuth}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Test Anonymous Authentication
          </button>
          
          {user && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900">Current User:</h4>
              <p className="text-green-700 text-sm mt-1">
                UID: {user.uid} | Anonymous: {user.isAnonymous ? 'Yes' : 'No'}
              </p>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">Next Steps</h3>
          <ul className="text-yellow-800 space-y-2">
            <li>• Set up Firebase Authentication methods (Email/Password)</li>
            <li>• Configure Firestore security rules</li>
            <li>• Test user registration and login</li>
            <li>• Set up lesson and payment data structures</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest;
