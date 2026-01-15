'use client'

import { useState } from 'react'
import { 
  Headset, Package, PhoneIncoming, AlertTriangle, 
  Award, Briefcase, Timer, BarChart3
} from 'lucide-react'

export default function DepartmentsView({ departments }: { departments: any[] }) {
  const [activeTabId, setActiveTabId] = useState<string>(departments[0]?.id || '')

  const activeDept = departments.find(d => d.id === activeTabId)
  
  // تحديد نوع القسم الحالي لتغيير العناوين والوحدات
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
    <div className="space-y-6 font-[Tajawal]" dir="rtl">
      
      {/* Tabs Switcher */}
      <div className="bg-white p-1.5 rounded-xl border border-gray-100 inline-flex shadow-sm flex-wrap gap-1">
        {departments.map((dept) => (
          <button
            key={dept.id}
            onClick={() => setActiveTabId(dept.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTabId === dept.id 
                ? 'bg-[#0f172a] text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {dept.name.includes('عملاء') ? <Headset size={16} /> : <Package size={16} />}
            {dept.name}
          </button>
        ))}
      </div>

      {/* المحتوى المتغير */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {activeDept && (
          <div className="space-y-6">
            
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* البطاقة الأولى: متغيرة حسب نوع القسم */}
              {isService ? (
                 // --- عرض سرعة الاستجابة لخدمة العملاء ---
                <StatCard 
                  title="متوسط سرعة الاستجابة" 
                  // نستخدم avgTime الذي حسبته في السيرفر
                  value={`${activeDept.stats.avgTime} ثانية`} 
                  icon={Timer} 
                  color="text-blue-600" bg="bg-blue-50" 
                />
              ) : (
                // --- عرض عدد الطلبات للتجهيز ---
                <StatCard 
                  title="الطلبات المجهزة" 
                  value={activeDept.stats.orders} 
                  icon={Package} 
                  color="text-orange-600" bg="bg-orange-50" 
                />
              )}
              
              {/* البطاقة الثانية: الحجم الكلي للعمل */}
              <StatCard 
                title={isService ? "إجمالي المكالمات" : "حجم العمل"} 
                // نستخدم calls للخدمة أو orders للتجهيز
                value={isService ? activeDept.stats.calls : activeDept.stats.orders} 
                icon={isService ? PhoneIncoming : BarChart3} 
                color="text-purple-600" bg="bg-purple-50" 
              />
              
              {/* البطاقة الثالثة: الجودة والدقة */}
              <StatCard 
                title={isService ? "معدل جودة الردود" : "دقة التجهيز"} 
                // للخدمة نستخدم الأداء العام، للتجهيز نستخدم الدقة
                value={`${isService ? activeDept.stats.avgPerformance : activeDept.stats.accuracy}%`} 
                icon={Award} 
                color="text-green-600" bg="bg-green-50" 
              />
              
              {/* البطاقة الرابعة: المشاكل */}
              <StatCard 
                title={isService ? "تذاكر معلقة" : "طلبات مرتجعة"} 
                value={isService ? activeDept.stats.pending : activeDept.stats.returns} 
                icon={AlertTriangle} 
                color="text-red-600" bg="bg-red-50" 
              />
            </div>

            {/* Ranking Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Award size={18} className="text-yellow-500" />
                  أفضل الموظفين أداءً ({activeDept.name})
                </h3>
                <span className="text-[10px] bg-white border px-2 py-1 rounded text-gray-500">
                  مرتب حسب: {isService ? 'تقييم الجودة' : 'عدد الطلبات'}
                </span>
              </div>
              <table className="w-full text-right">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs text-gray-500 font-bold">الترتيب</th>
                    <th className="px-6 py-3 text-xs text-gray-500 font-bold">الموظف</th>
                    <th className="px-6 py-3 text-xs text-gray-500 font-bold">
                      {isService ? 'متوسط سرعة الرد' : 'الطلبات المنجزة'}
                    </th>
                    <th className="px-6 py-3 text-xs text-gray-500 font-bold">تقييم الجودة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeDept.topEmployees.map((record: any, index: number) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                          index === 1 ? 'bg-gray-200 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-white border text-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600">
                            {record.user.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-gray-800">{record.user.fullName}</span>
                            <span className="text-[10px] text-gray-400">{record.user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-700">
                          {isService 
                            ? `${record.avgResponseTime || 0} ثانية` 
                            : `${record.ordersPrepared || 0} طلب`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         {/* شريط تقدم بسيط للأداء */}
                         <div className="flex items-center gap-2">
                           <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                             <div 
                               className={`h-full rounded-full ${record.score >= 90 ? 'bg-green-500' : record.score >= 75 ? 'bg-blue-500' : 'bg-orange-500'}`} 
                               style={{ width: `${record.score}%` }}
                             ></div>
                           </div>
                           <span className={`text-xs font-bold ${record.score >= 90 ? 'text-green-600' : 'text-gray-600'}`}>
                             {record.score}%
                           </span>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {activeDept.topEmployees.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400 text-sm">
                        لا توجد بيانات أداء مسجلة لهذا القسم اليوم.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow group">
      <div>
        <p className="text-xs text-gray-500 font-bold mb-1 group-hover:text-blue-600 transition-colors">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 font-[Tajawal]">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl transition-all duration-300 ${bg} ${color} group-hover:scale-110`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
    </div>
  )
}