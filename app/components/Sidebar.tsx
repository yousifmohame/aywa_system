// app/components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Users, Building2, CheckSquare, 
  ClipboardList, Settings, LogOut, UserCircle 
} from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'

const menuItems = [
  // 1. لوحات التحكم
  { name: 'لوحة التحكم', href: '/dashboard/manager', icon: LayoutDashboard, role: 'MANAGER' },
  { name: 'لوحة التحكم', href: '/dashboard/supervisor', icon: LayoutDashboard, role: 'SUPERVISOR' },
  { name: 'ملفي الشخصي', href: '/dashboard/employee', icon: LayoutDashboard, role: 'EMPLOYEE' },
  
  // 2. قوائم الإدارة (مدير ومشرف)
  { name: 'الموظفين', href: '/dashboard/employees', icon: Users, role: 'MANAGER' },
  { name: 'شكاوي العملاء', href: '/dashboard/complaints', icon: Users, role: 'MANAGER' },
  { name: 'شكاوي العملاء', href: '/dashboard/complaints', icon: Users, role: 'SUPERVISOR' },
  { name: 'الأقسام', href: '/dashboard/departments', icon: Building2, role: 'MANAGER' },
  
  // 3. قوائم الموظف (الجديد)
  { name: 'شكاوي العملاء', href: '/dashboard/my-complaints', icon: Users, role: 'EMPLOYEE' }, // <--- تمت الإضافة هنا

  // 4. قوائم مشتركة
  { name: 'المهام', href: '/dashboard/tasks', icon: CheckSquare, role: 'ALL' },
  
  // 5. بقية القوائم
  { name: 'التقييمات', href: '/dashboard/evaluations', icon: ClipboardList, role: 'MANAGER' },
  { name: 'الإعدادات', href: '/dashboard/settings', icon: Settings, role: 'MANAGER' },
]

export default function Sidebar({ userRole, isOpen, setIsOpen }: any) {
  const pathname = usePathname()

  const filteredMenu = menuItems.filter(item => 
    item.role === 'ALL' || item.role === userRole
  )

  return (
    <>
      {/* Sidebar Overlay (Mobile) */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 right-0 z-40 h-screen w-64 
        bg-[#0f172a] border-l border-slate-800 
        text-white transition-transform duration-300 ease-in-out shadow-2xl
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
        lg:translate-x-0 lg:static lg:shadow-none flex flex-col font-[Tajawal]
      `}>
          
          {/* 1. Logo Area */}
          <div className="h-20 flex items-center justify-center border-b border-slate-800 bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
            <div className="text-center">
              <h1 className="text-xl font-bold tracking-wide text-white">بوابة الموظفين</h1>
              <p className="text-[10px] text-blue-400 tracking-wider uppercase opacity-80">مركز التحكم</p>
            </div>
          </div>

          {/* 2. User Info Card */}
          <div className="p-4">
            <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg shadow-blue-900/20">
                   <UserCircle size={22} className="text-white" />
                </div>
                <div className="overflow-hidden">
                   <p className="text-[10px] text-slate-400 font-medium">الدور الحالي</p>
                   <p className="text-xs font-bold text-white truncate">
                     {userRole === 'MANAGER' ? 'المدير العام' : 
                      userRole === 'SUPERVISOR' ? 'مشرف قسم' : 'موظف'}
                   </p>
                </div>
            </div>
          </div>

          {/* 3. Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
            {filteredMenu.map((item, index) => {
              const isActive = pathname === item.href
              // استخدام index كمفتاح فريد في حال تكرار الروابط (رغم أنه لا يفضل) أو دمج role مع href
              return (
                <Link 
                  key={`${item.href}-${item.role}-${index}`} 
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 translate-x-1' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'}
                  `}
                >
                  <item.icon size={20} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} transition-colors`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* 4. Logout Button */}
          <div className="p-4 border-t border-slate-800 bg-[#0f172a]">
            <button 
              onClick={() => logoutAction()}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-200"
            >
              <LogOut size={18} />
              تسجيل الخروج
            </button>
            <p className="text-[10px] text-center text-slate-600 mt-3"> الإصدار 1.0.0 © 2025</p>
          </div>
      </aside>
    </>
  )
}