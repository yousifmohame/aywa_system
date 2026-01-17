import { prisma } from '@/app/lib/prisma'
import { Users, Headset, Package, Star, TrendingUp, Search, PhoneIncoming, Clock, Calendar } from 'lucide-react'
import { PerformanceChart, DepartmentsChart } from '@/app/components/dashboard/ManagerCharts'
import OvertimeList from '@/app/components/dashboard/OvertimeList'

// دالة مساعدة للأرقام
const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num)

// دالة لجلب اسم اليوم بالعربي
const getDayName = (date: Date) => {
  return new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(date)
}

const calculateShiftHours = (start: string, end: string) => {
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)
  
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM
  
  return (endMinutes - startMinutes) / 60
}

export default async function ManagerDashboardPage() {
  // 1. إعداد التواريخ
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const settings = await prisma.systemSettings.findUnique({ where: { id: 'settings' } })

  const shiftHours = settings 
    ? calculateShiftHours(settings.workStartTime, settings.workEndTime)
    : 8
  
  // 2. جلب البيانات دفعة واحدة
  const [
    totalEmployees,
    csCount,
    fullCount,
    lastWeekPerformance,
    topEmployee,
    employeesList, 
    todayProduction
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'EMPLOYEE' } }),
    prisma.user.count({ where: { role: 'EMPLOYEE', department: { name: 'خدمة العملاء' } } }),
    prisma.user.count({ where: { role: 'EMPLOYEE', department: { name: 'تجهيز الطلبات' } } }),
    
    // تقييمات الأسبوع الماضي
    prisma.dailyPerformance.findMany({
      where: { date: { gte: sevenDaysAgo } },
      include: { user: { include: { department: true } } },
      orderBy: { date: 'asc' }
    }),

    // أفضل موظف
    prisma.dailyPerformance.findFirst({
      orderBy: { score: 'desc' },
      include: { user: true },
      take: 1
    }),

    // === التحديث هنا: جلب بيانات ساعات العمل ===
    prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      include: { 
        department: true,
        performances: {
          where: { date: { gte: startOfMonth } }, // جلب سجلات الشهر الحالي
          select: { 
            date: true, 
            workHours: true, 
            overtimeHours: true,
            checkIn: true,
            checkOut: true
          }
        }
      },
      orderBy: { fullName: 'asc' }
    }),

    // إنتاجية اليوم
    prisma.dailyPerformance.aggregate({
      where: { date: { gte: today } },
      _sum: {
        ordersPrepared: true,
        callsCount: true
      }
    })
  ])

  // === معالجة البيانات للرسوم البيانية ===
  const dailyChartData = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo)
    d.setDate(d.getDate() + i)
    const dayPerf = lastWeekPerformance.filter(p => new Date(p.date).toDateString() === d.toDateString())
    const avgScore = dayPerf.length > 0 
      ? Math.round(dayPerf.reduce((acc, curr) => acc + curr.score, 0) / dayPerf.length) 
      : 0
    dailyChartData.push({ name: getDayName(d), score: avgScore })
  }

  // === معالجة بيانات الأقسام ===
  const csPerf = lastWeekPerformance.filter(p => p.user.department?.name === 'خدمة العملاء')
  const fullPerf = lastWeekPerformance.filter(p => p.user.department?.name === 'تجهيز الطلبات')
  const calcAvg = (arr: any[], key: string) => arr.length > 0 ? Math.round(arr.reduce((acc, curr) => acc + (curr[key] || 0), 0) / arr.length) : 0
  const departmentsChartData = [
    { name: 'السرعة', cs: calcAvg(csPerf, 'callsCount'), fulfillment: calcAvg(fullPerf, 'callsCount') },
    { name: 'الدقة', cs: calcAvg(csPerf, 'accuracyRate'), fulfillment: calcAvg(fullPerf, 'accuracyRate') },
    { name: 'الجودة (الإجمالي)', cs: calcAvg(csPerf, 'score'), fulfillment: calcAvg(fullPerf, 'score') }
  ]

  // === معالجة بيانات ساعات العمل والأوفر تايم ===
  const employeesStats = employeesList.map(emp => {
    // 1. حساب إجمالي الشهر
    const totalMonthlyWorkHours = emp.performances.reduce((sum, p) => sum + (p.workHours || 0), 0)
    const totalMonthlyOvertime = emp.performances.reduce((sum, p) => sum + (p.overtimeHours || 0), 0)
    
    // 2. العثور على سجل اليوم
    const todayRecord = emp.performances.find(p => 
      new Date(p.date).toDateString() === today.toDateString()
    )

    return {
      id: emp.id,
      fullName: emp.fullName,
      department: emp.department?.name || null,
      isOvertimeEnabled: emp.isOvertimeEnabled,
      // بيانات الشهر
      monthlyOvertime: Math.round(totalMonthlyOvertime * 100) / 100,
      monthlyWorkHours: Math.round(totalMonthlyWorkHours * 100) / 100,
      // بيانات اليوم
      todayCheckIn: todayRecord?.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) : '-',
      todayCheckOut: todayRecord?.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) : '-',
      todayWorkHours: todayRecord?.workHours || 0,
      status: todayRecord?.checkIn && !todayRecord?.checkOut ? 'active' : 'inactive' // هل يعمل الآن؟
    }
  })

  return (
    <div className="space-y-4 font-[Tajawal]" dir="rtl">
      
      {/* Header */}
      <div>
        <h1 className="text-base font-bold text-gray-900">لوحة المدير</h1>
        <p className="text-[10px] text-gray-500">نظرة عامة حقيقية على الأداء والإنتاجية</p>
      </div>

      {/* 1. Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatCard title="إجمالي الموظفين" value={totalEmployees} icon={Users} color="blue" />
        <StatCard title="خدمة العملاء" value={csCount} icon={Headset} color="purple" />
        <StatCard title="تنفيذ الطلبات" value={fullCount} icon={Package} color="orange" />
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg shadow-sm text-white">
          <div className="flex items-center justify-between mb-1">
            <Star size={16} className="text-white/80" />
          </div>
          <div className="text-sm font-bold truncate">{topEmployee?.user.fullName || '---'}</div>
          <div className="text-[9px] text-white/80">أفضل أداء ({topEmployee?.score || 0}%)</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
          <StatCard title="طلبات اليوم" value={todayProduction._sum.ordersPrepared || 0} icon={Package} color="white" textColor="gray-800" />
          <StatCard title="مكالمات اليوم" value={todayProduction._sum.callsCount || 0} icon={PhoneIncoming} color="white" textColor="gray-800" />
      </div>

      {/* 2. Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-900 mb-2">متوسط الأداء (7 أيام)</h3>
          <PerformanceChart data={dailyChartData} />
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-900 mb-2">مقارنة الأقسام</h3>
          <DepartmentsChart data={departmentsChartData} />
        </div>
      </div>

      {/* 3. New: Work Hours & Attendance Table (الجدول الجديد المطلوب) */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <Clock size={18} className="text-blue-600" />
                ساعات العمل والدوام (مباشر)
            </h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">
                الشهر الحالي: {new Date().toLocaleDateString('ar-EG', {month: 'long'})}
            </span>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-4 py-3 text-[10px] text-gray-500 font-bold">الموظف</th>
                        <th className="px-4 py-3 text-[10px] text-gray-500 font-bold text-center">حالة اليوم</th>
                        <th className="px-4 py-3 text-[10px] text-gray-500 font-bold text-center">حضور اليوم</th>
                        <th className="px-4 py-3 text-[10px] text-gray-500 font-bold text-center">ساعات اليوم</th>
                        <th className="px-4 py-3 text-[10px] text-gray-500 font-bold text-center">إجمالي الشهر</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {employeesStats.map(emp => (
                        <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        emp.status === 'active' ? 'bg-green-100 text-green-700 ring-2 ring-green-200' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {emp.fullName.split(' ').map(n=>n[0]).slice(0,2).join('')}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">{emp.fullName}</p>
                                        <p className="text-[9px] text-gray-400">{emp.department}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 rounded-full text-[9px] font-bold ${
                                    emp.status === 'active' ? 'bg-green-50 text-green-600 animate-pulse' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {emp.status === 'active' ? 'متواجد الآن' : 'غير متواجد'}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-center text-xs font-medium text-gray-600">
                                {emp.todayCheckIn} - {emp.todayCheckOut}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className="font-bold text-gray-800 text-xs">{emp.todayWorkHours}</span>
                                <span className="text-[9px] text-gray-400 mr-1">ساعة</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-blue-600 text-xs">{emp.monthlyWorkHours} س</span>
                                    {emp.monthlyOvertime > 0 && (
                                        <span className="text-[8px] text-orange-500 font-bold">
                                            +{emp.monthlyOvertime} إضافي
                                        </span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* 4. Overtime List */}
      <OvertimeList 
             employees={employeesStats} 
             shiftHours={shiftHours} 
          />

      {/* 5. Fulfillment Stats (إحصائيات الموظف المميز في التنفيذ) */}
      <FulfillmentStats />
    </div>
  )
}

// === مكونات فرعية صغيرة ===

function StatCard({ title, value, icon: Icon, color, textColor = 'white' }: any) {
  const bg = color === 'white' ? 'bg-white border border-gray-200' : `bg-gradient-to-br from-${color}-500 to-${color}-600`
  const text = color === 'white' ? 'text-gray-800' : 'text-white'
  const subText = color === 'white' ? 'text-gray-400' : 'text-white/80'
  
  return (
    <div className={`${bg} p-3 rounded-lg shadow-sm`}>
      <div className="flex items-center justify-between mb-1">
        <Icon size={16} className={subText} />
        {color !== 'white' && <TrendingUp size={12} className="text-white/60" />}
      </div>
      <div className={`text-xl font-bold ${text}`}>{formatNumber(value)}</div>
      <div className={`text-[9px] ${subText}`}>{title}</div>
    </div>
  )
}

export async function FulfillmentStats() {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0,0,0,0)

    const stats = await prisma.user.findMany({
        where: { department: { name: 'تنفيذ الطلبات' }, isActive: true },
        select: {
            fullName: true,
            performances: {
                where: { date: { gte: startOfMonth } },
                select: { ordersPrepared: true }
            }
        }
    })

    const leaderboard = stats.map(emp => ({
        name: emp.fullName,
        totalOrders: emp.performances.reduce((sum, p) => sum + (p.ordersPrepared || 0), 0),
    })).sort((a, b) => b.totalOrders - a.totalOrders)

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                <Package size={18} className="text-orange-500" />
                الموظف المميز في التنفيذ (هذا الشهر)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {leaderboard.map((emp, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between ${
                        idx === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'
                    }`}>
                        <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                idx === 0 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                                {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-gray-800">{emp.name}</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-sm font-bold text-blue-600">{emp.totalOrders}</span>
                            <span className="text-[8px] text-gray-400">طلب</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}