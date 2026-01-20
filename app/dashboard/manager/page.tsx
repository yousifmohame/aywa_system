import { prisma } from '@/app/lib/prisma'
import { 
  Users, Headset, Package, Star, TrendingUp, 
  Search, PhoneIncoming, Clock, Calendar, Zap 
} from 'lucide-react'
import { PerformanceChart, DepartmentsChart } from '@/app/components/dashboard/ManagerCharts'
import OvertimeList from '@/app/components/dashboard/OvertimeList'
import Leaderboard from '@/app/components/dashboard/Leaderboard'

// دالة تنسيق الأرقام
const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num)

// دالة لجلب اسم اليوم بالعربي
const getDayName = (date: Date) => {
  return new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(date)
}

// دالة حساب ساعات الشيفت
const calculateShiftHours = (start: string, end: string) => {
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)
  return (endH * 60 + endM - (startH * 60 + startM)) / 60
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

  // 2. جلب الإعدادات وساعات الشيفت
  const settings = await prisma.systemSettings.findUnique({ where: { id: 'settings' } })
  const shiftHours = settings 
    ? calculateShiftHours(settings.workStartTime, settings.workEndTime)
    : 8
  
  // 3. جلب البيانات دفعة واحدة
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
    
    prisma.dailyPerformance.findMany({
      where: { date: { gte: sevenDaysAgo } },
      include: { user: { include: { department: true } } },
      orderBy: { date: 'asc' }
    }),

    prisma.dailyPerformance.findFirst({
      where: { date: { gte: today } }, // أفضل موظف لليوم
      orderBy: { score: 'desc' },
      include: { user: true },
    }),

    prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      include: { 
        department: true,
        performances: {
          where: { date: { gte: startOfMonth } },
          select: { 
            date: true, 
            workHours: true, 
            overtimeHours: true,
            checkIn: true,
            checkOut: true,
            delayMinutes: true // <--- تم إضافة هذا الحقل ليتم جلبه من القاعدة
          }
        }
      },
      orderBy: { fullName: 'asc' }
    }),

    prisma.dailyPerformance.aggregate({
      where: { date: { gte: today } },
      _sum: { ordersPrepared: true, callsCount: true }
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

  const csPerf = lastWeekPerformance.filter(p => p.user.department?.name === 'خدمة العملاء')
  const fullPerf = lastWeekPerformance.filter(p => p.user.department?.name === 'تجهيز الطلبات')
  const calcAvg = (arr: any[], key: string) => arr.length > 0 ? Math.round(arr.reduce((acc, curr) => acc + (curr[key] || 0), 0) / arr.length) : 0
  
  const departmentsChartData = [
    { name: 'السرعة', cs: calcAvg(csPerf, 'callsCount'), fulfillment: calcAvg(fullPerf, 'callsCount') },
    { name: 'الدقة', cs: calcAvg(csPerf, 'accuracyRate'), fulfillment: calcAvg(fullPerf, 'accuracyRate') },
    { name: 'الجودة (الإجمالي)', cs: calcAvg(csPerf, 'score'), fulfillment: calcAvg(fullPerf, 'score') }
  ]

  // === معالجة بيانات الموظفين ===
  const employeesStats = employeesList.map(emp => {
    const totalMonthlyWorkHours = emp.performances.reduce((sum, p) => sum + (p.workHours || 0), 0)
    const totalMonthlyOvertime = emp.performances.reduce((sum, p) => sum + (p.overtimeHours || 0), 0)
    
    const todayRecord = emp.performances.find(p => new Date(p.date).toDateString() === today.toDateString())

    // تنسيق الوقت بتوقيت السعودية
    const formatTime = (date: Date) => date.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Riyadh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    return {
      id: emp.id,
      fullName: emp.fullName,
      department: emp.department?.name || null,
      isOvertimeEnabled: emp.isOvertimeEnabled,
      delayMinutes: todayRecord?.delayMinutes || 0, // الآن سيحمل قيمة صحيحة
      monthlyOvertime: Math.round(totalMonthlyOvertime * 100) / 100,
      monthlyWorkHours: Math.round(totalMonthlyWorkHours * 100) / 100,
      todayCheckIn: todayRecord?.checkIn ? formatTime(todayRecord.checkIn) : '-',
      todayCheckOut: todayRecord?.checkOut ? formatTime(todayRecord.checkOut) : '-',
      todayWorkHours: todayRecord?.workHours || 0,
      status: todayRecord?.checkIn && !todayRecord?.checkOut ? 'active' : 'inactive'
    }
  })

  return (
    <div className="space-y-4 font-[Tajawal]" dir="rtl">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">لوحة تحكم المدير</h1>
        <p className="text-xs text-gray-500">نظرة شاملة على أداء الشركة والموارد البشرية</p>
      </div>

      {/* 1. Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="إجمالي الموظفين" value={totalEmployees} icon={Users} gradient="from-blue-600 to-blue-700" />
        <StatCard title="خدمة العملاء" value={csCount} icon={Headset} gradient="from-purple-600 to-purple-700" />
        <StatCard title="تنفيذ الطلبات" value={fullCount} icon={Package} gradient="from-orange-500 to-orange-600" />
        
        {/* Top Performer Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-md text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-2 relative z-10">
            <Star size={18} className="text-yellow-300 fill-yellow-300" />
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">نجم اليوم</span>
          </div>
          <div className="text-base font-bold truncate relative z-10">
            {topEmployee?.user.fullName || '---'}
          </div>
          <div className="text-[10px] text-green-100 relative z-10">
            أداء: {topEmployee?.score || 0}%
          </div>
          <Star className="absolute -bottom-2 -left-2 text-white/10 rotate-12" size={60} />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex items-center justify-between">
             <div>
                <p className="text-xs text-gray-400 font-bold mb-1">طلبات اليوم</p>
                <h3 className="text-2xl font-bold text-gray-800">{formatNumber(todayProduction._sum.ordersPrepared || 0)}</h3>
             </div>
             <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Package size={20} /></div>
          </div>
          <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex items-center justify-between">
             <div>
                <p className="text-xs text-gray-400 font-bold mb-1">مكالمات اليوم</p>
                <h3 className="text-2xl font-bold text-gray-800">{formatNumber(todayProduction._sum.callsCount || 0)}</h3>
             </div>
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><PhoneIncoming size={20} /></div>
          </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            تطور الأداء (آخر 7 أيام)
          </h3>
          <PerformanceChart data={dailyChartData} />
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={16} className="text-purple-500" />
            مقارنة كفاءة الأقسام
          </h3>
          <DepartmentsChart data={departmentsChartData} />
        </div>
      </div>

      {/* 3. Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <Clock size={18} className="text-blue-600" />
                ساعات العمل والدوام (مباشر)
            </h3>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {new Date().toLocaleDateString('ar-EG', {month: 'long', year: 'numeric'})}
            </span>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-5 py-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">الموظف</th>
                        <th className="px-5 py-3 text-[10px] text-gray-500 font-bold text-center uppercase tracking-wider">حالة اليوم</th>
                        <th className="px-5 py-3 text-[10px] text-gray-500 font-bold text-center uppercase tracking-wider">وقت الحضور</th>
                        <th className="px-5 py-3 text-[10px] text-gray-500 font-bold text-center uppercase tracking-wider">التأخير</th>
                        <th className="px-5 py-3 text-[10px] text-gray-500 font-bold text-center uppercase tracking-wider">ساعات اليوم</th>
                        <th className="px-5 py-3 text-[10px] text-gray-500 font-bold text-center uppercase tracking-wider">إجمالي الشهر</th>
                        <th className="px-5 py-3 text-[10px] text-gray-500 font-bold text-center uppercase tracking-wider">أوفر تايم</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {employeesStats.map(emp => (
                        <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                                        emp.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                                    }`}>
                                        {emp.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{emp.fullName}</p>
                                        <p className="text-[9px] text-gray-400">{emp.department}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-3 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold inline-flex items-center gap-1.5 ${
                                    emp.status === 'active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                    {emp.status === 'active' ? 'متواجد' : 'غائب'}
                                </span>
                            </td>
                            <td className="px-5 py-3 text-center text-xs font-mono text-gray-600 bg-gray-50/30">
                                {emp.todayCheckIn} - {emp.todayCheckOut}
                            </td>
                            {/* خلية التأخير الجديدة */}
                            <td className="px-5 py-3 text-center">
                                {emp.delayMinutes > 0 ? (
                                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-[10px] font-bold border border-red-100 flex items-center justify-center gap-1 animate-pulse">
                                        ⏱ {emp.delayMinutes} د
                                    </span>
                                ) : (
                                    <span className="text-gray-300 text-[10px] font-bold">منتظم</span>
                                )}
                            </td>
                            <td className="px-5 py-3 text-center">
                                <span className="font-bold text-gray-800 text-xs">{emp.todayWorkHours}</span>
                            </td>
                            <td className="px-5 py-3 text-center">
                                <span className="font-bold text-blue-600 text-xs">{emp.monthlyWorkHours} س</span>
                            </td>
                            <td className="px-5 py-3 text-center">
                                {emp.monthlyOvertime > 0 ? (
                                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-100">
                                        +{emp.monthlyOvertime} س
                                    </span>
                                ) : (
                                    <span className="text-gray-300 text-xs">-</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="lg:col-span-1">
          <Leaderboard />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <OvertimeList employees={employeesStats} shiftHours={shiftHours} />
          <FulfillmentStats />
      </div>

    </div>
  )
}

// === Sub-components ===

function StatCard({ title, value, icon: Icon, gradient }: any) {
  return (
    <div className={`bg-gradient-to-br ${gradient} p-4 rounded-xl shadow-md text-white relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-150 duration-500"></div>
      
      <div className="flex items-center justify-between mb-2 relative z-10">
        <Icon size={18} className="text-white/80" />
      </div>
      <div className="text-2xl font-bold relative z-10">{formatNumber(value)}</div>
      <div className="text-[10px] text-white/80 relative z-10">{title}</div>
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
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-xs">
                <Package size={16} className="text-orange-500" />
                أبطال التنفيذ (الشهر الحالي)
            </h3>
            <div className="space-y-3">
                {leaderboard.slice(0, 5).map((emp, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                        idx === 0 ? 'bg-gradient-to-r from-yellow-50 to-white border-yellow-200 shadow-sm' : 
                        idx === 1 ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-50'
                    }`}>
                        <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                idx === 0 ? 'bg-yellow-500 text-white shadow-md' : 
                                idx === 1 ? 'bg-gray-400 text-white' : 
                                idx === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {idx + 1}
                            </span>
                            <span className={`text-xs font-bold ${idx === 0 ? 'text-gray-900' : 'text-gray-600'}`}>{emp.name}</span>
                        </div>
                        <div className="text-center">
                            <span className={`block text-sm font-bold ${idx === 0 ? 'text-orange-600' : 'text-gray-700'}`}>{emp.totalOrders}</span>
                            <span className="text-[8px] text-gray-400">طلب</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}