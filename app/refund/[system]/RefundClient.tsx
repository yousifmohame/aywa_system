"use client";

import { useState, useTransition } from "react";
import { submitRefundAction } from "@/app/actions/refund";
import {
  Undo2,
  UserCircle,
  Building2,
  Landmark,
  Upload,
  CheckCircle2,
  Loader2,
  Package,
  Building,
} from "lucide-react";

// ==========================================
// 🎨 نظام الهويات البصرية (Theme Configuration)
// ==========================================
const themes = {
  "aywa-nazeel": {
    wrapper: "bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100",
    card: "bg-white/80 backdrop-blur-xl border-teal-100 shadow-2xl shadow-teal-900/10 rounded-[2.5rem]",
    headerIconWrap:
      "bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/30 border-0 rounded-2xl",
    headerIconColor: "text-white",
    title: "text-teal-900",
    badge: "bg-teal-50 text-teal-700 border border-teal-200 rounded-full",
    label: "text-teal-900 font-bold",
    input:
      "bg-white border-teal-100 focus:border-teal-500 focus:ring-teal-500/20 rounded-2xl shadow-sm shadow-teal-100",
    sectionBg: "bg-teal-50/50 border border-teal-100 rounded-3xl p-5",
    sectionTitle: "text-teal-800",
    uploadArea:
      "border-teal-200 bg-teal-50/30 hover:border-teal-400 hover:bg-teal-50/80 rounded-2xl border-dashed",
    uploadIconWrap: "bg-teal-100 text-teal-600 rounded-xl",
    button:
      "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/25 hover:from-teal-700 hover:to-emerald-700 rounded-2xl",
  },
  sabl: {
    wrapper: "bg-slate-50", // لون رسمي ومؤسسي
    card: "bg-white border-slate-200 shadow-sm rounded-xl",
    headerIconWrap: "bg-blue-50 border border-blue-100 rounded-lg",
    headerIconColor: "text-blue-600",
    title: "text-slate-900",
    badge: "bg-blue-600 text-white rounded-md px-3 py-1",
    label: "text-slate-700 font-semibold",
    input:
      "bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg",
    sectionBg: "bg-white border border-slate-200 rounded-xl p-5 shadow-sm",
    sectionTitle: "text-slate-800",
    uploadArea:
      "border-slate-300 bg-slate-50 hover:border-blue-500 rounded-xl border-dashed",
    uploadIconWrap:
      "bg-blue-50 text-blue-600 border border-blue-100 rounded-lg",
    button:
      "bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 rounded-xl",
  },
};

