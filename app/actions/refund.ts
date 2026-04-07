'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitUnifiedRefundAction(formData: FormData) {
  try {
    const department = formData.get('department') as string
    const employeeName = formData.get('employeeName') as string

    let targetEmail = ''
    let subject = ''
    let htmlContent = ''

    // ==========================================
    // 1. معالجة طلب "أيوا نزيل"
    // ==========================================
    if (department === 'aywa') {
      targetEmail = 'info@aywanazeel.com'
      const actionType = formData.get('actionType') as string
      const orderNumber = formData.get('orderNumber') as string
      const contactType = formData.get('contactType') as string
      const orderDetails = formData.get('orderDetails') as string

      subject = `نموذج استرجاع (أيوا نزيل) - طلب رقم ${orderNumber}`
      htmlContent = `
        <div dir="rtl" style="font-family: Arial; padding: 20px; color: #333; background-color: #f8fafc;">
          <div style="max-w: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
              <h2 style="color: #fff; margin: 0;">طلب استرجاع جديد (أيوا نزيل) 🔄</h2>
            </div>
            <div style="padding: 24px;">
              <p><strong>الموظف مقدم الطلب:</strong> ${employeeName}</p>
              <p><strong>رقم الطلب:</strong> ${orderNumber}</p>
              <p><strong>نوع الإجراء:</strong> <span style="color: #ea580c; font-weight: bold;">${actionType}</span></p>
              <p><strong>طريقة التواصل المفضلة:</strong> ${contactType === 'whatsapp' ? 'واتساب' : 'مكالمة هاتفية'}</p>
              <h3 style="color: #4f46e5; margin-top: 20px;">📝 تفاصيل الطلب:</h3>
              <p style="background: #f1f5f9; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${orderDetails}</p>
            </div>
          </div>
        </div>
      `
    } 
    // ==========================================
    // 2. معالجة طلب "شركة الشحن سبل"
    // ==========================================
    else if (department === 'sabl') {
      targetEmail = 'info@aywanazeel.com' // ضع الإيميل الصحيح هنا
      const issueType = formData.get('issueType') as string
      const inmateName = formData.get('inmateName') as string
      const inmateId = formData.get('inmateId') as string
      const prisonName = formData.get('prisonName') as string
      const iban = formData.get('iban') as string
      const last4Digits = formData.get('last4Digits') as string
      const accountName = formData.get('accountName') as string

      // معالجة المرفق
      const file = formData.get('file') as File | null
      let attachments = []
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        attachments.push({ filename: file.name, content: buffer })
      }

      subject = `طلب استرداد مالي (سبل) - ${inmateName}`
      htmlContent = `
        <div dir="rtl" style="font-family: Arial; padding: 20px; color: #333; background-color: #f8fafc;">
          <div style="max-w: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background-color: #2563eb; padding: 20px; text-align: center;">
              <h2 style="color: #fff; margin: 0;">نموذج استرداد مالي (سبل) 💳</h2>
            </div>
            <div style="padding: 24px;">
              <p><strong>الموظف مقدم الطلب:</strong> ${employeeName}</p>
              <p><strong>نوع المشكلة:</strong> <span style="color: #dc2626; font-weight: bold;">${issueType}</span></p>
              <h3 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #1e40af;">👤 بيانات النزيل</h3>
              <p><strong>الاسم الرباعي:</strong> ${inmateName}</p>
              <p><strong>رقم الهوية:</strong> ${inmateId}</p>
              <p><strong>اسم السجن:</strong> ${prisonName}</p>
              <h3 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #1e40af; margin-top: 20px;">🏦 البيانات البنكية</h3>
              <p><strong>اسم صاحب الحساب:</strong> ${accountName}</p>
              <p><strong>الآيبان (IBAN):</strong> <span dir="ltr">${iban}</span></p>
              <p><strong>آخر 4 أرقام:</strong> <span dir="ltr">${last4Digits}</span></p>
            </div>
          </div>
        </div>
      `

      // إرسال إيميل سبل مع المرفقات
      await resend.emails.send({
        from: 'Refund System <aywa@aywasystem.online>',
        to: targetEmail,
        subject,
        html: htmlContent,
        attachments: attachments.length > 0 ? attachments : undefined,
      })

      return { success: true }
    } else {
      return { error: 'جهة غير صالحة' }
    }

    // إرسال إيميل أيوا نزيل (لأنه لا يحتاج مرفقات في هذا التصميم)
    if (department === 'aywa') {
      await resend.emails.send({
        from: 'Refund System <aywa@aywasystem.online>',
        to: targetEmail,
        subject,
        html: htmlContent,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Unified Refund Error:', error)
    return { error: 'تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.' }
  }
}