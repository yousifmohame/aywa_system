'use client'

import { useState } from 'react'
import { Eye, UserPlus } from 'lucide-react'
import Link from 'next/link' // 1. استيراد Link
import AssignModal from './AssignModal'

export default function AssignButton({ complaint, employees }: any) {
  const [showAssignModal, setShowAssignModal] = useState(false)
  // لم نعد بحاجة لـ showDetails state لأننا سننتقل لصفحة جديدة

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        {/* زر الإسناد (بقي كما هو) */}
        <button 
          onClick={() => setShowAssignModal(true)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-bold"
          title="إسناد لموظف"
        >
          <UserPlus size={14} /> إسناد
        </button>

        {/* 2. تحويل زر العرض إلى Link */}
        <Link 
          href={`/dashboard/complaints/${complaint.id}`} // الرابط لصفحة المدير الجديدة
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
        >
          <Eye size={14} /> عرض
        </Link>
      </div>

      {/* مودال الإسناد */}
      {showAssignModal && (
        <AssignModal 
          complaintId={complaint.id} 
          employees={employees} 
          onClose={() => setShowAssignModal(false)} 
        />
      )}
    </>
  )
}