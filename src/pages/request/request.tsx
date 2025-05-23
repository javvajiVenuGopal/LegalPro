








import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const LawyerCaseRequestsPage = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const { user, Token: token } = useAuthStore();

  const fetchRequests = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:7000/law/case-requests/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching case requests:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);
console.log( 'requests', requests);
 const handleResponse = async (
  id: number,
  caseId: any,
  client: any,
  lawyer: any,
  status: string
) => {
  console.log('handleResponse', id, caseId, client, lawyer, status);
    try {
      await axios.patch(
        `http://127.0.0.1:7000/law/case-requests/${id}/`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
     if (status === 'accepted') {
      const response = await axios.patch(
        `http://127.0.0.1:7000/law/cases/${caseId}/`,
        { lawyer: lawyer, status: 'in_review',accepted_by_lawyer:lawyer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
    const response1 = await axios.post(
      `http://127.0.0.1:7000/law/cases/${caseId}/accept/`,
      {
    lawyer: lawyer,
    accepted_by_lawyer: lawyer,
  },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status } : req))
      );


     
    } catch (err) {
      console.error('Failed to update request status:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">Case Requests</h1>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        {requests.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">No case requests available.</p>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="bg-white border rounded-lg shadow p-5 hover:shadow-md transition duration-300"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-1">{req.title}</h2>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Client:</span> {req.client_name}
              </p>
              <p className="text-gray-700 mb-4">{req.description}</p>
              <p className="mb-4">
                <span className="font-semibold text-gray-600">Status:</span>{' '}
                <span
                  className={`inline-block px-2 py-1 rounded-full text-sm ${
                    req.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : req.status === 'accepted'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {req.status}
                </span>
              </p>

              {req.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleResponse(req.id,req.case,req.client,req.lawyer, 'accepted')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleResponse(req.id,req.case,req.client,req.lawyer, 'rejected')}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LawyerCaseRequestsPage;
