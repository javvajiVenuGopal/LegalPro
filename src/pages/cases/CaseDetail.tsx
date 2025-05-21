import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { formatDate, getCaseStatusColor } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { Case, CaseUpdate } from '../../types';

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, Token: token } = useAuthStore();
  const navigate = useNavigate();


  console.log(user, "comming from store  18")

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [updates, setUpdates] = useState<CaseUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUpdate, setNewUpdate] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editCase, setEditCase] = useState({ title: '', description: '' });
  const [suggestedCases, setSuggestedCases] = useState<Case[]>([]);

  useEffect(() => {
    const fetchCase = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://127.0.0.1:7000/law/cases/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCaseData(response.data.case || response.data);
        setUpdates(response.data.updates || []);
        console.log("dgdfgd",response.data.lawyer);
        fetchSuggestedCases();
      } catch (error) {
        console.error('Error fetching case:', error);
        setCaseData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id, token]);




    console.log(caseData, "comming from store  19")

  const fetchSuggestedCases = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:7000/law/cases/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuggestedCases(response.data || []);
    } catch (error) {
      console.error('Error fetching suggested cases:', error);
      setSuggestedCases([]);
    }
  };

  const fetchUpdates = async () => {
    try {console.log("dfd",id)
      const response = await axios.get(`http://127.0.0.1:7000/law/case-updates/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpdates(response.data);
    } catch {
      setUpdates([]);
    }
  };

  const handleAddUpdate = async () => {
    if (!newUpdate.trim() || !user) return;
    try {
      await axios.post(
        `http://127.0.0.1:7000/law/case-updates/`,
        { message: newUpdate, case: id, created_by: user.id },
        { headers: { Authorization: `Bearer ${token}`,'Content-Type': 'application/json' } }
      );
      setNewUpdate('');
      fetchUpdates();
    } catch {
      alert('Failed to post update');
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!window.confirm('Are you sure you want to delete this update?')) return;
    try {
      await axios.delete(
        `http://127.0.0.1:7000/law/cases-updates/${updateId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUpdates();
    } catch {
      alert('Failed to delete update');
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setEditCase({
      title: caseData?.title || '',
      description: caseData?.description || '',
    });
  };

  const handleSaveEdit = async () => {
    try {
      if (user?.role == 'lawyer')
            editCase.title=''
            editCase.description=''
      
      const response = await axios.put(
        `http://127.0.0.1:7000/law/cases/${id}/`,
        editCase,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCaseData(response.data);
      setEditMode(false);
    } catch {
      alert('Failed to update case');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this case?')) return;
    try {
      await axios.delete(`http://127.0.0.1:7000/law/cases/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/cases');
    } catch {
      alert('Failed to delete case');
    }
  };

  const handleCaseStatusChange = async (status: string) => {
    if (!user || !caseData) return;
    try {
      console.log("dff",id)
      await axios.patch(
        `http://127.0.0.1:7000/law/cases/${id}/`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCaseData(prev => (prev ? { ...prev, status } : null));
    } catch {
      alert('Failed to update case status');
    }
  };

  const handleAcceptCase = async () => {
    console.log("dff",id)
    if (!user || !caseData) return;
    try {
      const response = await axios.patch(
        `http://127.0.0.1:7000/law/cases/${id}/`,
        { lawyer: user.id, status: 'in_review',accepted_by_lawyer:user?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
    const response1 = await axios.post(
      `http://127.0.0.1:7000/law/cases/${caseData.id}/accept/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log("Thread ID:", response1.data.thread_id);
    setCaseData(prev => (prev ? { ...prev, lawyer: user.id, status: 'in_review' } : null));
  
      setCaseData(prev => (prev ? { ...prev, lawyerId: user.id, status: 'in_review' } : null));
      console.log(caseData,response)
      alert('You have been assigned to this case!');
    } catch {
      alert('Failed to accept case');
    }
  };

  const filteredSuggestedCases = user?.role === 'lawyer'
    ? suggestedCases.filter(c => c.type !== user.specialization)
    : suggestedCases;

 
    const canEditOrDelete =
  user?.role === 'client' && user.id === caseData?.clientId;


  if (loading) return <div className="p-6">Loading...</div>;
  if (!caseData) return <div className="p-6 text-red-600 font-semibold">Case not found</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            {editMode ? (
              <>
                <input
                

                 className="border p-2 w-full mb-2"
                value={editCase.title}
                onChange={e => setEditCase({ ...editCase, title: e.target.value })}
              />
              <textarea
                className="border p-2 w-full mb-2"
                value={editCase.description}
                onChange={e => setEditCase({ ...editCase, description: e.target.value })}
              />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">{caseData?.title || 'No Title'}</h1>
              <p className="text-gray-600 mt-1">{caseData?.description || ''}</p>
            </>
          )}
        </div>
        <Badge variant="default" className={getCaseStatusColor(caseData?.status)}>
          {caseData?.status === 'open' ? 'Open' : caseData?.status === 'in_review' ? 'In Review' : 'Closed'}
        </Badge>
      </div>

      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
        <span>Created: {formatDate(caseData?.createdAt)}</span>
        <span>•</span>
        <span>Last updated: {formatDate(caseData?.updatedAt)}</span>
      </div>

      {canEditOrDelete && (
        <div className="flex gap-2 mt-4">
          {editMode ? (
            <>
              <Button size="sm" onClick={handleSaveEdit}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditMode(false)}>Cancel</Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={handleEdit}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={handleDelete}>Delete</Button>
            </>
          )}
        </div>
      )}
      <p>{caseData?.lawyer?.name || 'No Lawyer Assigned'}</p> 
      {user?.role === 'lawyer' && caseData?.lawyer=== user.id && (
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={() => handleCaseStatusChange('open')}>Mark as Open</Button>
          <Button size="sm" onClick={() => handleCaseStatusChange('in_review')}>Mark as In Review</Button>
          <Button size="sm" onClick={() => handleCaseStatusChange('closed')} variant="destructive">Close Case</Button>
        </div>
      )}
      <p>{user?.role}  {caseData?.lawyer == '1'}</p>
      <div>
    {/* Some content */}
    {/* {user?.role === 'lawyer' && caseData?.lawyer == null && (
      <div className="mt-4">
        <Button onClick={handleAcceptCase}>Accept Case and Start Chat</Button>
      </div>
    )} */}


 { caseData.lawyer === "null" && user.role === 'lawyer'  ?
 
  
 (
      <div className="mt-4">
        <Button onClick={handleAcceptCase}>Accept Case and Start Chat</Button>
      </div>
    )
  : ("")
  

  }






  </div>
    </div>

    {/* Updates Section */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Case Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <textarea
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Add a new update..."
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleAddUpdate}>Post Update</Button>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-6">
                  {updates.map((update) => (
                    <div key={update.id} className="relative pl-8">
                      <div className="absolute left-2.5 top-2 w-3 h-3 bg-white border-2 border-primary-500 rounded-full" />
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar 
                            name={user && update.createdBy === user.id ? user.name || 'You' : `User ${update.createdBy}`} 
                            size="sm" 
                          />
                          <span className="font-medium text-gray-900">
                            {user && update.createdBy === user.id ? user.name || 'You' : `User ${update.createdBy}`}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {formatDate(update.createdAt)}
                          </span>
                          {user && update.createdBy === user.id && (
                            <Button
                              size="xs"
                              variant="destructive"
                              className="ml-2"
                              onClick={() => handleDeleteUpdate(update.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                        <p className="text-gray-700">{update.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Suggested Cases */}
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Suggested Cases</h1>
      {filteredSuggestedCases.length === 0 ? (
        <div>No suggested cases for your specialization.</div>
      ) : (
        filteredSuggestedCases.map(c => (
          
          <div key={c.id} className="mb-4 p-4 border rounded">
            <h2 className="font-semibold">{c.title}</h2>
            <p>Type: {c.type}</p>
            <p>{c.description}</p>
            {user?.role === 'lawyer' && !c.lawyer && (
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    try {
                      await axios.patch(
                        `http://127.0.0.1:7000/law/cases/${c.id}/`,
                        { lawyer: user.id, status: 'in_review',accepted_by_lawyer:user?.id },
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      setSuggestedCases(prev => prev.filter(sc => sc.id !== c.id));
                    } catch {
                      alert('Failed to accept case');
                    }
                  }}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setSuggestedCases(prev => prev.filter(sc => sc.id !== c.id))}
                >
                  Decline
                </Button>
              </div>
            )}
            {user?.role === 'lawyer' && c.lawyerId && (
              <span className="text-green-600 font-semibold">Already taken</span>
            )}
          </div>
        ))
      )}
    </div>
  </div>
  );
};

