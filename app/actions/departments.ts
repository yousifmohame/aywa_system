'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'

// إضافة قسم جديد
export async function createDepartmentAction(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) return { error: 'اسم القسم مطلوب' }

  try {
    await prisma.department.create({
      data: { name, description }
    })
    revalidatePath('/dashboard/settings/departments')
    return { success: true }
  } catch (e) {
    return { error: 'القسم موجود بالفعل أو حدث خطأ' }
  }
}

// تعديل قسم
export async function updateDepartmentAction(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  try {
    await prisma.department.update({
      where: { id },
      data: { name, description }
    })
    revalidatePath('/dashboard/settings/departments')
    return { success: true }
  } catch (e) {
    return { error: 'فشل التحديث' }
  }
}

// حذف قسم
export async function deleteDepartmentAction(id: string) {
  try {
    // التحقق أولاً: هل يوجد موظفين في هذا القسم؟
    const count = await prisma.user.count({ where: { departmentId: id } })
    if (count > 0) {
      return { error: 'لا يمكن حذف قسم يحتوي على موظفين. انقلهم أولاً.' }
    }

    await prisma.department.delete({ where: { id } })
    revalidatePath('/dashboard/settings/departments')
    return { success: true }
  } catch (e) {
    return { error: 'فشل الحذف' }
  }
}