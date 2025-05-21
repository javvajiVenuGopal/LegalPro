import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore'; // Import your auth store

const API_URL = 'http://127.0.0.1:7000/users/clients';

export const ClientListPage: React.FC = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.Token); // Get token from store

 useEffect(() => {
  const fetchClients = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          //"Content-Type": "application/json"


        },
      });
      console.log(response.data); // <-- Add this to debug
      // If response.data is { clients: [...] }
      setClients(Array.isArray(response.data) ? response.data : response.data.clients);
    } catch (err: any) {
      setError(err.message || 'Error fetching client data');
    } finally {
      setLoading(false);
    }
  };

  fetchClients();
}, [token]);

  // ...rest of your component...
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-600 mt-1">Overview of all active clients.</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading clients...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client: any) => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex items-center">
                  <Avatar name={client.name} size="lg" className="mr-3" />
                  <div>
                    <CardTitle className="text-lg text-gray-900">{client.name}</CardTitle>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {client.activeCases} active {client.activeCases === 1 ? 'case' : 'cases'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Joined {new Date(client.joinedAt).toLocaleDateString()}
                </p>
              </CardContent>
              <div className="px-6 pb-4">
                <Link to={`/lawyer/clients/${client.id}`}>
                  <Button size="sm" variant="secondary">View Details</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
