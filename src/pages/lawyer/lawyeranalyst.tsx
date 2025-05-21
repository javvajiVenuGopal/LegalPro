import React, { useEffect, useState } from 'react';
import {
  LineChart,
  BarChart,
  PieChart,
} from '../../lib/charts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatCurrency } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

export const LawyerAnalyticsPage: React.FC = () => {
  const { Token: token } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:7000/law/analytics/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  if (loading) {
    return <div className="p-6 text-center text-lg">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="p-6 text-center text-red-600">Failed to load analytics.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue (MTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-600">{formatCurrency(data.revenueMTD)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appointments Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.appointmentsCompleted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={data.revenueOverTime} xKey="month" yKey="revenue" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Case Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={data.caseStats} dataKey="count" nameKey="type" />
          </CardContent>
        </Card>
      </div>

      {/* Table / List Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Clients by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-100">
              {data.topClients.map((client: any) => (
                <li key={client.name} className="py-2 flex justify-between">
                  <span className="font-medium text-gray-800">{client.name}</span>
                  <span className="text-gray-600">{formatCurrency(client.amount)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Case Outcome Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={[
                { label: 'Cases Won', value: data.casesWon },
                { label: 'Total Cases', value: data.totalCases },
              ]}
              xKey="label"
              yKey="value"
            />
          </CardContent>
        </Card>
      </div>
    </div>

  );
};