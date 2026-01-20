import { getEmployeeComplaintsAction } from '@/app/actions/complaints'
import { cookies } from 'next/headers' // 1. استيراد cookies
import { redirect } from 'next/navigation' // 2. استيراد redirect للحماية
import { FileText } from 'lucide-react'
import { EmployeeComplaintCard } from './EmployeeComplaintCard'

export default async function MyComplaintsPage() {
  // 1. الحصول على ملفات تعريف الارتباط
  const cookieStore = await cookies()
  
  // 2. جلب معرف المستخدم الحقيقي
  const employeeId = cookieStore.get('userId')?.value

  // 3. التحقق من وجود المستخدم (حماية الصفحة)
  if (!employeeId) {
    redirect('/') // إعادة توجيه لصفحة الدخول إذا لم يكن مسجلاً
  }

  // 4. جلب البيانات باستخدام المعرف الحقيقي
  const res = await getEmployeeComplaintsAction(employeeId)
  const myComplaints = res.data || []

  return (
    <div className="p-6 space-y-6 font-[Tajawal]" dir="rtl">
      <header>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
           <FileText className="text-blue-600" />
           المهام والشكاوى المسندة لي
        </h1>
        <p className="text-gray-500">قائمة بالبلاغات التي تم تكليفك بحلها من قبل الإدارة</p>
      </header>

      <div className="grid gap-4">
        {myComplaints.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} />
             </div>
            <p className="text-gray-800 font-bold text-lg">لا توجد مهام جديدة</p>
            <p className="text-gray-400 text-sm mt-1">سجلك نظيف تماماً، استمتع بوقتك! 🎉</p>
          </div>
        ) : (
          myComplaints.map((item) => (
             <EmployeeComplaintCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  )
}