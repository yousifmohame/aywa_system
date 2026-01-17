'use server'

import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'
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
export async function updateDepartmentAction(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!id || !name) {
    return { error: 'اسم القسم مطلوب' }
  }

  try {
    await prisma.department.update({
      where: { id },
      data: {
        name,
        description
      }
    })
    revalidatePath('/dashboard/settings/departments')
    return { success: true }
  } catch (e) {
    return { error: 'فشل التحديث' }
  }
}

export async function deleteDepartmentAction(id: string) {
  try {
    // بفضل onDelete: Cascade، هذا السطر سيحذف القسم 
    // وسيحذف تلقائياً كل الموظفين وكل بياناتهم المرتبطة به.
    await prisma.department.delete({
      where: { id }
    })
    
    revalidatePath('/dashboard/settings/departments')
    return { success: true }

  } catch (error) {
    console.error('Delete Error:', error)
    return { error: 'حدث خطأ أثناء حذف القسم.' }
  }
}