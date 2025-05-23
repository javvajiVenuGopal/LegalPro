import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Invoice } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentPage: React.FC<{ caseId: string ,lawyerId:string, clientId: string }> = ({ caseId, lawyerId,clientId }) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const { Token: token } = useAuthStore();
  const location = useLocation();
const navigate = useNavigate();
const searchParams = new URLSearchParams(location.search);

// Pull from location.state or URL
const caseId1 = location.state?.caseId || searchParams.get('caseId');
const clientId1 = location.state?.clientId || searchParams.get('clientId');
const lawyerId1 = location.state?.lawyerId || searchParams.get('lawyerId');
  console.log('caseId', caseId1);
  console.log('lawyerId', lawyerId1);
  console.log('clientId', clientId1);
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:7000/law/invoices/`,{
          amount: 100,
          paid_at: new Date().toISOString(),
          description: "This is a test invoice",
          case:caseId1,
          client: clientId1,
          lawyer: lawyerId1,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvoice(response.data);
        console.log('Invoice data:', response.data);
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