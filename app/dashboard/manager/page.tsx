import { prisma } from '@/app/lib/prisma'
import { Users, Headset, Package, Star, TrendingUp, Search, PhoneIncoming } from 'lucide-react'
import { PerformanceChart, DepartmentsChart } from '@/app/components/dashboard/ManagerCharts'
import OvertimeList from '@/app/components/dashboard/OvertimeList'

// دالة مساعدة للأرقام
const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num)

// دالة لجلب اسم اليوم بالعربي
const getDayName = (date: Date) => {
  return new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(date)
}

export default async function ManagerDashboardPage() {
  // 1. إعداد التواريخ
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // تاريخ قبل 7 أيام (للرسوم البيانية)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  // بداية الشهر الحالي (لحساب الأوفر تايم)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // 2. جلب البيانات دفعة واحدة
  const [
    totalEmployees,
    csCount,
    fullCount,
    lastWeekPerformance,
    topEmployee,
    employeesList, // سيحتوي الآن على بيانات الأوفر تايم
    todayProduction
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'EMPLOYEE' } }),
    prisma.user.count({ where: { role: 'EMPLOYEE', department: { name: 'خدمة العملاء' } } }),
    prisma.user.count({ where: { role: 'EMPLOYEE', department: { name: 'تجهيز الطلبات' } } }),
    
    // جلب تقييمات الأسبوع الماضي
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

    // قائمة الموظفين (محدثة لجلب ساعات الأوفر تايم لهذا الشهر)
    prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      include: { 
        department: true,
        // جلب سجلات الأداء من بداية الشهر فقط لحساب الأوفر تايم
        performances: {
          where: { date: { gte: startOfMonth } },
          select: { overtimeHours: true }
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
    
    const dayPerf = lastWeekPerformance.filter(p => 
      new Date(p.date).toDateString() === d.toDateString()
    )

    const avgScore = dayPerf.length > 0 
      ? Math.round(dayPerf.reduce((acc, curr) => acc + curr.score, 0) / dayPerf.length) 
      : 0

    dailyChartData.push({
      name: getDayName(d),
      score: avgScore
    })
  }

  // === معالجة بيانات مقارنة الأقسام ===
  const csPerf = lastWeekPerformance.filter(p => p.user.department?.name === 'خدمة العملاء')
  const fullPerf = lastWeekPerformance.filter(p => p.user.department?.name === 'تجهيز الطلبات')

  const calcAvg = (arr: any[], key: string) => 
    arr.length > 0 ? Math.round(arr.reduce((acc, curr) => acc + (curr[key] || 0), 0) / arr.length) : 0

  const departmentsChartData = [
    {
      name: 'السرعة',
      cs: calcAvg(csPerf, 'callsCount'),
      fulfillment: calcAvg(fullPerf, 'callsCount') 
    },
    {
      name: 'الدقة',
      cs: calcAvg(csPerf, 'accuracyRate'),
      fulfillment: calcAvg(fullPerf, 'accuracyRate')
    },
    {
      name: 'الجودة (الإجمالي)',
      cs: calcAvg(csPerf, 'score'),
      fulfillment: calcAvg(fullPerf, 'score')
    }
  ]

  // === معالجة بيانات الأوفر تايم للقائمة ===
  const employeesForOvertimeList = employeesList.map(emp => {
    // جمع ساعات الأوفر تايم لجميع أيام الشهر لهذا الموظف
    const totalMonthlyOvertime = emp.performances.reduce((sum, p) => sum + (p.overtimeHours || 0), 0)
    
    return {
      id: emp.id,
      fullName: emp.fullName,
      department: emp.department?.name || null,
      isOvertimeEnabled: emp.isOvertimeEnabled,
      monthlyOvertime: Math.round(totalMonthlyOvertime * 100) / 100 // تقريب لرقمين عشريين
    }
  })

  return (
    <div className="space-y-3 font-[Tajawal]" dir="rtl">
      
      {/* Header */}
      <div>
        <h1 className="text-base font-bold text-gray-900">لوحة المدير</h1>
        <p className="text-[10px] text-gray-500">نظرة عامة حقيقية على الأداء والإنتاجية</p>
      </div>

      {/* 1. Top Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <Users size={16} className="text-white/80" />
            <TrendingUp size={12} className="text-white/60" />
          </div>
          <div className="text-xl font-bold text-white">{formatNumber(totalEmployees)}</div>
          <div className="text-[9px] text-white/80">إجمالي الموظفين</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <Headset size={16} className="text-white/80" />
          </div>
          <div className="text-xl font-bold text-white">{formatNumber(csCount)}</div>
          <div className="text-[9px] text-white/80">خدمة العملاء</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <Package size={16} className="text-white/80" />
          </div>
          <div className="text-xl font-bold text-white">{formatNumber(fullCount)}</div>
          <div className="text-[9px] text-white/80">تنفيذ الطلبات</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <Star size={16} className="text-white/80" />
          </div>
          <div className="text-sm font-bold text-white truncate">
            {topEmployee?.user.fullName || 'لا يوجد'}
          </div>
          <div className="text-[9px] text-white/80">أفضل أداء ({topEmployee?.score || 0}%)</div>
        </div>

        {/* إنتاجية اليوم (مكالمات + طلبات) */}
        <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <Package size={16} className="text-orange-500" />
            <span className="text-[9px] font-bold text-gray-400">طلبات اليوم</span>
          </div>
          <div className="text-xl font-bold text-gray-800">{formatNumber(todayProduction._sum.ordersPrepared || 0)}</div>
        </div>

        <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <PhoneIncoming size={16} className="text-blue-500" />
            <span className="text-[9px] font-bold text-gray-400">مكالمات اليوم</span>
          </div>
          <div className="text-xl font-bold text-gray-800">{formatNumber(todayProduction._sum.callsCount || 0)}</div>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="space-y-2">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-900 mb-2">متوسط الأداء (آخر 7 أيام)</h3>
          <PerformanceChart data={dailyChartData} />
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-900 mb-2">مقارنة الأقسام</h3>
          <DepartmentsChart data={departmentsChartData} />
        </div>
      </div>

      {/* 3. Employees List & Overtime */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* قائمة الموظفين (بسيطة) */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-gray-900">الموظفين</h3>
            <Search size={14} className="text-gray-400" />
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {employeesList.slice(0, 5).map((emp, i) => (
              <div key={emp.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    i % 2 === 0 ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {emp.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-900">{emp.fullName}</div>
                    <div className="text-[8px] text-gray-500">
                      {emp.department?.name || 'غير محدد'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* قائمة الأوفر تايم (المحدثة بالبيانات الحقيقية) */}
        <OvertimeList employees={employeesForOvertimeList} />
        
      </div>
    </div>
  )
}