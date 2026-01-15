import { prisma } from '@/app/lib/prisma'
import { cookies } from 'next/headers'
import EvaluationTable from '@/app/components/evaluations/EvaluationTable'
import EvaluationDatePicker from '@/app/components/evaluations/EvaluationDatePicker'
import { ClipboardCheck } from 'lucide-react'

// تعريف النوع الصحيح للـ Props في Next.js 15
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EvaluationsPage(props: Props) {
  // 1. فك الـ Promise الخاص بـ searchParams
  const searchParams = await props.searchParams
  
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  const userRole = cookieStore.get('userRole')?.value

  // التحقق من التاريخ (نستخدم المتغير الذي قمنا بعمل await له)
  const dateStr = (searchParams.date as string) || new Date().toISOString().split('T')[0]
  const selectedDate = new Date(dateStr)

  // تحديد القسم الذي سنعرضه
  let departmentFilter = {}
  
  if (userRole === 'SUPERVISOR') {
    const supervisor = await prisma.user.findUnique({ where: { id: userId } })
    if (!supervisor?.departmentId) return <div className="p-8 text-center text-red-500">خطأ: ليس لديك قسم</div>
    departmentFilter = { departmentId: supervisor.departmentId }
  }

  // جلب الموظفين + تقييمهم لهذا اليوم المحدد
  const employees = await prisma.user.findMany({
    where: {
      role: 'EMPLOYEE',
      isActive: true,
      ...departmentFilter 
    },
    include: {
      department: {
        include: { evaluationSettings: true }
      },
      performances: {
        where: { date: selectedDate },
        take: 1
      }
    },
    orderBy: { fullName: 'asc' }
  })

  return (
    <div className="space-y-6 font-[Tajawal]" dir="rtl">
      
      {/* Header & Date Picker */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="text-blue-600" />
            رصد الدرجات اليومية
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            إدخال درجات الأداء (السرعة، الدقة، الجودة) للموظفين بتاريخ محدد.
          </p>
        </div>

        {/* استدعاء المكون التفاعلي الجديد هنا */}
        <EvaluationDatePicker defaultDate={dateStr} />
        
      </div>

      {/* Evaluation Table */}
      <EvaluationTable employees={employees} date={dateStr} />

    </div>
  )
}