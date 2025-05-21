import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { formatDate, getCaseStatusColor } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { Case } from '../../types';
import axios from 'axios';
// ...existing imports...
import { useNavigate } from 'react-router-dom';
// ...existing imports...
const CASE_TYPES = [
  { value: 'civil', label: 'Civil' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'family', label: 'Family' },
  // Add more as needed
];

export const CaseList: React.FC = () => {
  const { user, Token: token } = useAuthStore();
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCase, setNewCase] = useState({ title: '', description: '', type: CASE_TYPES[0].value });
  const [editCaseId, setEditCaseId] = useState<string | null>(null);
  const [editCase, setEditCase] = useState({ title: '', description: '', type: CASE_TYPES[0].value });
  const navigate = useNavigate();
  const api = 'http://127.0.0.1:7000/law/cases/';
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        const response = await axios.get(api, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCases(response.data);
      } catch (error) {
        setCases([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [token]);

  const handleAddCase = async () => {
    if (!newCase.title.trim() || !newCase.description.trim() || !newCase.type.trim()) {
      alert('Please fill all required fields.');
      return;
    }
    try {
      const payload = {
        ...newCase,
        client: user?.id,
      };
      console.log(payload);
      const response = await axios.post(api, payload, {
        headers: { Authorization: `Bearer ${token}`,'Content-Type': 'application/json' },
      });
      setCases(prev => [...prev, response.data]);
      setShowAddForm(false);
      setNewCase({ title: '', description: '', type: CASE_TYPES[0].value });
    } catch (error) {
      alert('Failed to add case');
    }
  };

  const handleEditCase = (caseItem: Case) => {
    setEditCaseId(caseItem.id);
    setEditCase({ title: caseItem.title, description: caseItem.description, type: caseItem.type });
  };

  const handleUpdateCase = async (id: string) => {
    if (!editCase.title.trim() || !editCase.description.trim() || !editCase.type.trim()) {
      alert('Please fill all required fields.');
      return;
    }
    try {
      const response = await axios.put(`${api}${id}/`, editCase, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCases(prev => prev.map(c => (c.id === id ? response.data : c)));
      setEditCaseId(null);
    } catch (error) {
      alert('Failed to update case');
    }
  };
  const handleDeleteCase = async (id: string) => {
  if (!window.confirm('Are you sure you want to delete this case?')) return;
  try {
    await axios.delete(`${api}${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCases(prev => prev.filter(c => c.id !== id));
  } catch (error) {
    alert('Failed to delete case');
  }
};

  // ...handleDeleteCase and filteredCases remain unchanged...

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cases</h1>
          <p className="text-gray-600 mt-1">Manage and track your legal cases</p>
        </div>
        {(user?.role === 'client') && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-6 bg-gray-50 p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Add New Case</h2>
          <input
            className="border p-2 w-full mb-2"
            placeholder="Title"
            value={newCase.title}
            onChange={e => setNewCase({ ...newCase, title: e.target.value })}
            maxLength={255}
            minLength={1}
            required
          />
          <textarea
            className="border p-2 w-full mb-2"
            placeholder="Description"
            value={newCase.description}
            onChange={e => setNewCase({ ...newCase, description: e.target.value })}
            minLength={1}
            required
          />
          <select
            className="border p-2 w-full mb-2"
            value={newCase.type}
            onChange={e => setNewCase({ ...newCase, type: e.target.value })}
            required
          >
            {CASE_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button onClick={handleAddCase}>Add</Button>
            <Button variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search cases..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 h-5 w-5" />
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_review">In Review</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    


// ...return ( ... )
      {loading ? (
        <div className="text-center py-12">Loading cases...</div>
      ) : (
        <div className="grid gap-4">
          {filteredCases.map((caseItem) => (
            <Card key={caseItem.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary-600" />
                      {editCaseId === caseItem.id ? (
                        <>
                          <input
                            className="border p-1 mr-2"
                            value={editCase.title}
                            onChange={e => setEditCase({ ...editCase, title: e.target.value })}
                            maxLength={255}
                            minLength={1}
                            required
                          />
                        </>
                      ) : (
                        <h3 className="text-lg font-semibold text-gray-900">{caseItem.title}</h3>
                      )}
                      <Badge variant="default" className={getCaseStatusColor(caseItem.status)}>
                        {caseItem.status === 'open' ? 'Open' : caseItem.status === 'in_review' ? 'In Review' : 'Closed'}
                      </Badge>
                      <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {editCaseId === caseItem.id ? (
                          <select
                            className="border p-1"
                            value={editCase.type}
                            onChange={e => setEditCase({ ...editCase, type: e.target.value })}
                            required
                          >
                            {CASE_TYPES.map(t => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                        ) : (
                          caseItem.type
                        )}
                      </span>
                    </div>
                    {editCaseId === caseItem.id ? (
                      <textarea
                        className="border p-1 w-full mb-2"
                        value={editCase.description}
                        onChange={e => setEditCase({ ...editCase, description: e.target.value })}
                        minLength={1}
                        required
                      />
                    ) : (
                      <p className="text-gray-600 text-sm mb-4">{caseItem.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Created: {formatDate(caseItem.createdAt)}</span>
                      <span>Updated: {formatDate(caseItem.updatedAt)}</span>
                    </div>
                  </div>
                  <Avatar 
                    name={user?.role === 'lawyer' ? 'Client Name' : 'Lawyer Name'} 
                    size="md"
                  />
                </div>
                {user?.role === 'client' && (
                  <div className="flex gap-2 mt-2">
                    {editCaseId === caseItem.id ? (
                      <>
                        <Button size="sm" onClick={() => handleUpdateCase(caseItem.id)}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditCaseId(null)}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" onClick={() => handleEditCase(caseItem)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteCase(caseItem.id)}>Delete</Button>
                      </>
                    )}
                  </div>
                )}
                {user?.role !== 'client' && (
                  <div className="flex gap-2 mt-2">
                    <Link to={`/lawyer/cases/${caseItem.id}/`}>
                      <Button size="sm" variant="secondary">View Details</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredCases.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No cases found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating a new case'}
              </p>
              {(user?.role === 'lawyer' || user?.role === 'client') && (
                <div className="mt-6">
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Case
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};