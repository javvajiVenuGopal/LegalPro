import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Invoice } from '../../types';

const PaymentPage: React.FC<{ caseId: string }> = ({ caseId }) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:7000/api/invoices/${caseId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvoice(response.data);
      } catch (error) {
        console.error('Failed to fetch invoice:', error);
      }
    };

    fetchInvoice();
  }, [caseId]);

  const handlePayment = () => {
    // Integrate with a payment gateway like Stripe or PayPal
    alert('Payment processing...');
  };

  return (
    <div>
      {invoice ? (
        <div>
          <h2>Invoice for Case: {invoice.caseId}</h2>
          <p>Amount: ${invoice.amount}</p>
          <button onClick={handlePayment}>Pay Now</button>
        </div>
      ) : (
        <p>Loading invoice...</p>
      )}
    </div>
  );
};

export default PaymentPage;