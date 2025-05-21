import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDate, formatCurrency, getCaseStatusColor, getAppointmentStatusColor, getInvoiceStatusColor } from '../../lib/utils';
import { Clock, FileText, CalendarClock, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// ...existing imports...

// Optionally, update your formatDate utility for safety
// export function formatDate(date: string | Date | undefined | null, formatStr = 'PPP') {
//   if (!date) return 'N/A';
//   try {
//     return format(new Date(date), formatStr);
//   } catch {
//     return 'N/A';
//   }
// }

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const token = useAuthStore((state) => state.Token);

  const [client, setClient] = useState<any>(null);
  const [clientCases, setClientCases] = useState<any[]>([]);
  const [clientAppointments, setClientAppointments] = useState<any[]>([]);
  const [clientInvoices, setClientInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:7000/users/clients/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClient(response.data.client);
        setClientCases(response.data.cases || []);
        setClientAppointments(response.data.appointments || []);
        setClientInvoices(response.data.invoices || []);
      } catch (err: any) {
        setError('Client not found or error fetching data');
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id, token]);

  // Helper for safe date formatting
  const safeFormatDate = (date: any, formatStr = 'PPP') => {
    if (!date) return 'N/A';
    try {
      return formatDate(date, formatStr);
    } catch {
      return 'N/A';
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error || !client) return <div className="p-6 text-red-600 font-semibold">{error || 'Client not found'}</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center">
        <Avatar name={client.name} size="lg" className="mr-4" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-sm text-gray-600">{client.email}</p>
          <p className="text-xs text-gray-500">
            Joined {safeFormatDate(client.joinedAt, 'PPP')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary-600" />
              Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientCases.length > 0 ? (
              <div className="space-y-3">
                {clientCases.map(c => (
                  <div key={c.id} className="flex justify-between items-start">
                    <div>
                      <Link to={`/lawyer/cases/${c.id}`} className="font-medium text-gray-900 hover:text-primary-600">
                        {c.title}
                      </Link>
                      <p className="text-xs text-gray-500">
                        Last updated {safeFormatDate(c.updatedAt, 'PPP')}
                      </p>
                    </div>
                    <Badge className={getCaseStatusColor(c.status)}>{c.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No cases found for this client.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarClock className="mr-2 h-5 w-5 text-accent-500" />
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientAppointments.length > 0 ? (
              <div className="space-y-3">
                {clientAppointments.map(app => (
                  <div key={app.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{app.title}</p>
                        <p className="text-xs text-gray-500">
                          {safeFormatDate(app.startTime, 'PPP p')} - {safeFormatDate(app.endTime, 'p')}
                        </p>
                      </div>
                      <Badge className={getAppointmentStatusColor(app.status)}>{app.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No upcoming appointments.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-success-600" />
              Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientInvoices.length > 0 ? (
              <div className="space-y-3">
                {clientInvoices.map(inv => (
                  <div key={inv.id} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{formatCurrency(inv.amount)}</p>
                      <p className="text-xs text-gray-500">{inv.description}</p>
                    </div>
                    <Badge className={getInvoiceStatusColor(inv.status)}>{inv.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No invoices for this client.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Link to="/lawyer/clients">
        <Button variant="ghost">← Back to Clients</Button>
      </Link>
    </div>
  );
};