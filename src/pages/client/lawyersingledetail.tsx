import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Avatar } from '../../components/ui/Avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

export const LawyerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, Token: token } = useAuthStore();

  const [lawyer, setLawyer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [caseTaken, setCaseTaken] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | null>(null);
  const [caseHistory, setCaseHistory] = useState<any[]>([]);

  const [userCases, setUserCases] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    case: '',
    title: 'Help needed for civil dispute',
    description: 'I have a civil case related to property, looking for representation.',
  });

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:7000/users/lawyers/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLawyer(response.data);
      } catch (err) {
        setError('Failed to load lawyer details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCaseHistory = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:7000/users/clients/case-history/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCaseHistory(res.data);
      } catch (err) {
        console.error('Failed to fetch case history.');
      }
    };

    const fetchUserCases = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:7000/law/cases/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserCases(res.data);
      } catch (err) {
        console.error('Failed to fetch user cases.');
      }
    };

    fetchLawyer();
    fetchCaseHistory();
    fetchUserCases();
  }, [id, token]);

  const handleSendRequest = async () => {
    try {
      await axios.post(
        `http://127.0.0.1:7000/law/case-requests/`,
        {
          lawyer: id,
          client: user?.id,
          title: formData.title,
          description: formData.description,
          case: formData.case || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Request sent!');
      //setCaseTaken(true);
      setPaymentStatus('pending');
    } catch (err) {
      console.error(err);
      alert('Failed to send request.');
    }
  };

  const handlePayment = () => {
    if (!formData.case) {
      alert('Please select a case before proceeding to payment.');
      return;
    }

    navigate('/payment/pay', {
      state: {
        caseId: formData.case,
        clientId: user?.id,
        lawyerId: id,
      },
    });
  };
console.log(formData.case,caseTaken, paymentStatus,userCases);
  if (loading) return <div className="p-6">Loading...</div>;
  if (error || !lawyer) return <div className="p-6 text-red-600">{error || 'Lawyer not found.'}</div>;

  return (
    <div className="p-6 space-y-8">
      {/* Lawyer Profile Card */}
      <Card>
        <CardHeader className="flex items-center space-x-4">
          <Avatar name={lawyer.name} size="lg" />
          <div>
            <CardTitle className="text-2xl">{lawyer.name}</CardTitle>
            <p className="text-sm text-gray-500">{lawyer.email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 mt-4">
          <div>
            <h4 className="font-semibold text-gray-700">Specialization</h4>
            <p className="text-sm text-gray-600">{lawyer.specialization || 'Not specified'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">Experience</h4>
            <p className="text-sm text-gray-600">{lawyer.experience || 'N/A'} years</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">Bio</h4>
            <p className="text-sm text-gray-600">{lawyer.bio || 'No biography available.'}</p>
          </div>
        </CardContent>

        {/* Request Button */}
        <div className="p-6 pt-0">
          {!caseTaken && (
            <Button onClick={handleSendRequest}>Request Lawyer</Button>
          )}
        </div>

        {/* Payment Section */}
        
          <div className="p-6 pt-0">
            <Button onClick={handlePayment} disabled={!formData}>
              Pay Now
            </Button>
            {!formData.case && (
              <p className="text-sm text-red-500 mt-1">
                Please select a case to continue.
              </p>
            )}
          </div>
        
        
      </Card>

      {/* Case History Section */}
      <Card>
        <CardHeader>
          <CardTitle>Previous Case History</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(caseHistory) && caseHistory.length > 0 ? (
            <ul className="space-y-3">
              {caseHistory.map((c) => (
                <li key={c.id} className="text-sm text-gray-700 border-b pb-2">
                  <strong>Case:</strong> {c.description} <br />
                  <strong>Status:</strong> {c.status}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No previous cases found.</p>
          )}
        </CardContent>
      </Card>

      {/* Request Form */}
      <div>
        <h2 className="text-xl font-semibold">Send Request</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Case (optional)
          </label>
          <select
            value={formData.case}
            onChange={(e) => setFormData({ ...formData, case: e.target.value })}
            className="w-full mt-1 border px-3 py-2 rounded"
          >
            <option value="">-- Select a case --</option>
            {userCases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title || `Case #${c.id}`}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full mt-1 border px-3 py-2 rounded"
          />
        </div>
        <div className="mt-4">
          <Button onClick={handleSendRequest}>Send Request</Button>
        </div>
      </div>
    </div>
  );
};
