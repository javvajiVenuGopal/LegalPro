import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarClock,
  ArrowUpRight,
  Clock,
  FileText,
  MessageSquare,
  CreditCard,
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
  getAppointmentStatusColor
} from '../../lib/utils';
import axios from 'axios';

export const ClientDashboard: React.FC = () => {
  const { user, Token: token } = useAuthStore();

  const [cases, setCases] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [casesRes, apptRes, docsRes, invRes, msgRes] = await Promise.all([
          axios.get('http://127.0.0.1:7000/client/cases/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:7000/client/appointments/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:7000/client/documents/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:7000/client/invoices/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:7000/client/messages/', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setCases(casesRes.data);
        setAppointments(apptRes.data);
        setDocuments(docsRes.data);
        setInvoices(invRes.data);
        setMessages(msgRes.data);
      } catch (error){
        
        setCases([]);
        setAppointments([]);
        setDocuments([]);
        setInvoices([]);
        setMessages([]);
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user, token]);

  if (!user) return null;

  // Pending invoices only
  const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'overdue');
  const pendingAmount = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);
  const nextDue = pendingInvoices.length > 0
    ? Math.ceil((new Date(pendingInvoices[0].dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Upcoming appointments (next 7 days)
  const upcomingAppointments = appointments.filter(a => {
    const date = new Date(a.startTime);
    const now = new Date();
    const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your ongoing legal matters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary-600" />
              Active Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cases.length}</div>
            <p className="text-sm text-gray-500 mt-1">Ongoing legal matters</p>
          </CardContent>
          <CardFooter>
            <Link to="/client/cases" className="text-primary-600 text-sm flex items-center hover:text-primary-800 transition-colors">
              View all cases <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarClock className="mr-2 h-5 w-5 text-secondary-600" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-sm text-gray-500 mt-1">Scheduled within next 7 days</p>
          </CardContent>
          <CardFooter>
            <Link to="/client/appointments" className="text-primary-600 text-sm flex items-center hover:text-primary-800 transition-colors">
              View calendar <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-accent-500" />
              Pending Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(pendingAmount)}</div>
            <p className="text-sm text-gray-500 mt-1">
              {nextDue !== null ? `Due in ${nextDue} days` : 'No pending invoices'}
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/client/invoices" className="text-primary-600 text-sm flex items-center hover:text-primary-800 transition-colors">
              View invoices <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Recent Cases</CardTitle>
                <Link to="/client/cases">
                  <Button size="sm" variant="ghost">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {cases.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {cases.slice(0, 3).map((caseItem) => (
                    <div key={caseItem.id} className="py-3 first:pt-0">
                      <div className="flex justify-between items-start mb-1">
                        <Link to={`/client/cases/${caseItem.id}`} className="font-medium text-gray-900 hover:text-primary-600">
                          {caseItem.title}
                        </Link>
                        <Badge variant="default" className={getCaseStatusColor(caseItem.status)}>
                          {caseItem.status === 'open' ? 'Open' : caseItem.status === 'in_review' ? 'In Review' : 'Closed'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center">
                          <Avatar name={caseItem.lawyer?.name || 'Lawyer'} size="xs" />
                          <span className="ml-2 text-sm text-gray-600">{caseItem.lawyer?.name || 'Lawyer'}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Updated {formatDate(caseItem.updatedAt, 'MMM d')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">You don't have any active cases.</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Request Consultation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Recent Messages</CardTitle>
                <Link to="/client/messages">
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
                              to={`/client/messages?case=${message.caseId}`}
                              className="text-primary-600 text-xs font-medium flex items-center hover:text-primary-800"
                            >
                              Reply <ArrowUpRight className="ml-1 h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No messages yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Upcoming Appointments</CardTitle>
                <Link to="/client/appointments">
                  <Button size="sm" variant="ghost">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="py-3 first:pt-0">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <div className="font-medium text-gray-900">{appointment.title}</div>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Clock className="mr-1 h-4 w-4" />
                            {formatDate(appointment.startTime, 'EEE, MMM d')} at {formatDate(appointment.startTime, 'h:mm a')}
                          </div>
                        </div>
                        <Badge variant="default" className={getAppointmentStatusColor(appointment.status)}>
                          {appointment.status === 'confirmed' ? 'Confirmed' : appointment.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center">
                          <Avatar name={appointment.lawyer?.name || 'Lawyer'} size="xs" />
                          <span className="ml-2 text-sm text-gray-600">{appointment.lawyer?.name || 'Lawyer'}</span>
                        </div>
                        <Link to={`/client/appointments/${appointment.id}`}>
                          <Button size="sm" variant="outline">Details</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No upcoming appointments.</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Schedule Appointment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Recent Documents</CardTitle>
                <Link to="/client/documents">
                  <Button size="sm" variant="ghost">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {documents.slice(0, 3).map((document) => (
                    <div key={document.id} className="py-3 first:pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-md bg-primary-50 flex items-center justify-center text-primary-600">
                            <FileText size={16} />
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-sm text-gray-900">{document.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Uploaded {formatDate(document.uploadedAt, 'MMM d')}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No documents yet.</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Upload Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Pending Invoices</CardTitle>
                <Link to="/client/invoices">
                  <Button size="sm" variant="ghost">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {pendingInvoices.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {pendingInvoices.slice(0, 3).map((invoice) => (
                    <div key={invoice.id} className="py-3 first:pt-0">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <div className="font-medium text-gray-900">{formatCurrency(invoice.amount)}</div>
                          <div className="text-sm text-gray-600 mt-0.5">{invoice.description}</div>
                        </div>
                        <Badge variant="warning">
                          Due in {Math.ceil((new Date(invoice.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <Link to={`/payment/pay?invoice=${invoice.id}`}>
                          <Button size="sm">Pay Now</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pending invoices.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};