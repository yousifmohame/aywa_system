'use client'

import { useState } from 'react'
import { deleteDepartmentAction } from '@/app/actions/departments'
import { Trash2, Loader2 } from 'lucide-react'

export default function DeleteDepartmentBtn({ id, employeeCount }: { id: string, employeeCount: number }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    // 1. تحقق سريع في الواجهة قبل الذهاب للسيرفر
    if (employeeCount > 0) {
      alert(`عذراً، لا يمكن حذف هذا القسم لأنه يحتوي على ${employeeCount} موظف.\nيجب نقلهم أو حذفهم أولاً.`)
      return
    }

    // 2. رسالة تأكيد
    if (!confirm('هل أنت متأكد من حذف هذا القسم نهائياً؟')) return

    setIsDeleting(true)
    
    // 3. استدعاء السيرفر
    const result = await deleteDepartmentAction(id)

    if (result?.error) {
      alert(result.error) // عرض الخطأ القادم من السيرفر
      setIsDeleting(false)
    } else {
      // تم الحذف بنجاح، Next.js سيقوم بتحديث الصفحة تلقائياً بسبب revalidatePath
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`p-2 rounded-lg transition-colors ${
        isDeleting ? 'text-gray-300' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
      }`}
      title="حذف القسم"
    >
      {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  )
}