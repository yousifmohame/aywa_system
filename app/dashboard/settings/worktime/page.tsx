import { prisma } from '@/app/lib/prisma'
import { updateSettingsAction } from '@/app/actions/settings' // سننشئه لاحقاً

export default async function SettingsPage() {
  const settings = await prisma.systemSettings.findUnique({ where: { id: 'settings' } })

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm max-w-lg mx-auto font-[Tajawal]" dir="rtl">
      <h2 className="text-lg font-bold mb-4 border-b pb-2">⚙️ إعدادات الدوام الرسمي</h2>
      
      <form action={updateSettingsAction} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">وقت بدء الدوام (الحضور)</label>
          <input 
            type="time" 
            name="startTime" 
            defaultValue={settings?.workStartTime || "09:00"}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">وقت انتهاء الدوام (الانصراف)</label>
          <input 
            type="time" 
            name="endTime" 
            defaultValue={settings?.workEndTime || "17:00"}
            className="w-full border p-2 rounded-lg"
          />
          <p className="text-[10px] text-red-500 mt-1">
            * لن يتمكن الموظف من تسجيل الانصراف قبل هذا الوقت.
          </p>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700">
          حفظ الإعدادات
        </button>
      </form>
    </div>
  )
}