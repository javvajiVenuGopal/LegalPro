// LawyerListPage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

export const LawyerListPage: React.FC = () => {
  const token = useAuthStore(state => state.Token);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:7000/users/lawyers/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setLawyers(response.data);
      } catch (error) {
        console.error('Failed to fetch lawyers:', error);
        setLawyers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, [token]);

  const handleRequest = async (lawyerId: number) => {
    try {
      await axios.post(`http://127.0.0.1:7000/users/clients/request-lawyer/`, {
        lawyer_id: lawyerId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Lawyer request sent successfully!');
    } catch (error) {
      console.error('Error requesting lawyer:', error);
      alert('Failed to send request. Try again later.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Available Lawyers</h1>
      {loading ? (
        <p>Loading lawyers...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lawyers.map(lawyer => (
            <Card key={lawyer.id}>
              <CardHeader>
                <div className="flex items-center">
                  <Avatar name={lawyer.name} size="sm" className="mr-3" />
                  <CardTitle className="text-lg font-semibold">{lawyer.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-1">Email: {lawyer.email}</p>
                <p className="text-sm text-gray-500">Specialty: {lawyer.specialization || 'N/A'}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to={`detail/${lawyer.id}`}>
                  <Button variant="ghost">View Profile</Button>
                </Link>
                <Button onClick={() => handleRequest(lawyer.id)}>Request Lawyer</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
