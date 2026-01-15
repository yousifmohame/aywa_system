'use client'

import { useState } from 'react'
import { saveEvaluationAction } from '@/app/actions/evaluations'
import { Save, Calculator, Check, Clock, Hash } from 'lucide-react'

type Employee = {
  id: string
  fullName: string
  department: {
    name: string
    evaluationSettings: any
  } | null
  performances: any[] 
}

export default function EvaluationTable({ employees, date }: { employees: Employee[], date: string }) {
  return (
    <div className="space-y-4">
      {employees.map(emp => (
        <EmployeeRow key={emp.id} employee={emp} date={date} />
      ))}
      
      {employees.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-400">
          لا يوجد موظفين للتقييم.
        </div>
      )}
    </div>
  )
}

function EmployeeRow({ employee, date }: { employee: Employee, date: string }) {
  const prevPerf = employee.performances[0]
  
  const isFulfillment = employee.department?.name.includes('تجهيز') || employee.department?.name.includes('تنفيذ')

  // استرجاع القيم السابقة (لاحظ استخدام الحقول الجديدة)
  const prevVolume = isFulfillment ? (prevPerf?.ordersPrepared || 0) : (prevPerf?.callsCount || 0)
  const prevTime = isFulfillment ? (prevPerf?.avgPrepTime || 0) : (prevPerf?.avgResponseTime || 0)

  const [inputs, setInputs] = useState({
    // === التعديل هنا: قراءة القيم من قاعدة البيانات ===
    speed: prevPerf?.speedScore || 90,       // قراءة speedScore المحفوظ
    accuracy: prevPerf?.accuracyRate || 95,  // قراءة accuracyRate المحفوظ
    quality: prevPerf?.qualityScore || 90,   // قراءة qualityScore المحفوظ
    discipline: prevPerf?.disciplineScore || 100, // قراءة disciplineScore المحفوظ
    
    volume: prevVolume,
    timeMetric: prevTime
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const weights = employee.department?.evaluationSettings || {
    speedWeight: 25, accuracyWeight: 25, qualityWeight: 25, disciplineWeight: 25
  }

  // حساب النتيجة التقديرية
  const currentScore = Math.round(
    (inputs.speed * weights.speedWeight / 100) +
    (inputs.accuracy * weights.accuracyWeight / 100) +
    (inputs.quality * weights.qualityWeight / 100) +
    (inputs.discipline * weights.disciplineWeight / 100)
  )

  const handleSave = async () => {
    setIsSaving(true)
    const formData = new FormData()
    formData.append('userId', employee.id)
    formData.append('date', date)
    
    // إرسال الدرجات
    formData.append('speed', inputs.speed.toString())
    formData.append('accuracy', inputs.accuracy.toString())
    formData.append('quality', inputs.quality.toString())
    formData.append('discipline', inputs.discipline.toString())
    
    // إرسال الأرقام التشغيلية
    formData.append('volume', inputs.volume.toString())
    formData.append('timeMetric', inputs.timeMetric.toString())

    await saveEvaluationAction(formData)
    setIsSaving(false)
    setIsDone(true)
    setTimeout(() => setIsDone(false), 2000)
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
      
      {/* الصف العلوي: بيانات الموظف والنتيجة */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600">
            {employee.fullName.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">{employee.fullName}</h4>
            <p className="text-[10px] text-gray-500">{employee.department?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold">النتيجة النهائية</p>
            <div className={`font-bold text-xl ${currentScore >= 90 ? 'text-green-600' : 'text-blue-600'}`}>
              {currentScore}%
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`p-2.5 rounded-lg transition-all text-white ${
              isDone ? 'bg-green-500' : 'bg-[#0f172a] hover:bg-blue-900'
            }`}
          >
            {isSaving ? <span className="animate-spin text-xs">⌛</span> : isDone ? <Check size={18} /> : <Save size={18} />}
          </button>
        </div>
      </div>

      {/* الصف السفلي: حقول الإدخال */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        
        {/* 1. قسم الأرقام التشغيلية (مميز بلون خلفية مختلف) */}
        <div className="col-span-2 grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
            <InputBox 
                label={isFulfillment ? "عدد الطلبات" : "عدد المكالمات"} 
                val={inputs.volume} 
                setVal={(v) => setInputs({...inputs, volume: v})} 
                icon={Hash}
                color="border-blue-300 bg-white" 
            />
            <InputBox 
                label={isFulfillment ? "وقت التحضير (د)" : "سرعة الرد (ث)"} 
                val={inputs.timeMetric} 
                setVal={(v) => setInputs({...inputs, timeMetric: v})} 
                icon={Clock}
                color="border-orange-300 bg-white" 
            />
        </div>

        {/* 2. قسم درجات التقييم */}
        <InputBox label="تقييم السرعة %" val={inputs.speed} setVal={(v) => setInputs({...inputs, speed: v})} />
        <InputBox label="تقييم الدقة %" val={inputs.accuracy} setVal={(v) => setInputs({...inputs, accuracy: v})} />
        <InputBox label="الجودة %" val={inputs.quality} setVal={(v) => setInputs({...inputs, quality: v})} />
        <InputBox label="الانضباط %" val={inputs.discipline} setVal={(v) => setInputs({...inputs, discipline: v})} />
      </div>

    </div>
  )
}

function InputBox({ label, val, setVal, color = "border-gray-200", icon: Icon }: any) {
  return (
    <div className="relative">
      <label className="block text-[9px] font-bold text-gray-500 mb-1 flex items-center gap-1">
        {Icon && <Icon size={10} />}
        {label}
      </label>
      <input 
        type="number" 
        min="0" 
        value={val}
        onChange={(e) => setVal(Number(e.target.value))}
        className={`w-full p-2 rounded-lg border text-center font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${color}`}
      />
    </div>
  )
}