# Payment Page Setup

## Overview
The booking website now includes a payment page where users can purchase lesson packages. The page features 3 different packages:

1. **Single Lesson** - $20 (1 lesson)
2. **5 Lessons Package** - $100 (5 lessons) - *Most Popular*
3. **10 Lessons Package** - $200 (10 lessons)

## Features

### Current Implementation (Demo Mode)
- Clean, modern UI with product selection cards
- Popular package highlighting
- Demo payment processing (simulated)
- Success confirmation page
- Responsive design for mobile and desktop

### Stripe Integration (Ready for Production)
The codebase includes full Stripe integration that can be activated by:

1. **Setting up Stripe Keys**
   ```bash
   # Add to .env file
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
   ```

2. **Switching to Full Stripe Mode**
   - Replace `SimplePaymentPage` with `PaymentPage` in `App.tsx`
   - Set up backend API endpoint `/api/create-payment-intent`
   - Configure Stripe webhook for payment confirmation

## How to Access

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Navigate to the payment page:**
   - Go to `http://localhost:3001/payment`
   - Or click "Buy Lessons" in the navigation menu (when logged in as student)

## File Structure

```
src/
├── components/
│   ├── PaymentPage.tsx          # Full Stripe integration
│   ├── SimplePaymentPage.tsx    # Demo version (currently active)
│   └── Layout.tsx               # Updated with payment link
├── api/
│   └── payment.ts               # Mock API for payment intents
└── App.tsx                      # Updated with payment route
```

## Product Configuration

Products are defined in the component with the following structure:

```typescript
interface Product {
  id: string;
  name: string;
  lessons: number;
  price: number;
  description: string;
  popular?: boolean;
}
```

To modify products, update the `products` array in `SimplePaymentPage.tsx` or `PaymentPage.tsx`.

## Styling

The payment page uses Tailwind CSS with:
- Custom primary color scheme
- Responsive grid layout
- Hover animations
- Success/error states
- Loading indicators

## Next Steps for Production

1. Set up Stripe account and get API keys
2. Create backend API for payment processing
3. Implement webhook handling for payment confirmation
4. Add user lesson balance updates after successful payment
5. Add email confirmation for purchases
6. Implement refund functionality
