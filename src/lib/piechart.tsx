import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

interface Props {
  data: any[];
  dataKey: string;
  nameKey: string;
}

export const PieChart: React.FC<Props> = ({ data, dataKey, nameKey }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RechartsPieChart>
      <Tooltip />
      <Pie
        data={data}
        dataKey={dataKey}
        nameKey={nameKey}
        cx="50%"
        cy="50%"
        outerRadius={100}
        fill="#8884d8"
        label
      >
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </RechartsPieChart>
  </ResponsiveContainer>
);
