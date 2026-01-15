import Link from 'next/link'
import { Building2, Sliders, ShieldCheck, ChevronLeft, UserCog } from 'lucide-react'

export default function SettingsPage() {
  
  // قائمة الخيارات المتاحة في الإعدادات
  const settingsSections = [
    {
      title: 'إدارة الأقسام',
      description: 'إضافة وتعديل أقسام الشركة والهيكل التنظيمي للموظفين.',
      href: '/dashboard/settings/departments',
      icon: Building2,
      color: 'bg-blue-100 text-blue-600',
      border: 'border-blue-200'
    },
    {
      title: 'معايير التقييم',
      description: 'ضبط أوزان التقييم (السرعة، الدقة، الانضباط) لكل قسم على حدة.',
      href: '/dashboard/settings/evaluations',
      icon: Sliders,
      color: 'bg-purple-100 text-purple-600',
      border: 'border-purple-200'
    },
    
  ]

  return (
    <div className="space-y-8 font-[Tajawal]" dir="rtl">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إعدادات النظام</h1>
        <p className="text-sm text-gray-500 mt-1">التحكم في تكوين النظام والهيكل الإداري</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section, index) => (
          <Link 
            key={index} 
            href={section.href}
            className={`
              block p-6 rounded-xl border bg-white transition-all duration-300
              ${'hover:shadow-md hover:border-gray-300'}
            `}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${section.color}`}>
                <section.icon size={24} />
              </div>
              {(
                <ChevronLeft className="text-gray-300" size={20} />
              )}
            </div>
            
            <h3 className="font-bold text-gray-900 text-lg mb-2">{section.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {section.description}
            </p>

            {(
              <span className="inline-block mt-4 text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                قريباً
              </span>
            )}
          </Link>
        ))}
      </div>

   
      

    </div>
  )
}