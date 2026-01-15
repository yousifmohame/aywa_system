// src/app/actions/auth.ts
'use server'

import { prisma } from '../lib/prisma'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'يرجى تعبئة جميع الحقول' }
  }

  try {
    // 1. البحث عن المستخدم بالبريد الإلكتروني
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // 2. إذا لم يوجد مستخدم
    if (!user) {
      return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
    }

    // 3. التحقق من كلمة المرور (مقارنة المشفرة)
    // bcrypt.compare(كلمة المرور المدخلة, كلمة المرور المشفرة في الداتابيس)
    const isPasswordValid = await bcrypt.compare(password, user.password)

    // ملاحظة: لدعم المستخدمين القدامى (Seed Data) الذين كلمات مرورهم غير مشفرة
    // يمكنك إضافة شرط إضافي (اختياري)، لكن الأفضل تشفير الجميع.
    // في حالتنا هنا، إذا كان الباسورد نص عادي، bcrypt سيرجع false، لذا يفضل تحديث الـ Seed ليكون مشفراً أيضاً أو إعادة تعيين كلمة المرور.
    
    // إذا فشلت المقارنة
    if (!isPasswordValid) {
        // فحص احتياطي: هل الباسورد مخزن كنص عادي (للمستخدمين القدامى جداً)؟
        // هذا السطر مؤقت فقط لمرحلة التطوير، يجب حذفه في الإنتاج
        if (user.password !== password) {
             return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
        }
    }
    
    // 4. التحقق هل الحساب نشط؟
    if (!user.isActive) {
        return { error: 'تم إيقاف هذا الحساب، يرجى مراجعة الإدارة' }
    }

    // 5. تسجيل الدخول ناجح - تخزين الكوكيز
    const cookieStore = await cookies()
    cookieStore.set('userId', user.id)
    cookieStore.set('userRole', user.role)

  } catch (error) {
    console.error("Login Error:", error)
    return { error: 'حدث خطأ في النظام' }
  }

  // التوجيه بناءً على الدور
  const userRole = await prisma.user.findUnique({ where: { email }, select: { role: true } })
  
  if (userRole?.role === 'MANAGER') {
    redirect('/dashboard/manager')
  } else if (userRole?.role === 'SUPERVISOR') {
    redirect('/dashboard/supervisor')
  } else {
    redirect('/dashboard/employee')
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('userId')
  cookieStore.delete('userRole')
  redirect('/')
}