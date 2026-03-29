"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateComplaintStatusAction } from "@/app/actions/complaints";
import {
  ArrowRight,
  FileText,
  User,
  Phone,
  Wrench,
  Paperclip,
  MessageSquare,
  CheckCircle,
  Save,
  Info,
  Download,
  Image as ImageIcon,
  File,
  MonitorSmartphone,
} from "lucide-react";

// دالة لتحديد اسم ولون النظام
const getSystemInfo = (systemCode: string) => {
  switch (systemCode) {
    case "aywa_nazeel":
      return {
        name: "إيوا نزيل",
        color: "bg-cyan-100 text-cyan-700 border-cyan-200",
      };
    case "nazeel_store":
      return {
        name: "نزيل ستور",
        color: "bg-orange-100 text-orange-700 border-orange-200",
      };
    case "prison_nazeel":
      return {
        name: "نزيل السجن",
        color: "bg-slate-100 text-slate-700 border-slate-200",
      };
    case "liniora":
      return {
        name: "لينيورا",
        color: "bg-rose-100 text-rose-700 border-rose-200",
      };
    default:
      return {
        name: "نظام غير معروف",
        color: "bg-gray-100 text-gray-700 border-gray-200",
      };
  }
};

export default function ComplaintDetailsView({ complaint }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState(complaint.status);
  const [note, setNote] = useState(complaint.adminNote || "");

  const handleSave = async () => {
    setLoading(true);
    const res = await updateComplaintStatusAction(complaint.id, status, note);
    setLoading(false);

    if (res.success) {
      alert("تم حفظ التحديثات وإرسال التنبيه للعميل بنجاح ✅");
      router.refresh();
    } else {
      alert("حدث خطأ أثناء الحفظ ❌");
    }
  };

  const dateObj = new Date(complaint.createdAt);
  const dateStr = dateObj.toLocaleDateString("en-CA");
  const timeStr = dateObj.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const statuses = [
    { value: "PENDING", label: "جديد / انتظار" },
    { value: "IN_PROGRESS", label: "قيد المعالجة" },
    { value: "SOLVED", label: "تم الحل" },
    { value: "CLOSED", label: "مغلق" },
  ];

  const getStatusButtonClass = (btnValue: string) => {
    const isActive = status === btnValue;
    if (isActive) {
      if (btnValue === "SOLVED")
        return "bg-green-100 text-green-700 border-green-200 shadow-sm";
      if (btnValue === "CLOSED")
        return "bg-gray-100 text-gray-700 border-gray-200 shadow-sm";
      return "bg-blue-100 text-blue-700 border-blue-200 shadow-sm";
    }
    return "bg-white text-gray-600 border-gray-200 hover:border-gray-300";
  };

  const systemInfo = getSystemInfo(complaint.sourceSystem);

  return (
    <main className="flex-1 p-3 overflow-y-auto font-[Tajawal]" dir="rtl">
      <div className="space-y-3 max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
            >
              <ArrowRight size={16} /> العودة
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="text-blue-600" size={16} />
              </div>
              <div className="text-left">
                <h1 className="text-sm font-bold text-gray-800">
                  تفاصيل الشكوى
                </h1>
                <p className="text-[10px] text-gray-500 font-mono">
                  #{complaint.orderNumber || "بدون رقم طلب"}
                </p>
              </div>
            </div>
          </div>

          {/* شارة النظام المصدر */}
          <div className="mt-3 flex items-center justify-end gap-2 border-t border-gray-50 pt-3">
            <span
              className={`px-2 py-1 rounded-md text-[10px] font-bold border ${systemInfo.color} flex items-center gap-1`}
            >
              <MonitorSmartphone size={12} /> {systemInfo.name}
            </span>
            <span className="text-[11px] font-bold text-gray-500">
              :مصدر البلاغ
            </span>
          </div>
        </div>

        {/* 1. Client Info */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-xs font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <User size={14} className="text-blue-600" /> معلومات العميل
          </h2>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] text-gray-600 mb-1 font-medium">
                اسم العميل ({complaint.clientType})
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <User size={12} className="text-gray-400" />
                <span className="text-xs text-gray-800">
                  {complaint.clientName}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-gray-600 mb-1 font-medium">
                رقم الجوال
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Phone size={12} className="text-gray-400" />
                <span className="text-xs text-gray-800 font-mono" dir="ltr">
                  {complaint.phone}
                </span>
              </div>
            </div>
            {complaint.email && (
              <div>
                <label className="block text-[10px] text-gray-600 mb-1 font-medium">
                  البريد الإلكتروني
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-800 font-mono">
                    {complaint.email}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Complaint Details */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-xs font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <FileText size={14} className="text-blue-600" /> تفاصيل الشكوى
          </h2>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] text-gray-600 mb-1 font-medium">
                نوع البلاغ / الخدمة
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Wrench size={12} className="text-gray-400" />
                <span className="text-xs text-gray-800">
                  {complaint.submissionType} - {complaint.serviceType}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-gray-600 mb-1 font-medium">
                التفاصيل
              </label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px]">
                <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {complaint.content || "لا توجد تفاصيل إضافية."}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-600 mb-1 font-medium">
                  التاريخ
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-800 font-mono">
                    {dateStr}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-gray-600 mb-1 font-medium">
                  الوقت
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-800 font-mono">
                    {timeStr}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Attachments */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-xs font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <Paperclip size={14} className="text-blue-600" /> المرفقات (
            {complaint.attachments ? complaint.attachments.length : 0})
          </h2>

          {complaint.attachments && complaint.attachments.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {complaint.attachments.map((file: any) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {file.fileType?.includes("image") ? (
                      <ImageIcon size={16} className="text-purple-500" />
                    ) : (
                      <File size={16} className="text-blue-500" />
                    )}

                    <div className="flex flex-col min-w-0">
                      <span
                        className="text-xs font-bold text-gray-700 truncate block max-w-[200px]"
                        title={file.fileName}
                      >
                        {file.fileName || "ملف مرفق"}
                      </span>
                    </div>
                  </div>

                  {/* تم تحديث الرابط هنا ليقرأ من file.fileUrl الخاص بكلاوديناري */}
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-white border border-blue-200 px-2 py-1.5 rounded hover:bg-blue-50 transition-colors"
                  >
                    <Download size={12} /> عرض الملف
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
              <p className="text-[10px] text-gray-400">
                لا توجد مرفقات مع هذا البلاغ
              </p>
            </div>
          )}
        </div>

        {/* 4. Employee Notes */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-xs font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <MessageSquare size={14} className="text-blue-600" /> ملاحظات الموظف
            / الحل
          </h2>
          <textarea
            placeholder="اكتب ردك أو تفاصيل الحل هنا... (سيتم إرسال هذا الرد للعميل عند تغيير الحالة)"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          ></textarea>
        </div>

        {/* 5. Status Actions */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-xs font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <CheckCircle size={14} className="text-blue-600" /> حالة البلاغ
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {statuses.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium border-2 transition-all ${getStatusButtonClass(s.value)}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            "جاري الحفظ والإرسال..."
          ) : (
            <>
              <Save size={18} /> حفظ التحديثات
            </>
          )}
        </button>

        {/* Alert Footer */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 mb-6">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-blue-900 mb-1">
                تنبيه لخدمة العملاء
              </h3>
              <p className="text-[10px] text-blue-700 leading-relaxed">
                أي تغيير في الحالة سيقوم بإرسال رسالة بريد إلكتروني للعميل تحتوي
                على الملاحظات التي كتبتها أعلاه. يرجى التأكد من صياغة الرد بشكل
                احترافي.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
