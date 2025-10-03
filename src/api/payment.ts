// Mock API for creating payment intents
// In a real application, this would be handled by your backend server

export interface CreatePaymentIntentRequest {
  productId: string;
  amount: number; // amount in cents
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
}

// Mock function to simulate backend API call
export const createPaymentIntent = async (request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real implementation, you would:
  // 1. Validate the request
  // 2. Create a payment intent on your backend using Stripe SDK
  // 3. Store the payment intent in your database
  // 4. Return the client secret
  
  // For demo purposes, return a mock client secret
  const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    clientSecret: mockClientSecret
  };
};
