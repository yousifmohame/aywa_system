'use client'

import { useState } from 'react'
import { giveBadgeAction } from '@/app/actions/supervisor'
import { Award, Star, Zap, Trophy, Medal, Plus } from 'lucide-react'

const BADGES = [
  { id: 'STAR', name: 'نجم الأسبوع', icon: Star, color: 'text-yellow-500 bg-yellow-50' },
  { id: 'FAST', name: 'الأسرع', icon: Zap, color: 'text-orange-500 bg-orange-50' },
  { id: 'HERO', name: 'بطل المشاكل', icon: Trophy, color: 'text-blue-500 bg-blue-50' },
  { id: 'QUALITY', name: 'ملك الجودة', icon: Medal, color: 'text-purple-500 bg-purple-50' },
]

export default function BadgeGifter({ employeeId, existingBadges }: { employeeId: string, existingBadges: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleGiveBadge = async (badgeId: string, badgeName: string) => {
    setLoading(true)
    await giveBadgeAction(employeeId, badgeId, `منح بواسطة المشرف: ${badgeName}`)
    setLoading(false)
    setIsOpen(false)
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
          <Award size={16} className="text-yellow-500" />
          لوحة الشرف والأوسمة
        </h3>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus size={12} /> إهداء وسام
        </button>
      </div>

      {/* قائمة الأوسمة الحالية */}
      <div className="flex flex-wrap gap-2 mb-2">
        {existingBadges.length > 0 ? existingBadges.map((b) => {
            const BadgeIcon = BADGES.find(x => x.id === b.badgeType)?.icon || Award
            const style = BADGES.find(x => x.id === b.badgeType)?.color || 'text-gray-500 bg-gray-50'
            return (
                <div key={b.id} className={`flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-100 ${style}`}>
                    <BadgeIcon size={12} />
                    <span className="text-[9px] font-bold">{BADGES.find(x => x.id === b.badgeType)?.name}</span>
                </div>
            )
        }) : (
            <p className="text-[10px] text-gray-400 w-full text-center py-2">لم يحصل على أوسمة بعد</p>
        )}
      </div>

      {/* قائمة الاختيار (تظهر عند الضغط) */}
      {isOpen && (
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t animate-in slide-in-from-top-2 fade-in">
          {BADGES.map((badge) => (
            <button
              key={badge.id}
              disabled={loading}
              onClick={() => handleGiveBadge(badge.id, badge.name)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-right"
            >
              <div className={`p-1.5 rounded-md ${badge.color}`}>
                <badge.icon size={14} />
              </div>
              <span className="text-[10px] font-bold text-gray-700">{badge.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}