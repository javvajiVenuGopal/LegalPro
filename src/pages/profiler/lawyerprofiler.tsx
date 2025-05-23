import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import { Avatar } from '../../components/ui/Avatar';
import { Input } from '../../components/ui/Input';

const LawyerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, Token: token } = useAuthStore();
  const [lawyer, setLawyer] = useState<any>(null);
  const [caseHistory, setCaseHistory] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const isOwnProfile = user?.id === parseInt(id);

  axios.defaults.baseURL = 'http://127.0.0.1:7000/users/';

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        const res = await axios.get(`lawyers/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Lawyer data:', res.data);
        setLawyer(res.data.lawyer);
        setCaseHistory(res.data.case_history || []);
      } catch {
        alert('Failed to fetch lawyer profile');
      }
    };

    fetchLawyer();
  }, [id]);

  const handleUpdate = async () => {
    try {
      await axios.put(`lawyers/${id}/`, lawyer, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditing(false);
      alert('Profile updated');
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update');
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm('Are you sure you want to delete your profile?');
    if (!confirm) return;
    try {
      await axios.delete(`http://127.0.0.1:7000/users/lawyers/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Profile deleted');
      navigate('/logout');
    } catch {
      alert('Delete failed');
    }
  };

  if (!lawyer) return <div className="p-6 text-center">Loading lawyer profile...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit Profile" : lawyer.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Avatar name={lawyer.name} size="lg" />
          {editing ? (
            <>
              <Input value={lawyer.name} onChange={(e) => setLawyer({ ...lawyer, name: e.target.value })} label="Name" />
              <Input value={lawyer.email} onChange={(e) => setLawyer({ ...lawyer, email: e.target.value })} label="Email" />
              <Input value={lawyer.phone} onChange={(e) => setLawyer({ ...lawyer, phone: e.target.value })} label="Phone" />
              <Input value={lawyer.specialization} onChange={(e) => setLawyer({ ...lawyer, specialization: e.target.value })} label="Specialization" />
              <Input value={lawyer.experience} onChange={(e) => setLawyer({ ...lawyer, experience: e.target.value })} label="Experience" />
              <Textarea value={lawyer.bio} onChange={(e) => setLawyer({ ...lawyer, bio: e.target.value })} label="Bio" />
              <div className="flex gap-3">
                <Button onClick={handleUpdate}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <p>Email: {lawyer.email}</p>
              <p>Phone: {lawyer.phone}</p>
              <p>Specialization: {lawyer.specialization}</p>
              <p>Experience: {lawyer.experience} years</p>
              <p>License: {lawyer.license}</p>
              <Textarea value={lawyer.bio} readOnly label="About" />
              {isOwnProfile && (
                <div className="flex gap-4">
                  <Button onClick={() => setEditing(true)}>Edit</Button>
                  <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 🧾 Case History Section */}
      <Card>
        <CardHeader>
          <CardTitle>Case History (Closed Cases)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {caseHistory.length > 0 ? (
            caseHistory.map((c, idx) => (
              <div key={idx} className="border p-3 rounded shadow-sm">
                <p><strong>Title:</strong> {c.case_title}</p>
                <p><strong>Date:</strong> {c.case_date}</p>
                <p><strong>Status:</strong> {c.status}</p>
                {c.result && <p><strong>Result:</strong> {c.result}</p>}
              </div>
            ))
          ) : (
            <p>No closed cases found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LawyerProfile;
