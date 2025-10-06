'use client';

// This should trigger the ESLint rule
export function TestComponent() {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  return <div>{apiKey}</div>;
}



