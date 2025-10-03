import React, { useState } from 'react';
import { CreditCard, Check, Star, ArrowLeft } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  lessons: number;
  price: number;
  description: string;
  popular?: boolean;
}

const products: Product[] = [
  {
    id: 'single-lesson',
    name: 'Single Lesson',
    lessons: 1,
    price: 20,
    description: 'Perfect for trying out a lesson'
  },
  {
    id: 'five-lessons',
    name: '5 Lessons Package',
    lessons: 5,
    price: 100,
    description: 'Great value for regular learning',
    popular: true
  },
  {
    id: 'ten-lessons',
    name: '10 Lessons Package',
    lessons: 10,
    price: 200,
    description: 'Best value for committed learners'
  }
];

const SimplePaymentPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setPaymentSuccess(true);
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
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
            setSelectedProduct(null);
          }}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
        >
          Make Another Purchase
        </button>
      </div>
    );
  }

  if (selectedProduct) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Complete Your Purchase</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedProduct.name}</h3>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">${selectedProduct.price}</div>
                  <div className="text-sm text-gray-500">{selectedProduct.lessons} lessons</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Demo Mode</h4>
                <p className="text-yellow-700 text-sm">
                  This is a demo payment page. In a real application, you would integrate with Stripe for secure payment processing.
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ${selectedProduct.price}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Lesson Package</h1>
        <p className="text-xl text-gray-600">Select the perfect package for your Korean learning journey</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-lg shadow-lg overflow-hidden relative transform hover:scale-105 transition-transform duration-200 ${
              product.popular ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            {product.popular && (
              <div className="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 text-sm font-medium">
                <Star className="h-4 w-4 inline mr-1" />
                Most Popular
              </div>
            )}
            
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-6">{product.description}</p>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  ${product.price}
                </div>
                <div className="text-gray-500">
                  {product.lessons} {product.lessons === 1 ? 'lesson' : 'lessons'}
                </div>
                {product.lessons > 1 && (
                  <div className="text-sm text-green-600 mt-1">
                    ${product.price / product.lessons} per lesson
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedProduct(product)}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  product.popular
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Choose This Package
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Demo Payment System</h3>
          <p className="text-blue-700">
            This is a demonstration of the payment interface. In a production environment, 
            you would integrate with Stripe for secure payment processing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimplePaymentPage;
