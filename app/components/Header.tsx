'use client'

import { useState, useEffect } from 'react'
import { Bell, Menu, Search } from 'lucide-react'
import { getUnreadTasksCount } from '@/app/actions/notifications' // استدعاء نفس الأكشن السابق
import Link from 'next/link'

interface HeaderProps {
  userInitials?: string
  pageTitle?: string
  onMenuClick: () => void // دالة لفتح القائمة الجانبية في الموبايل
}

export default function Header({ 
  userInitials = 'ME', 
  pageTitle = 'الرئيسية', 
  onMenuClick 
}: HeaderProps) {
  
  const [notifications, setNotifications] = useState(0)

  // منطق جلب الإشعارات الحقيقية
  useEffect(() => {
    const fetchNotifications = async () => {
      const count = await getUnreadTasksCount()
      setNotifications(count)
    }

    fetchNotifications()

    // تحديث كل دقيقة
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header 
      className="bg-white border-b border-gray-100 h-16 px-4 flex items-center justify-between sticky top-0 z-30 font-[Tajawal]" 
      dir="rtl"
    >
      
      {/* الجزء الأيمن: القائمة والعنوان */}
      <div className="flex items-center gap-3">
        {/* زر القائمة يظهر فقط في الموبايل */}
        <button 
          onClick={onMenuClick}
          className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg lg:hidden transition-colors"
        >
          <Menu size={20} />
        </button>

        <h2 className="text-base font-bold text-gray-800 hidden md:block">{pageTitle}</h2>
      </div>

      {/* الجزء الأوسط (اختياري): بحث */}
      {/* <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
           <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
           <input 
             type="text" 
             placeholder="بحث سريع..." 
             className="w-full bg-gray-50 border border-gray-100 rounded-full py-2 pr-10 pl-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
           />
        </div>
      </div> */}

      {/* الجزء الأيسر: الإشعارات والصورة */}
      <div className="flex items-center gap-3">
        
        {/* زر الإشعارات الحقيقي */}
        <Link href="/dashboard/tasks">
            <button className="p-2 text-gray-400 hover:bg-gray-50 hover:text-blue-600 rounded-full relative transition-all">
            <Bell size={20} />
            
            {/* الشارة الحمراء (Badge) */}
            {notifications > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 text-[8px] text-white justify-center items-center">
                    {/* يمكنك إظهار الرقم هنا إذا أردت */}
                  </span>
                </span>
            )}
            </button>
        </Link>

        {/* صورة الموظف / الحروف الأولى */}
        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs cursor-pointer hover:bg-blue-100 transition-colors">
          {userInitials}
        </div>
      </div>

    </header>
  )
}