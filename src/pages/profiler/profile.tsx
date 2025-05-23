import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import { Avatar } from '../../components/ui/Avatar';

export const Profile: React.FC = () => {
  const { user: loggedInUser, Token: token } = useAuthStore();
  const { id: profileId } = useParams();

  const isClient = loggedInUser?.role === 'client';
  const isLawyer = loggedInUser?.role === 'lawyer';
  const isOwnProfile = !profileId || parseInt(profileId) === loggedInUser?.id;

  const isClientViewingLawyer = isClient && !isOwnProfile;
  const isLawyerViewingClient = isLawyer && !isOwnProfile;

  const [profileData, setProfileData] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [paymentMade, setPaymentMade] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const url = isClientViewingLawyer
          ? `http://127.0.0.1:7000/users/lawyers/${profileId}/`
          : isLawyerViewingClient
          ? `http://127.0.0.1:7000/users/clients/${profileId}/`
          : loggedInUser.role === 'lawyer'
          ? `http://127.0.0.1:7000/users/lawyers/${loggedInUser.id}/`
          : `http://127.0.0.1:7000/users/clients/${loggedInUser.id}/`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileData(res.data);
      } catch {
        alert('Failed to load profile');
      }
    };

    const fetchCaseHistory = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:7000/law/cases/?lawyer=${isClientViewingLawyer ? profileId : loggedInUser.id}&client=${isLawyerViewingClient ? profileId : loggedInUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCases(res.data);
      } catch {
        alert('Failed to fetch case history');
      }
    };

    fetchProfileData();
    fetchCaseHistory();
  }, [profileId]);

  const handleRequestCase = async () => {
    try {
      await axios.post(
        `http://127.0.0.1:7000/law/request-case/`,
        { lawyer_id: profileId },
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
        { lawyer_id: profileId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Payment successful');
      setPaymentMade(true);
    } catch {
      alert('Payment failed');
    }
  };

  if (!profileData) {
    return <div className="text-center p-10 text-gray-500">Loading profile...</div>;
  }

  const renderLawyerProfile = (readonly: boolean) => (
    <Card>
      <CardHeader>
        <CardTitle>{profileData.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name={profileData.name} size="lg" />
          <div>
            <p>Email: {profileData.email}</p>
            <p>Phone: {profileData.phone}</p>
          </div>
        </div>
        <p><strong>Specialization:</strong> {profileData.specialization}</p>
        <p><strong>Experience:</strong> {profileData.experience} years</p>
        <p><strong>License:</strong> {profileData.license}</p>
        <p><strong>Per Case Charge:</strong> ₹{profileData.per_case_charge || 'N/A'}</p>
        <Textarea value={profileData.bio} readOnly label="About the Lawyer" />

        {!readonly && !paymentMade && (
          <div className="flex gap-4">
            <Button onClick={handleRequestCase}>Request Case</Button>
            <Button onClick={handlePayment} variant="outline">Pay Now</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderClientProfile = () => (
    <Card>
      <CardHeader>
        <CardTitle>Client: {profileData.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name={profileData.name} size="lg" />
          <div>
            <p>Email: {profileData.email}</p>
            <p>Phone: {profileData.phone}</p>
          </div>
        </div>
        <p><strong>Address:</strong> {profileData.address || 'N/A'}</p>
        <p><strong>Age:</strong> {profileData.age || 'N/A'}</p>
      </CardContent>
    </Card>
  );

  const renderCases = (title: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {cases.length ? (
          <ul className="space-y-2">
            {cases.map((c, idx) => (
              <li key={idx} className="border p-2 rounded">
                {c.client_name && <p><strong>Client:</strong> {c.client_name}</p>}
                <p><strong>Status:</strong> {c.status}</p>
                <p><strong>Description:</strong> {c.description}</p>
                {c.payment_status && (
                  <p><strong>Payment Status:</strong> {c.payment_status}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No cases found.</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {isClientViewingLawyer && renderLawyerProfile(false)}
      {isLawyerViewingClient && renderClientProfile()}
      {isOwnProfile && isLawyer && renderLawyerProfile(true)}

      {isClientViewingLawyer && renderCases('Previous Cases')}
      {isLawyerViewingClient && renderCases('Cases with this Client')}
      {isOwnProfile && isLawyer && renderCases('Your Case History')}
    </div>
  );
};
