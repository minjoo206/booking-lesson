import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, User, CreditCard, CheckCircle, ArrowLeft, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { db } from '../firebase/config';
import { collection, addDoc, doc, getDoc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

// Suppress Stripe HTTPS warnings in development
if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode - Stripe HTTPS warnings are expected');
}

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

interface CheckoutState {
  selectedSlots?: Array<{
    id: string;
    date: string;
    time: string;
    duration: number;
  }>;
  teacherId?: string;
  teacherName?: string;
  classPrice?: number;
  bookingMode?: 'package' | 'flexible' | 'buy-lessons';
  packageLessons?: number;
  selectedProduct?: {
    id: string;
    name: string;
    lessons: number;
    price: number;
    description: string;
    popular?: boolean;
  };
}

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [error, setError] = useState<string | null>(null);

  const state = location.state as CheckoutState;

  const totalAmount = state?.bookingMode === 'package' 
    ? (state?.packageLessons || 1) * (state?.classPrice || 0)
    : state?.bookingMode === 'buy-lessons' && state?.selectedProduct
    ? state.selectedProduct.price
    : (state?.selectedSlots?.length || 0) * (state?.classPrice || 0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || !state) return;

    setLoading(true);
    setPaymentStep('processing');
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Process the booking
      await processBooking(paymentMethod.id);
      
      setPaymentStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setPaymentStep('error');
    } finally {
      setLoading(false);
    }
  };

  const processBooking = async (paymentMethodId: string) => {
    if (!db) {
      console.log('Firebase disabled, skipping booking save');
      return;
    }

    const studentId = currentUser?.id || 'guest';
    const teacherId = state.teacherId || '';
    const totalLessonsPurchased = state.bookingMode === 'package' 
      ? (state.packageLessons || 1) 
      : state.bookingMode === 'buy-lessons' && state.selectedProduct
      ? state.selectedProduct.lessons
      : state.selectedSlots?.length || 0;

    // Create booking record
    if (state.selectedSlots && state.selectedSlots.length > 0) {
      for (const slot of state.selectedSlots) {
        await addDoc(collection(db, 'bookings'), {
          studentId,
          teacherId,
          studentName: currentUser?.name || 'Guest',
          studentEmail: currentUser?.email || 'guest@example.com',
          teacherName: state.teacherName || 'Teacher',
          date: slot.date,
          time: slot.time,
          duration: slot.duration,
          status: 'confirmed',
          meetingLink: `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}`,
          paymentAmount: state.classPrice || 0,
          currency: 'USD',
          bookingReference: `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Update lesson balance
    if (studentId !== 'guest' && teacherId) {
      const compositeKey = `${teacherId}_${studentId}`;
      const balanceRef = doc(db, 'lessonBalances', compositeKey);
      const balanceDoc = await getDoc(balanceRef);

      if (balanceDoc.exists()) {
        const currentBalance = balanceDoc.data();
        await updateDoc(balanceRef, {
          totalLessons: (currentBalance.totalLessons || 0) + totalLessonsPurchased,
          remainingLessons: (currentBalance.remainingLessons || 0) + totalLessonsPurchased,
          lastUpdated: new Date()
        });
      } else {
        await setDoc(balanceRef, {
          teacherId,
          studentId,
          totalLessons: totalLessonsPurchased,
          usedLessons: 0,
          remainingLessons: totalLessonsPurchased,
          lastUpdated: new Date()
        });
      }
    }
  };

  if (paymentStep === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          {state.bookingMode === 'buy-lessons' 
            ? 'Your lesson package has been purchased successfully.'
            : 'Your booking has been confirmed.'
          }
        </p>
        <div className="space-y-3">
          <button
            onClick={() => {
              if (state.bookingMode === 'buy-lessons') {
                navigate('/dashboard');
              } else {
                navigate('/lessons');
              }
            }}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center space-x-2"
          >
            <Calendar className="h-5 w-5" />
            <span>
              {state.bookingMode === 'buy-lessons' ? 'Book Now' : 'View My Bookings'}
            </span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full btn-secondary py-2"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (paymentStep === 'error') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => {
            setPaymentStep('form');
            setError(null);
          }}
          className="w-full btn-primary py-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Purchase</h1>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">
                    {state.bookingMode === 'package' 
                      ? `${state.packageLessons} weekly lessons`
                      : state.bookingMode === 'buy-lessons' && state.selectedProduct
                      ? `${state.selectedProduct.lessons} lesson${state.selectedProduct.lessons > 1 ? 's' : ''} - ${state.selectedProduct.name}`
                      : `${state.selectedSlots?.length} lesson${state.selectedSlots?.length !== 1 ? 's' : ''}`
                    }
                  </span>
                  <span className="font-semibold">${totalAmount}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Teacher</span>
                  <span className="font-semibold">{state.teacherName}</span>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold">${totalAmount}</span>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Information
                    </label>
                    <div className="border border-gray-300 rounded-md p-3">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#424770',
                              '::placeholder': {
                                color: '#aab7c4',
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!stripe || loading || paymentStep === 'processing'}
                    className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading || paymentStep === 'processing' ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      `Pay $${totalAmount}`
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Payment Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Secure payment powered by Stripe</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Your payment information is encrypted</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">You'll receive a confirmation email</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GuestCheckout: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect to login if no user and no guest checkout data
    const state = location.state as CheckoutState;
    if (!currentUser && !state) {
      navigate('/login');
    }
  }, [currentUser, navigate, location.state]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

export default GuestCheckout;