'use client'

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts'

// مكون الرسم البياني الخطي (الأداء اليومي)
export function PerformanceChart({ data }: { data: any[] }) {
  return (
    <div className="h-48 w-full font-[Tajawal]" dir="ltr"> 
      {/* dir="ltr" مهم جداً للرسوم البيانية لتظهر المحاور بشكل صحيح */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#666', fontSize: 10 }} 
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            hide 
            domain={[0, 100]} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'right' }}
            itemStyle={{ color: '#3B82F6', fontSize: '12px', fontWeight: 'bold' }}
            labelStyle={{ color: '#6B7280', marginBottom: '0.5rem' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            name="متوسط الأداء"
            stroke="#3B82F6" 
            strokeWidth={3} 
            dot={{ fill: 'white', stroke: '#3B82F6', strokeWidth: 2, r: 4 }} 
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// مكون الرسم البياني الشريطي (مقارنة الأقسام)
// التغيير هنا: أصبح يقبل data كـ prop
export function DepartmentsChart({ data }: { data: any[] }) {
  return (
    <div className="h-48 w-full font-[Tajawal]" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={12} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#666', fontSize: 10 }} 
            axisLine={false} 
            tickLine={false} 
            dy={10}
          />
          <Tooltip 
            cursor={{fill: '#F3F4F6'}} 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'right' }}
            itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '10px' }} />
          <Bar dataKey="cs" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="خدمة العملاء" />
          <Bar dataKey="fulfillment" fill="#F97316" radius={[4, 4, 0, 0]} name="تجهيز الطلبات" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}