export default function RefundClient({
  system,
  systemName,
}: {
  system: "aywa-nazeel" | "sabl";
  systemName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState("");

  // سحب الهوية البصرية بناءً على الرابط
  const theme = themes[system];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("system", system);

    startTransition(async () => {
      const res = await submitRefundAction(formData);
      if (res.success) setIsSuccess(true);
      else alert(res.error);
    });
  };

  // --- شاشة النجاح ---
  if (isSuccess) {
    return (
      <div
        className={`min-h-[100dvh] flex items-center justify-center p-4 ${theme.wrapper}`}
        dir="rtl"
      >
        <div className={`max-w-md w-full text-center p-8 ${theme.card}`}>
          <div
            className={`w-20 h-20 flex items-center justify-center mx-auto mb-6 ${theme.headerIconWrap}`}
          >
            <CheckCircle2 size={40} className={theme.headerIconColor} />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${theme.title}`}>
            تم إرسال الطلب بنجاح!
          </h2>
          <p className="text-gray-500">
            تم تحويل طلب الاسترداد إلى الإدارة المالية للمراجعة.
          </p>
        </div>
      </div>
    );
  }

  // --- شاشة النموذج ---
  return (
    <div
      className={`min-h-[100dvh] py-8 px-4 font-[Tajawal] ${theme.wrapper}`}
      dir="rtl"
    >
      <div className="max-w-md mx-auto">
        <div className={`p-6 sm:p-8 ${theme.card}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 mb-4 ${theme.headerIconWrap}`}
            >
              {system === "sabl" ? (
                <Package className={`w-8 h-8 ${theme.headerIconColor}`} />
              ) : (
                <Undo2 className={`w-8 h-8 ${theme.headerIconColor}`} />
              )}
            </div>
            <h1 className={`text-xl font-bold mb-2 ${theme.title}`}>
              نموذج طلب استرداد
            </h1>
            <p
              className={`text-xs font-bold inline-block px-3 py-1 ${theme.badge}`}
            >
              {systemName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* الموظف */}
            <div className={`space-y-2`}>
              <label
                className={`flex items-center gap-2 text-sm ${theme.label}`}
              >
                <UserCircle className="w-4 h-4 opacity-70" />
                <span>اسم الموظف مُقدم الطلب</span>
              </label>
              <input
                name="employeeName"
                type="text"
                className={`w-full p-3.5 border focus:outline-none focus:ring-2 transition-all text-sm ${theme.input}`}
                placeholder="أدخل اسمك الكامل"
                required
              />
            </div>

            {/* نوع المشكلة */}
            <div className={`space-y-2`}>
              <label className={`block text-sm ${theme.label}`}>
                نوع المشكلة
              </label>
              <select
                name="issueType"
                className={`w-full p-3.5 border focus:outline-none focus:ring-2 transition-all text-sm text-gray-600 ${theme.input}`}
                required
              >
                <option value="">اختر سبب الاسترداد</option>
                <option value="عنوان خاطئ">عنوان خاطئ</option>
                <option value="نقص في الطلب">نقص في الطلب</option>
                <option value="منتج مختلف">منتج مختلف</option>
                <option value="استرجاع جزئي">استرجاع جزئي</option>
                <option value="استرجاع كامل">استرجاع كامل</option>
              </select>
            </div>

            {/* بيانات النزيل */}
            <div className={`space-y-4 ${theme.sectionBg}`}>
              <h3
                className={`text-sm font-bold flex items-center gap-2 mb-1 ${theme.sectionTitle}`}
              >
                <Building2 className="w-4 h-4 opacity-70" /> بيانات النزيل
              </h3>
              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-500">
                  الاسم الرباعي
                </label>
                <input
                  name="inmateName"
                  type="text"
                  className={`w-full p-3 border focus:outline-none focus:ring-2 transition-all text-sm ${theme.input}`}
                  placeholder="الاسم الكامل للنزيل"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-gray-500">
                    رقم الهوية
                  </label>
                  <input
                    name="inmateId"
                    type="text"
                    className={`w-full p-3 border focus:outline-none focus:ring-2 transition-all text-sm ${theme.input}`}
                    placeholder="رقم الهوية"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-gray-500">
                    اسم السجن
                  </label>
                  <input
                    name="prisonName"
                    type="text"
                    className={`w-full p-3 border focus:outline-none focus:ring-2 transition-all text-sm ${theme.input}`}
                    placeholder="مثال: سجن الملز"
                    required
                  />
                </div>
              </div>
            </div>

            {/* البيانات البنكية */}
            <div className={`space-y-4 ${theme.sectionBg}`}>
              <h3
                className={`text-sm font-bold flex items-center gap-2 mb-1 ${theme.sectionTitle}`}
              >
                <Landmark className="w-4 h-4 opacity-70" /> البيانات البنكية
              </h3>
              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-500">
                  اسم صاحب الحساب
                </label>
                <input
                  name="accountName"
                  type="text"
                  className={`w-full p-3 border focus:outline-none focus:ring-2 transition-all text-sm ${theme.input}`}
                  placeholder="الاسم المطابق للحساب البنكي"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block mb-1.5 text-xs font-bold text-gray-500">
                    الآيبان (IBAN)
                  </label>
                  <input
                    name="iban"
                    type="text"
                    dir="ltr"
                    className={`w-full p-3 border focus:outline-none focus:ring-2 transition-all text-sm text-left ${theme.input}`}
                    placeholder="SA..."
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="block mb-1.5 text-xs font-bold text-gray-500">
                    آخر 4 أرقام
                  </label>
                  <input
                    name="last4Digits"
                    type="text"
                    maxLength={4}
                    dir="ltr"
                    className={`w-full p-3 border focus:outline-none focus:ring-2 transition-all text-sm text-center tracking-widest ${theme.input}`}
                    placeholder="XXXX"
                    required
                  />
                </div>
              </div>
            </div>

            {/* المرفقات */}
            <div className={`space-y-2`}>
              <label className={`block text-sm ${theme.label}`}>
                إرفاق صورة البلاغ / الإيصال
              </label>
              <label
                className={`cursor-pointer w-full p-4 border-2 flex items-center gap-3 transition-colors ${theme.uploadArea}`}
              >
                <div className={`p-2 ${theme.uploadIconWrap}`}>
                  <Upload size={20} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-gray-700 truncate">
                    {fileName || "اختر ملفاً أو اسحبه هنا"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    PNG, JPG, PDF (حتى 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  name="file"
                  required
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                />
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className={`w-full py-4 transition-all active:scale-[0.98] flex items-center justify-center gap-2 font-bold disabled:opacity-70 ${theme.button}`}
            >
              {isPending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>إرسال الطلب للاعتماد</span>
                  <Undo2 className="w-5 h-5 rotate-180" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
