import { prisma } from '@/app/lib/prisma'
import DepartmentsView from '@/app/components/departments/DepartmentsView'

// تعريف واجهة البيانات لضمان النوع (Type Safety)
interface DepartmentStats {
  id: string
  name: string
  description: string | null
  type: 'SERVICE' | 'FULFILLMENT' | 'OTHER' // تحديد نوع القسم
  metrics: {
    volume: number       // العدد الإجمالي (مكالمات أو طلبات)
    volumeLabel: string  // النص (مكالمة / طلب)
    accuracy: number     // نسبة الدقة
    issues: number       // المشاكل (تذاكر أو مرتجعات)
    avgPerformance: number // متوسط الأداء العام
  }
  topEmployees: any[]
}

export default async function DepartmentsPage() {
  // تحديد نطاق الوقت: بداية اليوم الحالي
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)

  // 1. جلب الأقسام
  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' }
  })

  // 2. معالجة البيانات بشكل متوازي وسريع
  const departmentsData = await Promise.all(
    departments.map(async (dept) => {
      
      // تحديد نوع القسم بناءً على اسمه (يمكنك إضافة حقل 'type' في قاعدة البيانات مستقبلاً ليكون أدق)
      const isFulfillment = dept.name.includes('تجهيز') || dept.name.includes('تنفيذ') || dept.name.includes('مخازن')
      const isService = dept.name.includes('عملاء') || dept.name.includes('اتصال') || dept.name.includes('دعم')
      
      const deptType = isFulfillment ? 'FULFILLMENT' : isService ? 'SERVICE' : 'OTHER'

      // تجميع البيانات (Aggregation)
      const stats = await prisma.dailyPerformance.aggregate({
        where: {
          user: { departmentId: dept.id },
          date: { gte: startDate }
        },
        _sum: {
          callsCount: true,      // العدد الفعلي للمكالمات
          solvedTickets: true,   // التذاكر المحلولة
          pendingTickets: true,  // التذاكر المعلقة
          ordersPrepared: true,  // الطلبات المجهزة
          returnedOrders: true,  // الطلبات المرجعة
        },
        _avg: {
          score: true,           // متوسط سكور الأداء العام
          accuracyRate: true,    // متوسط الدقة
          avgResponseTime: true, // متوسط سرعة الرد
          avgPrepTime: true      // متوسط وقت التحضير
        }
      })

      // جلب أفضل 5 موظفين فقط للوحة المعلومات
      const topEmployees = await prisma.dailyPerformance.findMany({
        where: {
          user: { departmentId: dept.id },
          date: { gte: startDate }
        },
        include: { user: true },
        orderBy: { score: 'desc' }, // الترتيب حسب سكور الأداء وليس العدد
        take: 5
      })

      // 3. توحيد هيكل البيانات (Normalization)
      // هذا الجزء يجعل الواجهة (Frontend) نظيفة جداً لأنها تستقبل هيكلاً موحداً بغض النظر عن القسم
      
      let volume = 0
      let volumeLabel = 'عملية'
      let issues = 0
      
      if (deptType === 'SERVICE') {
        volume = stats._sum.callsCount || 0
        volumeLabel = 'مكالمة'
        issues = stats._sum.pendingTickets || 0
      } else if (deptType === 'FULFILLMENT') {
        volume = stats._sum.ordersPrepared || 0
        volumeLabel = 'طلب'
        issues = stats._sum.returnedOrders || 0
      }

      return {
        id: dept.id,
        name: dept.name,
        description: dept.description,
        stats: {
          // هنا نرسل البيانات المجهزة للواجهة
          calls: deptType === 'SERVICE' ? (stats._sum.callsCount || 0) : 0, // توافقاً مع الكود القديم للواجهة
          orders: deptType === 'FULFILLMENT' ? (stats._sum.ordersPrepared || 0) : 0,
          
          // البيانات الموحدة الجديدة
          volume: volume,
          volumeLabel: volumeLabel,
          accuracy: Math.round(stats._avg.accuracyRate || 100),
          pending: issues, // نستخدم pending لتمثيل المشاكل بشكل عام
          returns: stats._sum.returnedOrders || 0, // توافقاً مع الكود القديم
          
          // متوسط الأداء العام
          avgPerformance: Math.round(stats._avg.score || 0), 
          
          // مقاييس الوقت (اختياري حسب القسم)
          avgTime: deptType === 'SERVICE' 
            ? Math.round(stats._avg.avgResponseTime || 0) 
            : Math.round(stats._avg.avgPrepTime || 0)
        },
        topEmployees
      }
    })
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 font-[Tajawal]">تحليل الأقسام (Live)</h1>
        <p className="text-xs text-gray-500 font-[Tajawal]">
          مؤشرات الأداء الرئيسية (KPIs) لليوم: {startDate.toLocaleDateString('ar-EG')}
        </p>
      </div>

      <DepartmentsView departments={departmentsData} />
    </div>
  )
}