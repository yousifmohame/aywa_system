"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitUnifiedRefundAction(formData: FormData) {
  try {
    const department = formData.get("department") as string;
    const sourceName = (formData.get("sourceName") as string) || "aywa";

    const employeeName = formData.get("employeeName") as string;
    const orderDetails = formData.get("orderDetails") as string;

    const targetEmail =
      sourceName === "store" ? "info@nazeelstore.com" : "info@aywanazeel.com";
    const systemTitle = sourceName === "store" ? "نزيل ستور" : "إيوا نزيل";
    const themeColor = sourceName === "store" ? "#9333ea" : "#16a34a";

    let subject = "";
    let htmlContent = "";
    let attachments: any[] = []; // 👈 مصفوفة المرفقات أصبحت عامة لتعمل مع الكل

    // ==========================================
    // 1. معالجة طلب "أيوا نزيل" أو "نزيل ستور"
    // ==========================================
    if (department === "aywa" || department === "store") {
      const actionType = formData.get("actionType") as string;
      const orderNumber = formData.get("orderNumber") as string;
      const contactType = formData.get("contactType") as string;

      // تجهيز قسم معلومات التواصل بناءً على الاختيار
      let contactHtml = "";

      if (contactType === "whatsapp") {
        contactHtml = `<p><strong>طريقة التواصل:</strong> واتساب 💬</p>`;
        // سحب مرفقات الواتساب المتعددة إن وجدت
        const whatsappFiles = formData.getAll("whatsappFiles") as File[];
        for (const f of whatsappFiles) {
          if (f.size > 0) {
            const bytes = await f.arrayBuffer();
            attachments.push({ filename: f.name, content: Buffer.from(bytes) });
          }
        }
      } else if (contactType === "call") {
        const customerPhone = formData.get("customerPhone") as string;
        const callTime = formData.get("callTime") as string;
        // تنسيق التاريخ ليكون مقروءاً
        const formattedTime = callTime
          ? new Date(callTime).toLocaleString("ar-EG")
          : "غير محدد";

        contactHtml = `
          <p><strong>طريقة التواصل:</strong> مكالمة هاتفية 📞</p>
          <p><strong>رقم العميل:</strong> <span dir="ltr">${customerPhone}</span></p>
          <p><strong>وقت الاتصال:</strong> <span dir="ltr">${formattedTime}</span></p>
        `;
      }

      subject = `نموذج استرجاع (${systemTitle}) - طلب رقم ${orderNumber}`;
      htmlContent = `
        <div dir="rtl" style="font-family: Arial; padding: 20px; color: #333; background-color: #f8fafc;">
          <div style="max-w: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background-color: ${themeColor}; padding: 20px; text-align: center;">
              <h2 style="color: #fff; margin: 0;">طلب استرجاع جديد (${systemTitle}) 🔄</h2>
            </div>
            <div style="padding: 24px;">
              <p><strong>الموظف مقدم الطلب:</strong> ${employeeName}</p>
              <p><strong>رقم الطلب:</strong> ${orderNumber}</p>
              <p><strong>نوع الإجراء:</strong> <span style="color: #ea580c; font-weight: bold;">${actionType}</span></p>
              
              <h3 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: ${themeColor}; margin-top: 20px;">📱 معلومات التواصل</h3>
              ${contactHtml}

              <h3 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: ${themeColor}; margin-top: 20px;">📝 تفاصيل الطلب:</h3>
              <p style="background: #f1f5f9; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${orderDetails}</p>
            </div>
          </div>
        </div>
      `;
    }
    // ==========================================
    // 2. معالجة طلب "شركة الشحن سبل"
    // ==========================================
    else if (department === "sabl") {
      const issueType = formData.get("issueType") as string;
      const inmateName = formData.get("inmateName") as string;
      const inmateId = formData.get("inmateId") as string;
      const prisonName = formData.get("prisonName") as string;
      const iban = formData.get("iban") as string;
      const last4Digits = formData.get("last4Digits") as string;
      const accountName = formData.get("accountName") as string;

      const file = formData.get("file") as File | null;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        attachments.push({ filename: file.name, content: Buffer.from(bytes) });
      }

      subject = `طلب استرداد مالي سبل (${systemTitle}) - ${inmateName}`;
      htmlContent = `
        <div dir="rtl" style="font-family: Arial; padding: 20px; color: #333; background-color: #f8fafc;">
          <div style="max-w: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background-color: #2563eb; padding: 20px; text-align: center;">
              <h2 style="color: #fff; margin: 0;">نموذج استرداد مالي - سبل (${systemTitle}) 💳</h2>
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
              <h3 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #1e40af; margin-top: 20px;">📝 تفاصيل الطلب / ملاحظات:</h3>
              <p style="background: #f1f5f9; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${orderDetails}</p>
            </div>
          </div>
        </div>
      `;
    } else {
      return { error: "جهة غير صالحة" };
    }

    // إرسال الإيميل النهائي (يعمل للجهتين)
    await resend.emails.send({
      from: "Refund System <aywa@aywasystem.online>",
      to: targetEmail,
      subject,
      html: htmlContent,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    return { success: true };
  } catch (error) {
    console.error("Unified Refund Error:", error);
    return { error: "تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً." };
  }
}
