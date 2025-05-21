import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
}

export const BarChart: React.FC<Props> = ({ data, xKey, yKey, color = '#10B981' }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
      <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
      <XAxis dataKey={xKey} />
      <YAxis />
      <Tooltip />
      <Bar dataKey={yKey} fill={color} />
    </RechartsBarChart>
  </ResponsiveContainer>
);
