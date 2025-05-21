import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
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

export const LineChart: React.FC<Props> = ({ data, xKey, yKey, color = '#4F46E5' }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
      <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
      <XAxis dataKey={xKey} />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} />
    </RechartsLineChart>
  </ResponsiveContainer>
);
