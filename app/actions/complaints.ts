// app/actions/complaints.ts
'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function submitComplaintAction(formData: FormData) {
  const submissionType = formData.get('submissionType') as string
  const serviceType = formData.get('serviceType') as string
  const orderNumber = formData.get('orderNumber') as string
  const clientType = formData.get('clientType') as string
  const clientName = formData.get('clientName') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const content = formData.get('content') as string
  
  // استقبال الملفات
  const files = formData.getAll('files') as File[]

  if (!submissionType || !serviceType || !clientType || !clientName || !phone || !email) {
    return { error: 'يرجى تعبئة جميع الحقول المطلوبة (*)' }
  }

  try {
    // 1. إنشاء الشكوى في قاعدة البيانات
    const newComplaint = await prisma.complaint.create({
      data: {
        submissionType,
        serviceType,
        orderNumber: orderNumber || null,
        clientType,
        clientName,
        phone,
        email,
        content: content || '',
        status: 'PENDING'
      }
    })

    // 2. معالجة الملفات (فقط إذا تم اختيار ملفات حقيقية)
    // نتحقق أن الملفات موجودة وأن حجم أول ملف أكبر من 0
    if (files && files.length > 0 && files[0].size > 0) {
      
      const uploadDir = path.join(process.cwd(), 'public/uploads')

      // التأكد من وجود المجلد، وإذا لم يكن موجوداً يتم إنشاؤه
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      for (const file of files) {
        // تجاهل الملف إذا كان فارغاً
        if (file.size === 0) continue;

        try {
          // إنشاء اسم فريد للملف لتجنب التكرار
          // نستخدم replace لإزالة المسافات من الاسم
          const uniqueName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
          const filePath = path.join(uploadDir, uniqueName)
          
          // تحويل الملف وحفظه
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          await writeFile(filePath, buffer)

          // حفظ الرابط في قاعدة البيانات
          await prisma.attachment.create({
            data: {
              filePath: `/uploads/${uniqueName}`,
              fileName: file.name,
              fileType: file.type || 'unknown',
              complaintId: newComplaint.id
            }
          })
        } catch (fileError) {
          console.error('Error saving specific file:', file.name, fileError)
          // نستمر في الحلقة حتى لو فشل ملف واحد
        }
      }
    }
    
    return { success: true }

  } catch (error) {
    console.error('CRITICAL ERROR SUBMITTING COMPLAINT:', error)
    return { error: 'حدث خطأ فني أثناء المعالجة، يرجى المحاولة لاحقاً' }
  }
}

// 2. تحديث حالة الشكوى (للموظف/المدير - Protected)
export async function updateComplaintStatusAction(id: string, status: string, note?: string) {
  try {
    await prisma.complaint.update({
      where: { id },
      data: { 
        status,
        adminNote: note 
      }
    })
    revalidatePath('/dashboard/complaints')
    return { success: true }
  } catch (error) {
    return { error: 'فشل تحديث الحالة' }
  }
}

export async function assignComplaintAction(complaintId: string, employeeId: string) {
  try {
    await prisma.complaint.update({
      where: { id: complaintId },
      data: { 
        assignedToId: employeeId,
        status: 'PENDING' // يمكن تغييرها إلى "قيد المعالجة" إذا أردت
      }
    })
    revalidatePath('/dashboard/complaints')
    revalidatePath('/dashboard/my-complaints')
    return { success: true }
  } catch (error) {
    return { error: 'فشل إسناد الشكوى' }
  }
}

// 2. جلب الشكاوى المسندة لموظف معين (لصفحة الموظف)
export async function getEmployeeComplaintsAction(employeeId: string) {
  try {
    const complaints = await prisma.complaint.findMany({
      where: { assignedToId: employeeId },
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, data: complaints }
  } catch (error) {
    return { error: 'فشل جلب الشكاوى' }
  }
}

export async function getComplaintByIdAction(id: string) {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { 
        assignedTo: true ,
        attachments: true
      }
    })
    
    if (!complaint) return { error: 'الشكوى غير موجودة' }
    
    return { success: true, data: complaint }
  } catch (error) {
    return { error: 'حدث خطأ في جلب البيانات' }
  }
}

// 3. جلب كل الشكاوى مع بيانات الموظف المسند إليه (للمدير)
// (تحديث للدالة القديمة getComplaintsAction)
export async function getAllComplaintsAction() {
    try {
        const complaints = await prisma.complaint.findMany({
            include: { assignedTo: { select: { fullName: true } } }, // جلب اسم الموظف
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: complaints }
    } catch (error) {
        return { error: 'فشل جلب البيانات' }
    }
}