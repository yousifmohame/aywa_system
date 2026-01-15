'use client'

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'

export default function EmployeeProfileChart({ data }: { data: any[] }) {
  return (
    <div className="h-40 w-full min-h-[160px]" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#666', fontSize: 9 }} 
            axisLine={{ stroke: '#666', strokeWidth: 0.5 }}
            tickLine={false}
            dy={5}
          />
          <YAxis hide domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#3B82F6', fontSize: '12px', fontWeight: 'bold' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#3B82F6" 
            strokeWidth={2} 
            dot={{ fill: 'white', stroke: '#3B82F6', strokeWidth: 2, r: 3 }} 
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}