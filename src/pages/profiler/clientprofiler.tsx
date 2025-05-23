import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';

const ClientProfile = () => {
  const { id } = useParams();
  const { Token: token } = useAuthStore();
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:7000/users/clients/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Client data:', res.data);
        setClient(res.data.client);
      } catch {
        alert('Failed to load client profile');
      }
    };

    fetchClient();
  }, [id]);

  if (!client) return <div className="p-6 text-center">Loading client profile...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{client.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Avatar name={client.name} size="lg" />
          <p>Email: {client.email}</p>
          <p>Phone: {client.phone}</p>
          {/* <p>Age: {client.age}</p>
          <p>Address: {client.address}</p> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientProfile;
