import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Check, CreditCard, Star } from 'lucide-react';
import { lessonPackages } from '../stripe/config';
import { useAuth } from '../contexts/AuthContext';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_live_51Rzj6A0dmMddUN7wZMYn3HQfgV9DUoWHvLMJK7CFPDLRmdcxxgejyFVpU7VNv8GFANZwzlbUgHBbuhegBiYs1b7Y00YTgAgu9R');

interface PaymentFormProps {
  packageId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ packageId, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !currentUser) {
      return;
    }

    setLoading(true);

    try {
      // Create payment intent on your backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          studentId: currentUser.id,
          packageId: packageId,
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm the payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: currentUser.name,
            email: currentUser.email,
          },
        },
      });

      if (result.error) {
        onError(result.error.message || 'Payment failed');
      } else {
        onSuccess();
      }
    } catch (error) {
      onError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-md">
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
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ${(amount / 100).toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
};

const LessonPackages: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setSelectedPackage(null);
    setPaymentError('');
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">
          Your lessons have been added to your account. You can now book lessons with teachers.
        </p>
        <button
          onClick={() => setPaymentSuccess(false)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Lesson Package</h1>
        <p className="text-gray-600">
          Select the number of lessons you'd like to purchase. More lessons = better value!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {lessonPackages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all ${
              selectedPackage === pkg.id
                ? 'ring-2 ring-primary-500 transform scale-105'
                : 'hover:shadow-xl'
            }`}
            onClick={() => setSelectedPackage(pkg.id)}
          >
            {pkg.numberOfLessons === 10 && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  Best Value
                </span>
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{pkg.name}</h3>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                ${(pkg.price / 100).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                ${(pkg.price / pkg.numberOfLessons / 100).toFixed(2)} per lesson
              </div>
              <p className="text-gray-600 text-sm mb-6">{pkg.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  {pkg.numberOfLessons} lessons included
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Valid for 6 months
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Book with any teacher
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPackage && (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Complete Your Purchase
          </h2>
          
          {paymentError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
              {paymentError}
            </div>
          )}

          <Elements stripe={stripePromise}>
            <PaymentForm
              packageId={selectedPackage}
              amount={lessonPackages.find(p => p.id === selectedPackage)?.price || 0}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </Elements>
          
          <button
            onClick={() => setSelectedPackage(null)}
            className="w-full mt-4 text-gray-600 hover:text-gray-800 text-sm"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonPackages;
