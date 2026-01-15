// app/components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Users, Building2, CheckSquare, 
  ClipboardList, Settings, LogOut, Menu, X, UserCircle 
} from 'lucide-react'
import { useState } from 'react'
import { logoutAction } from '@/app/actions/auth' // استدعاء الأكشن

const menuItems = [
  // 1. لوحات التحكم (كل دور يرى لوحته فقط)
  { name: 'لوحة التحكم', href: '/dashboard/manager', icon: LayoutDashboard, role: 'MANAGER' },
  { name: 'لوحة التحكم', href: '/dashboard/supervisor', icon: LayoutDashboard, role: 'SUPERVISOR' },
  { name: 'ملفي الشخصي', href: '/dashboard/employee', icon: LayoutDashboard, role: 'EMPLOYEE' },
  
  // 2. قوائم الإدارة (للمدير فقط)
  { name: 'الموظفين', href: '/dashboard/employees', icon: Users, role: 'MANAGER' },
  { name: 'الأقسام', href: '/dashboard/departments', icon: Building2, role: 'MANAGER' },
  
  // 3. قوائم مشتركة
  { name: 'المهام', href: '/dashboard/tasks', icon: CheckSquare, role: 'ALL' },
  
  // 4. بقية قوائم الإدارة
  { name: 'التقييمات', href: '/dashboard/evaluations', icon: ClipboardList, role: 'MANAGER' },
  { name: 'الإعدادات', href: '/dashboard/settings', icon: Settings, role: 'MANAGER' },
]

export default function Sidebar({ userRole, isOpen, setIsOpen }: any) {
  const pathname = usePathname()
  // const [isOpen, setIsOpen] = useState(false)

  // === التصحيح المنطقي هنا ===
  // 1. اعرض العنصر إذا كان دوره 'ALL'
  // 2. أو إذا كان دور العنصر يطابق دور المستخدم تماماً
  const filteredMenu = menuItems.filter(item => 
    item.role === 'ALL' || item.role === userRole
  )

  return (
    <>
      {/* Mobile Trigger */}
      {/* <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-md shadow-md text-slate-800"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button> */}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 z-40 h-screen w-64 bg-[#0f172a] text-white transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
        lg:translate-x-0 lg:static flex flex-col
      `}>
          
          {/* Logo Area */}
          <div className="h-20 flex items-center justify-center border-b border-slate-700 bg-[#0f172a]">
            <h1 className="text-xl font-bold font-sans tracking-wider text-white">Aiwa Nazeel</h1>
          </div>

          {/* User Info (Debugging Helper) */}
          {/* هذا الجزء سيساعدك جداً لتعرف النظام كيف يراك الآن */}
          <div className="px-4 py-4 bg-slate-800/50 border-b border-slate-700 mb-2">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                   <UserCircle size={20} />
                </div>
                <div>
                   <p className="text-xs text-slate-400 font-bold">الحساب الحالي:</p>
                   <p className="text-xs font-bold text-white tracking-wider">{userRole}</p>
                </div>
             </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
            {filteredMenu.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-700 bg-[#0f172a]">
            <button 
              onClick={() => logoutAction()} // استدعاء الأكشن الحقيقي
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              تسجيل الخروج
            </button>
          </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}