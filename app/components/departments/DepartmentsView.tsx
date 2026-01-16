'use client'

import { useState } from 'react'
import { 
  Headset, Package, PhoneIncoming, AlertTriangle, 
  Award, Briefcase, Timer, BarChart3
} from 'lucide-react'

export default function DepartmentsView({ departments }: { departments: any[] }) {
  const [activeTabId, setActiveTabId] = useState<string>(departments[0]?.id || '')

  const activeDept = departments.find(d => d.id === activeTabId)
  
  const isService = activeDept?.name.includes('عملاء') || activeDept?.name.includes('اتصال')
  const isFulfillment = activeDept?.name.includes('تجهيز') || activeDept?.name.includes('تنفيذ')

  if (!departments || departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-100">
        <Briefcase className="text-gray-300 mb-2" size={48} />
        <p className="text-gray-500 font-bold">لا توجد أقسام مضافة للنظام بعد.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-[Tajawal] overflow-x-hidden" dir="rtl">
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
        {departments.map((dept) => (
          <button
            key={dept.id}
            onClick={() => setActiveTabId(dept.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTabId === dept.id 
                ? 'bg-[#0f172a] text-white' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {dept.name.includes('عملاء') ? <Headset size={14} /> : <Package size={14} />}
            {dept.name}
          </button>
        ))}
      </div>

      {activeDept && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {isService ? (
              <StatCard 
                title="متوسط سرعة الاستجابة" 
                value={`${activeDept.stats.avgTime} ثانية`} 
                icon={Timer} 
                color="text-blue-600" bg="bg-blue-50" 
              />
            ) : (
              <StatCard 
                title="الطلبات المجهزة" 
                value={activeDept.stats.orders} 
                icon={Package} 
                color="text-orange-600" bg="bg-orange-50" 
              />
            )}
            
            <StatCard 
              title={isService ? "إجمالي المكالمات" : "حجم العمل"} 
              value={isService ? activeDept.stats.calls : activeDept.stats.orders} 
              icon={isService ? PhoneIncoming : BarChart3} 
              color="text-purple-600" bg="bg-purple-50" 
            />
            
            <StatCard 
              title={isService ? "تقييم الجودة" : "دقة التجهيز"} 
              value={`${isService ? activeDept.stats.avgPerformance : activeDept.stats.accuracy}%`} 
              icon={Award} 
              color="text-green-600" bg="bg-green-50" 
            />
            
            <StatCard 
              title={isService ? "تذاكر معلقة" : "طلبات مرتجعة"} 
              value={isService ? activeDept.stats.pending : activeDept.stats.returns} 
              icon={AlertTriangle} 
              color="text-red-600" bg="bg-red-50" 
            />
          </div>

          {/* Top Employees Cards بدل جدول */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <Award size={16} className="text-yellow-500" />
              أفضل الموظفين أداءً — {activeDept.name}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeDept.topEmployees.map((record: any, index: number) => (
                <div
                  key={record.id}
                  className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3"
                >
                  
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {record.user.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {record.user.fullName}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {record.user.email}
                        </p>
                      </div>
                    </div>

                    {/* Rank Badge */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="text-xs text-gray-600">
                    {isService 
                      ? `متوسط سرعة الرد: ${record.avgResponseTime || 0} ثانية`
                      : `الطلبات المنجزة: ${record.ordersPrepared || 0}`}
                  </div>

                  {/* Score Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>تقييم الجودة</span>
                      <span>{record.score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          record.score >= 90 ? 'bg-green-500' :
                          record.score >= 75 ? 'bg-blue-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${record.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {activeDept.topEmployees.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-400 text-sm">
                  لا توجد بيانات أداء مسجلة لهذا القسم اليوم.
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

/* KPI Card */
function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 font-bold mb-1">{title}</p>
        <h3 className="text-xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${bg} ${color}`}>
        <Icon size={22} strokeWidth={2.3} />
      </div>
    </div>
  )
}
