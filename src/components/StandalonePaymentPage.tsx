import React, { useState } from 'react';
import { CreditCard, Check, BookOpen } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  lessons: number;
  price: number;
  description: string;
  duration: string;
}

const products: Product[] = [
  {
    id: 'single-lesson',
    name: 'Korean lesson',
    lessons: 1,
    price: 20,
    description: '50 MIN KOREAN LESSON WITH HAILEY!',
    duration: '50 minutes'
  },
  {
    id: 'five-lessons',
    name: '5 Lessons Package',
    lessons: 5,
    price: 100,
    description: '5 x 50 MIN KOREAN LESSONS WITH HAILEY!',
    duration: '5 x 50 minutes'
  },
  {
    id: 'ten-lessons',
    name: '10 Lessons Package',
    lessons: 10,
    price: 200,
    description: '10 x 50 MIN KOREAN LESSONS WITH HAILEY!',
    duration: '10 x 50 minutes'
  }
];

const StandalonePaymentPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('haileykim206@gmail.com');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 1005');
  const [cardBrand, setCardBrand] = useState('AM EX');

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setPaymentSuccess(true);
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your lessons have been added to your account.
          </p>
          <button
            onClick={() => {
              setPaymentSuccess(false);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Make Another Purchase
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">LessonBook</span>
            </div>
            <div className="text-sm text-gray-500">
              Secure checkout powered by Stripe
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Section - Product Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              {/* Product Icon */}
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">Korean lesson</span>
              </div>

              {/* Product Name */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedProduct.name}
              </h1>

              {/* Price */}
              <div className="text-4xl font-bold text-gray-900 mb-3">
                CA${selectedProduct.price}.00
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-6">
                {selectedProduct.description}
              </p>

              {/* Change Amount Button */}
              <button
                onClick={() => {
                  const currentIndex = products.findIndex(p => p.id === selectedProduct.id);
                  const nextIndex = (currentIndex + 1) % products.length;
                  setSelectedProduct(products[nextIndex]);
                }}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Change amount
              </button>
            </div>
          </div>

          {/* Right Section - Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {/* Stripe Link Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">link</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>

              {/* Email Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Payment Method Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay with
                </label>
                <div className="relative">
                  <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white">
                    <div className="flex items-center flex-1">
                      <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">{cardBrand}</span>
                      </div>
                      <span className="text-gray-900">American Express Cobal... {cardNumber}</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Pay'
                )}
              </button>

              {/* Pay without Link */}
              <div className="text-center">
                <button className="text-gray-500 hover:text-gray-700 text-sm">
                  Pay without Link
                </button>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <span>Powered by stripe</span>
                  <span className="mx-2">|</span>
                  <button className="hover:text-gray-700">Terms</button>
                  <span className="mx-2">|</span>
                  <button className="hover:text-gray-700">Privacy</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-1">Demo Payment Interface</h3>
            <p className="text-blue-700 text-sm">
              This is a demonstration of the Stripe Link-style payment interface. 
              Click "Change amount" to cycle through different lesson packages: 
              Single Lesson ($20), 5 Lessons ($100), or 10 Lessons ($200).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandalonePaymentPage;
