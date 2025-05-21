// src/pages/payment/SuccessPage.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';

const SuccessPage: React.FC = () => {
  const { state } = useLocation();
  const { name, amount } = state || {};

  return (
    <div className="max-w-md mx-auto mt-10 text-center p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold text-green-600 mb-3">Payment Successful 🎉</h2>
      <p className="text-gray-700">Thank you {name || 'User'} for your payment of ₹{amount}.</p>
      <p className="mt-4 text-sm text-gray-500">A confirmation email has been sent to you.</p>
    </div>
  );
};

export default SuccessPage;
