import { prisma } from '@/app/lib/prisma'
import EvaluationForm from '@/app/components/settings/EvaluationForm'
import { Sliders } from 'lucide-react'

export default async function EvaluationSettingsPage() {
  // جلب الأقسام مع إعدادات التقييم الحالية إن وجدت
  const departments = await prisma.department.findMany({
    include: { evaluationSettings: true }
  })

  return (
    <div className="space-y-6 font-[Tajawal]" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Sliders className="text-blue-600" />
          معايير التقييم
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          تحديد أوزان ومعايير الأداء لكل قسم (يجب أن يكون المجموع 100%)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dept) => (
          <EvaluationForm 
            key={dept.id} 
            department={{ id: dept.id, name: dept.name }}
            settings={dept.evaluationSettings}
          />
        ))}

        {departments.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed text-gray-400">
            لا توجد أقسام حالياً. قم بإضافة أقسام أولاً من صفحة إعدادات الأقسام.
          </div>
        )}
      </div>
    </div>
  )
}