import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Users, Plus, Trash2, Edit } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import { Appointment } from '../../types';
import axios from 'axios';
import { getAppointmentStatusColor } from '../../lib/utils'; // adjust path

import { isValid, parseISO, format } from 'date-fns';
export const Appointments: React.FC = () => {
  const { user, Token: token } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    status: 'pending',
    caseId: '',
    clientId: '',
    lawyerId: '',
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newData, setNewData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    status: 'pending',
    caseId: '',
    clientId: '',
    lawyerId: '',
  });
const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:7000/law/appointments/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        //console.log('Appointments:', response.data);
        setAppointments(response.data);
      } catch {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
     const fetchCases = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:7000/law/cases/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCases(response.data); // Assuming response.data is an array of cases
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    }
  };

  fetchCases();
    fetchAppointments();
  }, [token]);
//console.log("Appointments:", appointments);
  const now = new Date();
const filteredAppointments = appointments.filter(appointment => {
  const appointmentDate = new Date(appointment.end_time);
  return view === 'upcoming' ? appointmentDate >= now : appointmentDate < now;
});

//console.log('Filtered Appointments:', filteredAppointments);
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await axios.delete(`http://127.0.0.1:7000/law/appointments/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

 

const handleEdit = (appointment: Appointment) => {
  const parsedStart = parseISO(appointment.start_time);
  const parsedEnd = parseISO(appointment.end_time);

  setEditId(appointment.id);
  setEditData({
    title: appointment.title,
    description: appointment.description ?? '',
    startTime: isValid(parsedStart) ? format(parsedStart, 'PPpp') : 'N/A',
    endTime: isValid(parsedEnd) ? format(parsedEnd, 'PPpp') : 'N/A',
    status: appointment.status,
    caseId: appointment.case || '',
    clientId: appointment.client?.toString() || '',
    lawyerId: appointment.lawyer?.toString() || '',
  });
  console.log("editData", editData);
};

const formatDate = (date: string) => {
  const d = new Date(date);
  

  // Check if the date is valid
  if (isNaN(d.getTime())) {
    return "Invalid Date";
  }

  // Format with both date and time
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // change to true if you prefer 12-hour format
    
  };

  return d.toLocaleString('en-GB', options); // en-GB gives DD/MM/YYYY
};


 const handleSaveEdit = async () => {
  try {
    if (!editData.title || editData.title.length < 1 || editData.title.length > 255) {
      alert('Title is required and must be between 1 and 255 characters.');
      return;
    }
    if (!editData.clientId) {
      alert('Client ID is required.');
      return;
    }
    if (!editData.lawyerId) {
      alert('Lawyer ID is required.');
      return;
    }

    const formattedData = {
      title: editData.title,
      client: editData.clientId,                // must match backend field
      lawyer: editData.lawyerId,                // must match backend field
      start_time: new Date(editData.startTime).toISOString(),
      end_time: new Date(editData.endTime).toISOString(),
    };

    const response = await axios.put(
      `http://127.0.0.1:7000/law/appointments/${editId}/`,
      formattedData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setAppointments(prev =>
      prev.map(a => (a.id === editId ? response.data : a))
    );
    setEditId(null);
  } catch (error) {
    console.error('Failed to update:', error.response?.data || error.message);
    alert('Failed to update');
  }
};



  const handleAdd = async () => {
  try {
    if (!newData.title || newData.title.length < 1 || newData.title.length > 255) {
      alert('Title is required and must be between 1 and 255 characters.');
      return;
    }
    if (!newData.clientId || !newData.lawyerId || !newData.startTime || !newData.endTime) {
      alert('All fields are required.');
      return;
    }

    const payload = {
      title: newData.title,
      description: newData.description,
      start_time: newData.startTime,
      end_time: newData.endTime,
      status: newData.status,
      case: newData.caseId,
      client: newData.clientId,
      lawyer: newData.lawyerId,
    };
const toDatetimeLocalString = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ""; // Handle invalid dates

  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // Months are zero-indexed
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

    const response = await axios.post(
      'http://127.0.0.1:7000/law/appointments/',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setAppointments(prev => [...prev, response.data]);
    setShowAdd(false);
    setNewData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      status: 'pending',
      caseId: '',
      clientId: '',
      lawyerId: '',
    });
  } catch (error) {
    console.error("Error adding appointment:", error.response?.data || error.message);
    alert('Failed to add appointment.');
  }
};


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your meetings and consultations</p>
        </div>
        {user?.role === 'lawyer' && (
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        )}
      </div>

      {showAdd && user?.role === 'lawyer' && (
        <div className="mb-6 bg-gray-50 p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Add Appointment</h2>
          <input
            className="border p-2 w-full mb-2"
            placeholder="Title"
            value={newData.title}
            onChange={e => setNewData({ ...newData, title: e.target.value })}
          />
          <textarea
            className="border p-2 w-full mb-2"
            placeholder="Description"
            value={newData.description}
            onChange={e => setNewData({ ...newData, description: e.target.value })}
          />
          <input
            type="datetime-local"
            className="border p-2 w-full mb-2"
            value={newData.startTime}
            onChange={e => setNewData({ ...newData, startTime: e.target.value })}
          />
          <input
            type="datetime-local"
            className="border p-2 w-full mb-2"
            value={newData.endTime}
            onChange={e => setNewData({ ...newData, endTime: e.target.value })}
          />
          <select
            className="border p-2 w-full mb-2"
            value={newData.status}
            onChange={e => setNewData({ ...newData, status: e.target.value })}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
         <select
  className="border p-2 w-full mb-2"
  value={newData.caseId}
  onChange={(e) => {
  const selectedId = e.target.value;
  const selectedCase = cases.find((c) => c.id === parseInt(selectedId));

  if (selectedCase) {
    setNewData({
      ...newData,
      caseId: selectedCase.id,
      title: selectedCase.title,
      clientId: selectedCase.client,
      lawyerId: selectedCase.lawyer,
    });
  } else {
    setNewData({ ...newData, caseId: selectedId });
  }
}}

>
  <option value="">Select a Case</option>
  {cases.map((c) => (
    <option key={c.id} value={c.id}>
      {c.title}
    </option>
  ))}
</select>
          <input
            className="border p-2 w-full mb-2"
            placeholder="Client ID"
            value={newData.clientId}
            onChange={e => setNewData({ ...newData, clientId: e.target.value })}
          />
          <input
            className="border p-2 w-full mb-2"
            placeholder="Lawyer ID"
            value={newData.lawyerId}
            onChange={e => setNewData({ ...newData, lawyerId: e.target.value })}
          />
          <div className="flex gap-2">
            <Button onClick={handleAdd}>Add</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Schedule</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={view === 'upcoming' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setView('upcoming')}
                  >
                    Upcoming
                  </Button>
                  <Button
                    variant={view === 'past' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setView('past')}
                  >
                    Past
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                {loading ? (
                  <div className="text-center py-12">Loading...</div>
                ) : filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {editId === appointment.id ? (
                              <>
                                <input
                                  className="border p-2 w-full mb-2"
                                  value={editData.title}
                                  onChange={e => setEditData({ ...editData, title: e.target.value })}
                                />
                                <textarea
                                  className="border p-2 w-full mb-2"
                                  value={editData.description}
                                  onChange={e => setEditData({ ...editData, description: e.target.value })}
                                />
                                <input
                                  type="datetime-local"
                                  className="border p-2 w-full mb-2"
                                  value={editData.startTime}
                                  onChange={e => setEditData({ ...editData, startTime: e.target.value })}
                                />
                                <input
                                  type="datetime-local"
                                  className="border p-2 w-full mb-2"
                                  value={editData.endTime}
                                  onChange={e => setEditData({ ...editData, endTime: e.target.value })}
                                />
                                <select
                                  className="border p-2 w-full mb-2"
                                  value={editData.status}
                                  onChange={e => setEditData({ ...editData, status: e.target.value })}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="cancelled">Cancelled</option>
                                  <option value="completed">Completed</option>
                                </select>
                                <input
                                  className="border p-2 w-full mb-2"
                                  placeholder="Case ID (optional)"
                                  value={editData.caseId}
                                  onChange={e => setEditData({ ...editData, caseId: e.target.value })}
                                />
                                <input
                                  className="border p-2 w-full mb-2"
                                  placeholder="Client ID"
                                  value={editData.clientId}
                                  onChange={e => setEditData({ ...editData, clientId: e.target.value })}
                                />
                                <input
                                  className="border p-2 w-full mb-2"
                                  placeholder="Lawyer ID"
                                  value={editData.lawyerId}
                                  onChange={e => setEditData({ ...editData, lawyerId: e.target.value })}
                                />
                                <div className="flex gap-2 mb-2">
                                  <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>Cancel</Button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="flex flex-col">
                                    <p className="font-semibold">{appointment.title}</p>
                                    <p className="text-sm">{appointment.description}</p>
                                    
                                    <p className="text-xs">{formatDate(appointment.start_time)} - {formatDate(appointment.end_time)}</p>
                                  </div>
                                  <Badge color={getAppointmentStatusColor(appointment.status)}>{appointment.status}</Badge>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handleEdit(appointment)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button size="sm" variant="outline" color="destructive" onClick={() => handleDelete(appointment.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">No appointments found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Appointments;