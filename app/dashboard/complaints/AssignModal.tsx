'use client'
import { useState } from 'react'
import { assignComplaintAction } from '@/app/actions/complaints'
import { X, UserPlus } from 'lucide-react'

type Props = {
  complaintId: string
  employees: { id: string; fullName: string }[]
  onClose: () => void
}

export default function AssignModal({ complaintId, employees, onClose }: Props) {
  const [selectedEmp, setSelectedEmp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAssign = async () => {
    if (!selectedEmp) return alert('يرجى اختيار موظف')
    setLoading(true)
    await assignComplaintAction(complaintId, selectedEmp)
    setLoading(false)
    onClose() // إغلاق النافذة وتحديث الصفحة تلقائياً عبر السيرفر أكشن
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-blue-900 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2">
            <UserPlus size={18} /> إسناد الشكوى لموظف
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X size={18} /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اختر الموظف المسؤول:</label>
            <select 
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setSelectedEmp(e.target.value)}
              value={selectedEmp}
            >
              <option value="">-- اختر موظف --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleAssign}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'جاري الحفظ...' : 'تأكيد الإسناد'}
          </button>
        </div>
      </div>
    </div>
  )
}