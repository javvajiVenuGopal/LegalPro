// src/pages/payment/PaymentPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const PaymentPage: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Simulate payment request
      await new Promise((res) => setTimeout(res, 2000));

      // Randomly simulate success/failure
      const success = Math.random() > 0.3;
      if (success) {
        navigate('/payment/success', { state: { amount, name } });
      } else {
        navigate('/payment/failure');
      }
    } catch (err) {
      navigate('/payment/failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Make a Payment</h2>
      <div className="space-y-4">
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="Amount (INR)" value={amount} onChange={(e) => setAmount(e.target.value)} />

        <Button onClick={handleSubmit} disabled={loading || !amount || !phone}>
          {loading ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>
    </div>
  );
};

export default PaymentPage;
