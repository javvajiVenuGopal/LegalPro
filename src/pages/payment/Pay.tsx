import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

const PaymentPage: React.FC = () => {
  const {user, Token: token} = useAuthStore();
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { caseId, clientId, lawyerId } = location.state || {};
console.log('caseId', caseId);
  console.log('lawyerId', lawyerId);
  console.log('clientID', clientId);
  const handleSubmit = async () => {
    if (!caseId || !clientId || !lawyerId) {
      alert("Missing required IDs (case, client, lawyer)");
      return;
    }

    if (!amount || !phone || !name || !email) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://127.0.0.1:7000/law/invoices/',
        {
          amount,
          paid_at: new Date().toISOString(),
          description,
          case: caseId,
          client: clientId,
          lawyer: lawyerId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Invoice created:', response.data);

      navigate('/payment/success', { state: { amount, name } });
    } catch (err) {
      console.error('Payment error:', err);
      navigate('/payment/failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Make a Payment</h2>
      <div className="space-y-4">
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          required
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <Input
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
          required
        />
        <Input
          label="Amount (INR)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
          required
        />
        <Input
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />

        <Button
          onClick={handleSubmit}
          disabled={loading || !amount || !phone || !email || !name}
        >
          {loading ? (
            <span className="flex items-center space-x-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span>Creating payment request...</span>
            </span>
          ) : (
            'Pay Now'
          )}
        </Button>
      </div>
    </div>
  );
};

export default PaymentPage;
