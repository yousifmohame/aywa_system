'use client'

import { useState } from 'react'
import { updateEvaluationSettingsAction } from '@/app/actions/settings'
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react'

type Props = {
  department: { id: string; name: string }
  settings: {
    speedWeight: number
    accuracyWeight: number
    qualityWeight: number
    disciplineWeight: number
    dailyTarget: number
  } | null
}

export default function EvaluationForm({ department, settings }: Props) {
  // الحالة المبدئية للقيم
  const [weights, setWeights] = useState({
    speed: settings?.speedWeight || 25,
    accuracy: settings?.accuracyWeight || 25,
    quality: settings?.qualityWeight || 25,
    discipline: settings?.disciplineWeight || 25,
  })

  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' })
  const [isSaving, setIsSaving] = useState(false)

  const total = weights.speed + weights.accuracy + weights.quality + weights.discipline
  const isValid = total === 100

  const handleChange = (key: keyof typeof weights, value: string) => {
    setWeights(prev => ({ ...prev, [key]: Number(value) }))
    setStatus({ type: null, msg: '' }) // إعادة تعيين الرسائل عند التغيير
  }

  const handleSubmit = async (formData: FormData) => {
    if (!isValid) {
      setStatus({ type: 'error', msg: `المجموع الحالي ${total}%، يجب أن يكون 100%` })
      return
    }

    setIsSaving(true)
    const res = await updateEvaluationSettingsAction(formData)
    setIsSaving(false)

    if (res?.error) {
      setStatus({ type: 'error', msg: res.error })
    } else {
      setStatus({ type: 'success', msg: 'تم حفظ إعدادات التقييم بنجاح' })
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">إعدادات قسم: {department.name}</h3>
          <p className="text-xs text-gray-500">توزيع نسب التقييم للموظفين في هذا القسم</p>
        </div>
        <div className={`text-sm font-bold px-3 py-1 rounded-full ${isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          المجموع: {total}%
        </div>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <input type="hidden" name="departmentId" value={department.id} />

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            🎯 الهدف اليومي المطلوب (عدد الطلبات/المكالمات)
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              name="dailyTarget" 
              defaultValue={settings?.dailyTarget || 50}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="مثلاً: 50"
            />
            <span className="text-gray-500 text-sm font-medium whitespace-nowrap">
              عملية / يوم
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            سيتم استخدام هذا الرقم لحساب نسبة "سرعة العمل" للموظف تلقائياً.
          </p>
        </div>

        {/* Speed Slider */}
        <WeightSlider 
          label="سرعة العمل" 
          name="speed" 
          value={weights.speed} 
          color="accent-blue-600"
          onChange={(v) => handleChange('speed', v)} 
        />

        {/* Accuracy Slider */}
        <WeightSlider 
          label="الدقة وتقليل الأخطاء" 
          name="accuracy" 
          value={weights.accuracy} 
          color="accent-purple-600"
          onChange={(v) => handleChange('accuracy', v)} 
        />

        {/* Quality Slider */}
        <WeightSlider 
          label="جودة الخدمة / التعامل" 
          name="quality" 
          value={weights.quality} 
          color="accent-orange-600"
          onChange={(v) => handleChange('quality', v)} 
        />

        {/* Discipline Slider */}
        <WeightSlider 
          label="الانضباط والحضور" 
          name="discipline" 
          value={weights.discipline} 
          color="accent-green-600"
          onChange={(v) => handleChange('discipline', v)} 
        />

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm">
            {status.type === 'error' && (
              <span className="text-red-600 flex items-center gap-1"><AlertCircle size={16} /> {status.msg}</span>
            )}
            {status.type === 'success' && (
              <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={16} /> {status.msg}</span>
            )}
          </div>

          <button 
            type="submit" 
            disabled={!isValid || isSaving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white transition-all ${
              !isValid ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#0f172a] hover:bg-blue-900'
            }`}
          >
            {isSaving ? 'جاري الحفظ...' : <><Save size={18} /> حفظ التغييرات</>}
          </button>
        </div>
      </form>
    </div>
  )
}

// مكون فرعي لشريط التمرير
function WeightSlider({ label, name, value, onChange, color }: any) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm font-bold text-gray-700">{label}</label>
        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 rounded-md">{value}%</span>
      </div>
      <input 
        type="range" 
        name={name} 
        min="0" 
        max="100" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${color}`}
      />
    </div>
  )
}