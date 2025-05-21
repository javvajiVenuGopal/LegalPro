// src/pages/lawyer/CaseManagementPage.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ChevronRight, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { formatDate, getCaseStatusColor } from '../../lib/utils';

const mockCases = [
  {
    id: '1',
    title: 'Child Custody Arrangement',
    status: 'open',
    updatedAt: new Date().toISOString(),
    client: {
      id: '1',
      name: 'Amanda Wilson',
    },
  },
  {
    id: '2',
    title: 'Property Settlement Dispute',
    status: 'in_review',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      id: '2',
      name: 'Robert Thompson',
    },
  },
  {
    id: '3',
    title: 'Will Preparation',
    status: 'closed',
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      id: '1',
      name: 'Amanda Wilson',
    },
  },
];

export const CaseManagementPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_review' | 'closed'>('all');

  const filteredCases =
    filterStatus === 'all'
      ? mockCases
      : mockCases.filter((c) => c.status === filterStatus);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all your active and closed cases.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            className="border border-gray-300 rounded-md text-sm px-2 py-1"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_review">In Review</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((caseItem) => (
          <Card key={caseItem.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-primary-600" />
                  {caseItem.title}
                </span>
                <Badge className={getCaseStatusColor(caseItem.status)}>
                  {caseItem.status === 'in_review'
                    ? 'In Review'
                    : caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 mb-2">
                Updated: {formatDate(caseItem.updatedAt, 'MMM d, yyyy')}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar name={caseItem.client.name} size="xs" />
                  <span className="ml-2 text-sm text-gray-700">{caseItem.client.name}</span>
                </div>
                <Link to={`/lawyer/cases/${caseItem.id}`} className="text-primary-600 text-sm flex items-center hover:text-primary-800">
                  View <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center text-gray-500 mt-12">
          <p>No cases found for selected status.</p>
        </div>
      )}
    </div>
  );
};
