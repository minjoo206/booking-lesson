import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, ShoppingCart, ExternalLink } from 'lucide-react';

const PaymentDemo: React.FC = () => {
  return (
    <div className="min-h-screen py-6 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
            <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Payment Page Demo</h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Choose between different payment page layouts inspired by Stripe Link's clean design
          </p>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Layout Version */}
          <div className="card hover:shadow-soft-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">With Navigation</h2>
            </div>
            <p className="text-gray-600 mb-4 sm:mb-6 text-base sm:text-lg">
              Payment page integrated with the main application navigation. 
              Perfect for authenticated users within the app flow.
            </p>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 p-4 rounded-xl">
                <div className="text-sm font-semibold text-gray-900 mb-2">Features:</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Integrated with app navigation</li>
                  <li>• User authentication required</li>
                  <li>• Consistent with app design</li>
                </ul>
              </div>
              <Link
                to="/payment"
                className="btn-primary w-full flex items-center justify-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Payment Page
              </Link>
            </div>
          </div>

          {/* Standalone Version */}
          <div className="card hover:shadow-soft-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center mr-4">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Standalone Checkout</h2>
            </div>
            <p className="text-gray-600 mb-6 text-lg">
              Clean, focused checkout experience without navigation distractions. 
              Ideal for direct payment links or embedded checkout flows.
            </p>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 border border-secondary-200 p-4 rounded-xl">
                <div className="text-sm font-semibold text-gray-900 mb-2">Features:</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Clean, distraction-free design</li>
                  <li>• No authentication required</li>
                  <li>• Optimized for conversions</li>
                </ul>
              </div>
              <Link
                to="/checkout"
                className="w-full bg-gradient-to-r from-secondary-600 to-secondary-700 text-white py-3 px-6 rounded-lg font-medium hover:from-secondary-700 hover:to-secondary-800 transition-all duration-200 transform hover:scale-105 hover:shadow-soft-lg flex items-center justify-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Standalone Checkout
              </Link>
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div className="mt-12 card">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
              <ShoppingCart className="h-4 w-4 text-primary-600" />
            </div>
            Available Lesson Packages
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 hover:shadow-soft transition-all duration-200">
              <div className="font-bold text-gray-900 text-lg mb-2">Single Lesson</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">CA$20.00</div>
              <div className="text-sm text-gray-600">50 MIN KOREAN LESSON WITH HAILEY!</div>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-xl border-2 border-primary-500 hover:shadow-soft-lg transition-all duration-200 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-1 rounded-full text-xs font-bold">Most Popular</span>
              </div>
              <div className="font-bold text-gray-900 text-lg mb-2">5 Lessons Package</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">CA$100.00</div>
              <div className="text-sm text-gray-600">5 x 50 MIN KOREAN LESSONS</div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 hover:shadow-soft transition-all duration-200">
              <div className="font-bold text-gray-900 text-lg mb-2">10 Lessons Package</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">CA$200.00</div>
              <div className="text-sm text-gray-600">10 x 50 MIN KOREAN LESSONS</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mr-3">
              <ExternalLink className="h-4 w-4 text-white" />
            </div>
            How to Test the Payment Pages
          </h3>
          <ol className="text-gray-700 space-y-3 text-lg">
            <li className="flex items-start">
              <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
              <span>Click on either payment page option above to see the beautiful designs</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
              <span>Use the "Change amount" button to cycle through different lesson packages</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
              <span>Fill in the email field (pre-filled with demo email for convenience)</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
              <span>Click "Pay" to simulate a successful payment flow</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">5</span>
              <span>See the success confirmation page with your purchase details</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PaymentDemo;
