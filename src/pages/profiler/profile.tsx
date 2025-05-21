import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { Avatar } from '../../components/ui/Avatar';

export const Profile: React.FC = () => {
  const { user: loggedInUser, Token: token } = useAuthStore();
  const { id: lawyerId } = useParams(); // Lawyer ID from URL (if viewing another profile)

  const isClient = loggedInUser?.role === 'client';
  const isViewingOtherProfile = !!lawyerId && loggedInUser?.id !== parseInt(lawyerId);

  const [lawyerData, setLawyerData] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [paymentMade, setPaymentMade] = useState(false); // Placeholder

  // Fetch lawyer profile
  useEffect(() => {
    const fetchLawyerData = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:7000/law/profile/${lawyerId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLawyerData(res.data);
      } catch {
        alert('Failed to load profile');
      }
    };

    const fetchCaseHistory = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:7000/law/cases/?lawyer=${lawyerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCases(res.data);
      } catch {
        alert('Failed to fetch case history');
      }
    };

    if (isViewingOtherProfile) {
      fetchLawyerData();
      fetchCaseHistory();
    }
  }, [lawyerId]);

  const handleRequestCase = async () => {
    try {
      await axios.post(
        `http://127.0.0.1:7000/law/request-case/`,
        { lawyer_id: lawyerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Request sent!');
    } catch {
      alert('Failed to send request');
    }
  };

  const handlePayment = async () => {
    try {
      await axios.post(
        `http://127.0.0.1:7000/law/pay-case/`,
        { lawyer_id: lawyerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Payment successful');
      setPaymentMade(true);
    } catch {
      alert('Payment failed');
    }
  };

  // Display when viewing lawyer profile
  if (isClient && isViewingOtherProfile && lawyerData) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{lawyerData.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={lawyerData.name} size="lg" />
              <div>
                <p>Email: {lawyerData.email}</p>
                <p>Phone: {lawyerData.phone}</p>
              </div>
            </div>
            <p><strong>Specialization:</strong> {lawyerData.specialization}</p>
            <p><strong>Experience:</strong> {lawyerData.experience} years</p>
            <p><strong>License:</strong> {lawyerData.license}</p>
            <p><strong>Per Case Charge:</strong> ₹{lawyerData.per_case_charge || 'N/A'}</p>
            <Textarea value={lawyerData.bio} readOnly label="About the Lawyer" />

            {!paymentMade && (
              <div className="flex gap-4">
                <Button onClick={handleRequestCase}>Request Case</Button>
                <Button onClick={handlePayment} variant="outline">Pay Now</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Previous Cases</CardTitle>
          </CardHeader>
          <CardContent>
            {cases.length ? (
              <ul className="space-y-2">
                {cases.map((c, idx) => (
                  <li key={idx} className="border p-2 rounded">
                    <p><strong>Client:</strong> {c.client_name}</p>
                    <p><strong>Status:</strong> {c.status}</p>
                    <p><strong>Description:</strong> {c.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No previous cases found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback: show logged-in user profile (already implemented in your code)
  return (
    <div className="text-center p-10 text-gray-500">
      Loading your profile... or redirect to default.
    </div>
  );
};
