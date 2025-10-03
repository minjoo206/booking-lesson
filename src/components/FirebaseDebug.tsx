import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const FirebaseDebug: React.FC = () => {
  const [debugResults, setDebugResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setDebugResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFirebaseConnection = async () => {
    setDebugResults([]);
    
    try {
      // Test bookings collection
      addResult('Testing bookings collection access...');
      const bookingsRef = collection(db, 'bookings');
      await getDocs(bookingsRef);
      addResult('✅ Bookings collection accessible');

      // Test saved teachers collection
      addResult('Testing saved teachers access...');
      const savedTeachersRef = collection(db, 'savedTeachers');
      await getDocs(savedTeachersRef);
      addResult('✅ Saved teachers collection accessible');

      // Test lesson balances collection
      addResult('Testing lesson balance access...');
      const lessonBalancesRef = collection(db, 'lessonBalances');
      await getDocs(lessonBalancesRef);
      addResult('✅ Lesson balances collection accessible');

      // Test general read access
      addResult('Testing general read access...');
      const teachersRef = collection(db, 'teachers');
      await getDocs(teachersRef);
      addResult('✅ Teachers collection accessible');

      addResult('🎉 All Firebase collections are accessible!');
    } catch (error) {
      addResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Firebase Debug Tool</h1>
          
          <div className="mb-6">
            <button
              onClick={testFirebaseConnection}
              className="btn-primary"
            >
              Test Firebase Connection
            </button>
          </div>

          {debugResults.length > 0 && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
              <h3 className="text-white mb-2">Debug Results:</h3>
              {debugResults.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirebaseDebug;