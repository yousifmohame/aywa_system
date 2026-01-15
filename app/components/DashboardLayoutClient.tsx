'use client'

import { useState } from 'react'
import Sidebar from '@/app/components/Sidebar'
import Header from '@/app/components/Header'

interface ClientLayoutProps {
  children: React.ReactNode
  userRole: string
  fullName: string
}

export default function DashboardLayoutClient({ children, userRole, fullName }: ClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // استخراج الأحرف الأولى للاسم (مثال: Ahmed Ali -> AA)
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="flex h-screen bg-gray-50 font-[Tajawal]" dir="rtl">
      
      {/* القائمة الجانبية: نمرر لها حالة الفتح من هنا */}
      <Sidebar 
        userRole={userRole} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      {/* منطقة المحتوى: تشمل الهيدر والمحتوى المتغير */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* الهيدر: يحتوي على زر القائمة وجرس الإشعارات */}
        <Header 
          userInitials={getInitials(fullName)} 
          pageTitle="لوحة التحكم"
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        />

        {/* محتوى الصفحة (Children) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          {children}
        </main>
        
      </div>
    </div>
  )
}