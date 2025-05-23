import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users,
  Briefcase,
  CalendarClock,
  Clock,
  FileText,
  MessageSquare,
  CreditCard,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { 
  formatDate, 
  formatCurrency,
  getCaseStatusColor,
  getAppointmentStatusColor,
  getInvoiceStatusColor
} from '../../lib/utils';
import axios from 'axios';

export const LawyerDashboard: React.FC = () => {
  const { user, Token: token } = useAuthStore();

  const [clients, setClients] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [clientsRes, casesRes, apptRes, invRes, msgRes] = await Promise.all([
          axios.get('http://127.0.0.1:7000/users/clients/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:7000/law/cases/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:7000/law/appointments/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:7000/law/invoices/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:7000/law/messages/', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setClients(clientsRes.data);
        setCases(casesRes.data);
        setAppointments(apptRes.data);
        
        setInvoices(invRes.data);
        setMessages(msgRes.data);
      } catch {
        setClients([]);
        setCases([]);
        setAppointments([]);
        setInvoices([]);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user, token]);
console.log("clients:", clients,"cases:", cases,"appointment:", appointments,"invoice:", invoices,"msg:" , messages);
  if (!user) return null;

  // Calculate quick stats
  const totalCases = cases.length;
  const totalClients = clients.length;
 const pendingAppointments = appointments.filter(a => a.status === 'pending').length;

const todayAppointments = appointments.filter(a => {
  const apptDate = new Date(a.start_time);
  const now = new Date();

  return apptDate.getUTCDate() === now.getUTCDate() &&
         apptDate.getUTCMonth() === now.getUTCMonth() &&
         apptDate.getUTCFullYear() === now.getUTCFullYear();
}).length;
const handleAppointmentAction = async (appointmentId: number, newStatus: 'confirmed' | 'cancelled') => {
  try {
    // Send a PATCH request to update the appointment status
    const response = await axios.patch(
      `http://127.0.0.1:7000/law/appointments/${appointmentId}/`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Update local state
    setAppointments(prevAppointments =>
      prevAppointments.map(appt =>
        appt.id === appointmentId ? { ...appt, status: newStatus } : appt
      )
    );
  } catch (error) {
    console.error('Error updating appointment status:', error);
    alert('Failed to update appointment status. Please try again.');
  }
};

console.log('Pending appointments:', invoices);

  // Revenue stats
  const pendingRevenue = invoices
    .filter(i => i.status === 'pending' )
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  
  const paidRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your practice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary-600" />
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClients}</div>
            <p className="text-sm text-gray-500 mt-1">Total active clients</p>
          </CardContent>
          <CardFooter>
            <Link to="/lawyer/clients" className="text-primary-600 text-sm flex items-center hover:text-primary-800 transition-colors">
              View all clients <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-secondary-600" />
              Active Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCases}</div>
            <p className="text-sm text-gray-500 mt-1">Ongoing legal matters</p>
          </CardContent>
          <CardFooter>
            <Link to="/lawyer/cases" className="text-primary-600 text-sm flex items-center hover:text-primary-800 transition-colors">
              View all cases <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarClock className="mr-2 h-5 w-5 text-accent-500" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayAppointments}</div>
            <p className="text-sm text-gray-500 mt-1">Appointments today</p>
          </CardContent>
          <CardFooter>
            <Link to="/lawyer/appointments" className="text-primary-600 text-sm flex items-center hover:text-primary-800 transition-colors">
              View calendar <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-success-600" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(pendingRevenue)}</div>
            <p className="text-sm text-gray-500 mt-1">Pending invoices</p>
          </CardContent>
          <CardFooter>
            <Link to="/lawyer/invoices" className="text-primary-600 text-sm flex items-center hover:text-primary-800 transition-colors">
              View invoices <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Today's Schedule</CardTitle>
                <Link to="/lawyer/appointments">
                  <Button size="sm" variant="ghost">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {todayAppointments > 0 ? (
                <div className="divide-y divide-gray-100">
                  {appointments
                    .filter(a => {
                      const appointmentDate = new Date(a.start_time);
                      const today = new Date();
                      return appointmentDate.getDate() === today.getDate() &&
                            appointmentDate.getMonth() === today.getMonth() &&
                            appointmentDate.getFullYear() === today.getFullYear();
                    })
                    .map((appointment) => (
                      <div key={appointment.id} className="py-3 first:pt-0">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <div className="font-medium text-gray-900">{appointment.title}</div>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Clock className="mr-1 h-4 w-4" />
                              {formatDate(appointment.start_time, 'h:mm a')} - {formatDate(appointment.end_time, 'h:mm a')}
                            </div>
                          </div>
                          <Badge variant="default" className={getAppointmentStatusColor(appointment.status)}>
                            {appointment.status === 'confirmed' ? 'Confirmed' : appointment.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center">
                            <Avatar name={appointment.client?.name || 'Client'} size="xs" />
                            <span className="ml-2 text-sm text-gray-600">{appointment.client?.name || 'Client'}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Link to={`/lawyer/cases/${appointment.case}`}>
                              <Button size="sm" variant="outline">Case Details</Button>
                            </Link>
                            <Link to={`/lawyer/appointments/${appointment.id}`}>
                              <Button size="sm" variant="outline">Join Meeting</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-gray-500">No appointments scheduled for today.</p>
                  <p className="text-sm text-gray-400">Enjoy your day!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Cases</CardTitle>
                  <Link to="/lawyer/cases">
                    <Button size="sm" variant="ghost">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-gray-100">
                  {cases.slice(0, 3).map((caseItem) => (
                    <div key={caseItem.id} className="py-3 first:pt-0">
                      <div className="flex justify-between items-start mb-1">
                        <Link to={`/lawyer/cases/${caseItem.id}`} className="font-medium text-gray-900 hover:text-primary-600">
                          {caseItem.title}
                        </Link>
                        <Badge variant="default" className={getCaseStatusColor(caseItem.status)}>
                          {caseItem.status === 'open' ? 'Open' : caseItem.status === 'in_review' ? 'In Review' : 'Closed'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center">
                          <Avatar name={caseItem.client?.name || 'Client'} size="xs" />
                          <span className="ml-2 text-sm text-gray-600">{caseItem.client?.name || 'Client'}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Updated {formatDate(caseItem.updatedAt, 'MMM d')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Messages</CardTitle>
                  <Link to="/lawyer/messages">
                    <Button size="sm" variant="ghost">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {messages.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {messages.slice(0, 3).map((message) => (
                      <div key={message.id} className="py-3 first:pt-0">
                        <div className="flex items-start">
                          <Avatar name={message.sender?.name || 'Sender'} size="sm" className="mr-3 mt-1" />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-900">{message.sender?.name || 'Sender'}</span>
                              <span className="text-xs text-gray-500">
                                {formatDate(message.createdAt, 'h:mm a')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {message.content.length > 100
                                ? `${message.content.substring(0, 100)}...`
                                : message.content}
                            </p>
                            <div className="mt-2">
                              <Link
                                to={`/lawyer/messages?case=${message.caseId}`}
                                className="text-primary-600 text-xs font-medium hover:text-primary-800"
                              >
                                Reply
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-gray-500">No unread messages.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
         <Card>
  <CardHeader className="pb-0">
    <div className="flex justify-between items-center">
      <CardTitle>Pending Approvals</CardTitle>
      <Link to="/lawyer/appointments">
        <Button size="sm" variant="ghost">View All</Button>
      </Link>
    </div>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {appointments.filter(a => a.status === 'pending').length > 0 ? (
        appointments
          .filter(a => a.status === 'pending')
          .map(appointment => (
            <div key={appointment.id} className="rounded-md border border-warning-200 bg-warning-50 p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-warning-800 text-sm">New Appointment Request</h4>
                  <p className="text-xs text-warning-700 mt-1">From: {appointment.client?.name || 'Unknown Client'}</p>
                  <p className="text-xs text-warning-600 mt-0.5">
                    For: {formatDate(appointment.start_time, 'MMM d, h:mm a')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs py-1 px-2"
                    onClick={() => handleAppointmentAction(appointment.id, 'cancelled')}
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    variant="accent"
                    className="text-xs py-1 px-2"
                    onClick={() => handleAppointmentAction(appointment.id, 'confirmed')}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          ))
      ) : (
        <p className="text-sm text-gray-500 text-center">No pending requests.</p>
      )}
    </div>
  </CardContent>
</Card>


          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-primary-800">
                        Invoices (Month-to-Date)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-primary-800">
                        {formatCurrency(paidRevenue + pendingRevenue)}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-1 text-xs flex rounded-full bg-gray-200">
                    <div 
                      style={{ width: `${(paidRevenue / (paidRevenue + pendingRevenue || 1)) * 100}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-success-500"
                    ></div>
                    <div 
                      style={{ width: `${(pendingRevenue / (paidRevenue + pendingRevenue || 1)) * 100}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-warning-500"
                    ></div>
                  </div>
                  <div className="flex text-xs justify-between mt-1">
                    <span className="text-success-700 flex items-center">
                      <span className="h-2 w-2 rounded-full bg-success-500 mr-1"></span>
                      Paid ({formatCurrency(paidRevenue)})
                    </span>
                    <span className="text-warning-700 flex items-center">
                      <span className="h-2 w-2 rounded-full bg-warning-500 mr-1"></span>
                      Pending ({formatCurrency(pendingRevenue)})
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Recent Invoices</h5>
                  <div className="divide-y divide-gray-100">
                    {invoices.slice(0, 3).map((invoice) => (
                      <div key={invoice.id} className="py-2 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(invoice.amount)}</div>
                            <div className="text-xs text-gray-500">{invoice.client?.name || 'Client'}</div>
                          </div>
                          <Badge variant="default" className={getInvoiceStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Your Clients</CardTitle>
                <Link to="/lawyer/clients">
                  <Button size="sm" variant="ghost">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-100">
                {clients.slice(0, 5).map((client) => (
                  <div key={client.id} className="py-3 first:pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar name={client.name} size="sm" className="mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            {client.activeCases || 0} active {client.activeCases === 1 ? 'case' : 'cases'}
                          </div>
                        </div>
                      </div>
                      <Link to={`/lawyer/clients/${client.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};