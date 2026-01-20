'use client'

import { useEffect, useState } from 'react'
import { getTopEmployeesAction } from '@/app/actions/reports'
import { Trophy, Medal, TrendingUp } from 'lucide-react'

type Leader = {
  rank: number
  id: string
  name: string
  avatar: string
  department: string
  score: number
  production: number
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const res = await getTopEmployeesAction()
      if (res?.success && res.data) {
        setLeaders(res.data)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-6 text-center text-gray-500">جاري تحميل الأبطال...</div>

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={24} />
            نجوم هذا الشهر
          </h3>
          <p className="text-xs text-gray-500 mt-1">أفضل الموظفين أداءً بناءً على التقييمات</p>
        </div>
      </div>

      <div className="space-y-4">
        {leaders.length === 0 ? (
          <p className="text-center text-gray-400 py-4">لا توجد تقييمات كافية هذا الشهر</p>
        ) : (
          leaders.map((leader) => (
            <div 
              key={leader.id} 
              className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-md ${
                leader.rank === 1 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* الترتيب والميداليات */}
                <div className="flex-shrink-0 w-8 text-center font-bold text-gray-400">
                  {leader.rank === 1 ? '🥇' : leader.rank === 2 ? '🥈' : leader.rank === 3 ? '🥉' : `#${leader.rank}`}
                </div>

                {/* الصورة والاسم */}
                <img 
                  src={leader.avatar} 
                  alt={leader.name} 
                  className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                />
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{leader.name}</h4>
                  <span className="text-xs text-gray-500 block">{leader.department}</span>
                </div>
              </div>

              {/* النقاط */}
              <div className="text-left">
                <div className="flex items-center gap-1 justify-end">
                  <span className={`font-bold text-lg ${leader.score >= 90 ? 'text-green-600' : 'text-blue-600'}`}>
                    {leader.score}%
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                  <TrendingUp size={10} />
                  {leader.production} عملية
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}