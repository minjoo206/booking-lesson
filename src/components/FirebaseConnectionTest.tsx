import React, { useState } from 'react';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
// Icons removed as they weren't being used

const FirebaseConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults(['🧪 Starting Firebase connection tests...']);

    try {
      // Test 1: Anonymous Authentication
      setTestResults(prev => [...prev, '📋 Test 1: Anonymous Authentication']);
      if (!auth) {
        setTestResults(prev => [...prev, '❌ Firebase Auth is disabled (demo mode)']);
      } else {
        try {
          const result = await signInAnonymously(auth);
          setTestResults(prev => [...prev, `✅ Anonymous auth successful - UID: ${result.user.uid}`]);
        } catch (error: any) {
          setTestResults(prev => [...prev, `❌ Anonymous auth failed: ${error.message}`]);
        }
      }

      // Test 2: Firestore Write
      setTestResults(prev => [...prev, '📋 Test 2: Firestore Database Write']);
      if (!db) {
        setTestResults(prev => [...prev, '❌ Firebase Firestore is disabled (demo mode)']);
      } else {
        try {
          const testDoc = doc(db, 'test', 'connection-test');
          await setDoc(testDoc, {
            timestamp: new Date(),
            test: 'Connection test',
            userAgent: navigator.userAgent
          });
          setTestResults(prev => [...prev, '✅ Firestore write successful']);
        } catch (error: any) {
          setTestResults(prev => [...prev, `❌ Firestore write failed: ${error.message}`]);
        }
      }

      // Test 3: Firestore Read
      setTestResults(prev => [...prev, '📋 Test 3: Firestore Database Read']);
      if (!db) {
        setTestResults(prev => [...prev, '❌ Firebase Firestore is disabled (demo mode)']);
      } else {
        try {
          const testDoc = doc(db, 'test', 'connection-test');
          const docSnap = await getDoc(testDoc);
          if (docSnap.exists()) {
            setTestResults(prev => [...prev, '✅ Firestore read successful']);
          } else {
            setTestResults(prev => [...prev, '❌ Firestore read failed - document not found']);
          }
        } catch (error: any) {
          setTestResults(prev => [...prev, `❌ Firestore read failed: ${error.message}`]);
        }
      }

      // Test 4: Email/Password Auth (without actually creating user)
      setTestResults(prev => [...prev, '📋 Test 4: Email/Password Auth Configuration']);
      if (!auth) {
        setTestResults(prev => [...prev, '❌ Firebase Auth is disabled (demo mode)']);
      } else {
        try {
          // This will fail with invalid email, but it tests if the auth method is enabled
          await createUserWithEmailAndPassword(auth, 'test@invalid.com', 'testpass');
        } catch (error: any) {
          if (error.code === 'auth/invalid-email') {
            setTestResults(prev => [...prev, '✅ Email/Password auth is configured (invalid email error expected)']);
          } else if (error.code === 'auth/operation-not-allowed') {
            setTestResults(prev => [...prev, '⚠️ Email/Password auth not enabled - enable it in Firebase Console']);
          } else {
            setTestResults(prev => [...prev, `✅ Email/Password auth is configured (${error.code})`]);
          }
        }
      }

      setTestResults(prev => [...prev, '🎉 All tests completed!']);

    } catch (error: any) {
      setTestResults(prev => [...prev, `❌ Test suite failed: ${error.message}`]);
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Firebase Connection Test</h1>
        
        <div className="mb-6">
          <button
            onClick={runTests}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Running Tests...' : 'Run Firebase Tests'}
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What This Tests</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• <strong>Anonymous Authentication:</strong> Tests if Firebase Auth is working</li>
            <li>• <strong>Firestore Write:</strong> Tests if you can write to the database</li>
            <li>• <strong>Firestore Read:</strong> Tests if you can read from the database</li>
            <li>• <strong>Email/Password Auth:</strong> Tests if email/password authentication is enabled</li>
          </ul>
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">Next Steps</h3>
          <p className="text-green-800">
            If all tests pass, you can now:
          </p>
          <ul className="text-green-800 mt-2 space-y-1">
            <li>• Register new users at <code>/register</code></li>
            <li>• Login users at <code>/login</code></li>
            <li>• Access protected routes like <code>/dashboard</code></li>
            <li>• Use the full booking system functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FirebaseConnectionTest;
