import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  Clock,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate, formatCurrency, getInvoiceStatusColor } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { Invoice } from '../../types';
import axios from 'axios';

export const Invoices: React.FC = () => {
  const { user, Token: token } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // New Invoice Modal
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    caseId: '',
    clientId: '',
    amount: '',
    dueDate: '',
    description: '',
  });

  // Fetch invoices from API
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:7000/law/invoices/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data)
        const lawyerInvoices = response.data.filter((invoice: Invoice) => invoice.lawyer === user?.id);
      setInvoices(lawyerInvoices);
      } catch {
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [token]);

  // Filtering
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    // Client sees only their invoices, lawyer sees all
    if (user?.role === 'client') {
      return matchesSearch && matchesStatus && invoice.clientId === user.id;
    }
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalPending = invoices
    .filter(i => (i.status === 'pending' || i.status === 'overdue') && (user?.role !== 'client' || i.clientId === user.id))
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const totalPaid = invoices
    .filter(i => i.status === 'paid' && (user?.role !== 'client' || i.clientId === user.id))
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const totalOverdue = invoices
    .filter(i => i.status === 'overdue' && (user?.role !== 'client' || i.clientId === user.id))
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const totalThisMonth = invoices
    .filter(i => {
      const invoiceDate = new Date(i.createdAt);
      const now = new Date();
      return invoiceDate.getMonth() === now.getMonth() &&
             invoiceDate.getFullYear() === now.getFullYear() &&
             (user?.role !== 'client' || i.clientId === user.id);
    })
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  // Download handler
  const handleDownload = async (invoiceId: string) => {
    try {
      // Adjust endpoint if your backend returns a file URL or blob
      const response = await axios.get(
        `http://127.0.0.1:7000/law/invoices/${invoiceId}/download/`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to download invoice');
    }
  };

  // Pay Now handler (dummy, replace with payment gateway logic)
  const handlePayNow = async (invoiceId: string) => {
    try {
      // Example: mark as paid (replace with real payment logic)
      await axios.post(
        `http://127.0.0.1:7000/law/invoices/${invoiceId}/pay/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInvoices(prev =>
        prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'paid', paidAt: new Date().toISOString() } : inv)
      );
      alert('Payment successful!');
    } catch {
      alert('Payment failed');
    }
  };

  // New Invoice handler (lawyer only)
  const handleCreateInvoice = async () => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:7000/law/invoices/',
        {
          ...newInvoice,
          amount: Number(newInvoice.amount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInvoices(prev => [...prev, response.data]);
      setShowNewInvoice(false);
      setNewInvoice({ caseId: '', clientId: '', amount: '', dueDate: '', description: '' });
    } catch {
      alert('Failed to create invoice');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage billing and payments</p>
        </div>
        {user?.role === 'lawyer' && (
          <Button onClick={() => setShowNewInvoice(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalPending)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalPaid)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-success-50 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <h3 className="text-2xl font-bold text-error-600 mt-1">
                  {formatCurrency(totalOverdue)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-error-50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-error-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalThisMonth)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-secondary-50 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-secondary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search invoices..."
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
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : filteredInvoices.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="py-4 first:pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            Invoice #{invoice.id}
                          </span>
                          <Badge 
                            variant="default" 
                            className={getInvoiceStatusColor(invoice.status)}
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                          {formatCurrency(invoice.amount)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{invoice.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Created: {formatDate(invoice.createdAt)}</span>
                        <span>Due: {formatDate(invoice.dueDate)}</span>
                        {invoice.paidAt && (
                          <span>Paid: {formatDate(invoice.paidAt)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDownload(invoice.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      {invoice.status === 'pending' && user?.role === 'client' && (
                        <Button size="sm" onClick={() => handlePayNow(invoice.id)}>Pay Now</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'No invoices match the selected filters'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Invoice Modal */}
      {showNewInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowNewInvoice(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">Create New Invoice</h2>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Case ID"
              value={newInvoice.caseId}
              onChange={e => setNewInvoice({ ...newInvoice, caseId: e.target.value })}
            />
            <input
              className="border p-2 w-full mb-2"
              placeholder="Client ID"
              value={newInvoice.clientId}
              onChange={e => setNewInvoice({ ...newInvoice, clientId: e.target.value })}
            />
            <input
              className="border p-2 w-full mb-2"
              placeholder="Amount"
              type="number"
              value={newInvoice.amount}
              onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
            />
            <input
              className="border p-2 w-full mb-2"
              placeholder="Due Date"
              type="date"
              value={newInvoice.dueDate}
              onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
            />
            <textarea
              className="border p-2 w-full mb-2"
              placeholder="Description"
              value={newInvoice.description}
              onChange={e => setNewInvoice({ ...newInvoice, description: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateInvoice}>Create</Button>
              <Button variant="ghost" onClick={() => setShowNewInvoice(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};