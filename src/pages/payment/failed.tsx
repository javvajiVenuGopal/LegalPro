// src/pages/payment/FailurePage.tsx
import React from 'react';

const FailurePage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto mt-10 text-center p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold text-red-600 mb-3">Payment Failed ❌</h2>
      <p className="text-gray-700">Oops! Something went wrong while processing your payment.</p>
      <p className="mt-4 text-sm text-gray-500">Please try again or contact support.</p>
    </div>
  );
};

export default FailurePage;
