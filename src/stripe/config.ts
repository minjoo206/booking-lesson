// Stripe Configuration
export const STRIPE_PUBLISHABLE_KEY = 'pk_live_51Rzj6A0dmMddUN7wN8HqOuIpR97cBzTVzQrz8ZyWgRBU6v4LpgKaiigcg8DjNbA6AzoEXLbC0OLd6BNgtUna21Um00sk5HJSUE';

// Lesson Packages
export const lessonPackages = [
  {
    id: '1-lesson',
    name: '1 Lesson',
    numberOfLessons: 1,
    price: 2000, // Price in cents
    description: 'Perfect for trying out a single lesson',
    popular: false,
  },
  {
    id: '5-lessons',
    name: '5 Lessons',
    numberOfLessons: 5,
    price: 10000, // Price in cents
    description: 'Great for regular practice and improvement',
    popular: true,
  },
  {
    id: '10-lessons',
    name: '10 Lessons',
    numberOfLessons: 10,
    price: 20000, // Price in cents
    description: 'Best value for committed learners',
    popular: false,
    savings: 'Best Value!',
  },
];