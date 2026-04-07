"use client";

import { useState, useTransition } from "react";
import { submitUnifiedRefundAction } from "@/app/actions/refund";
import { RefreshCcw, UserCircle, Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function UnifiedRefundPage() {
  // حالة لاختيار الجهة (aywa أو sabl)
  const [department, setDepartment] = useState<"aywa" | "sabl">("aywa");
  
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await submitUnifiedRefundAction(formData);
        if (res.success) {
          setIsSuccess(true);
        } else {
          setErrorMessage(res.error || "حدث خطأ غير متوقع.");
        }
      } catch (error) {
        setErrorMessage("تعذر الاتصال بالخادم. يرجى المحاولة مجدداً.");
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تم إرسال الطلب بنجاح!</h2>
          <p className="text-gray-500">تم تحويل طلبك للإدارة المعنية بنجاح وسيتم مراجعته قريباً.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-gray-50 py-8 px-4 font-[Tajawal]" dir="rtl">
      <div className="max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-900/5 border border-gray-100 p-6 sm:p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-50 rounded-2xl mb-4 shadow-lg shadow-indigo-500/10 border border-indigo-100">
              <RefreshCcw className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">نموذج الاسترجاع</h1>
            <p className="text-sm text-gray-500">قم بملء البيانات المطلوبة أدناه</p>
          </div>

          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-medium">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* الحقل المشترك: اسم الموظف */}
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
              <label className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-700">
                <UserCircle className="w-5 h-5 text-indigo-600" />
                <span>اسم الموظف المتخذ الإجراء</span>
              </label>
              <input name="employeeName" type="text" className="w-full p-3.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm" placeholder="أدخل اسم الموظف" required />
            </div>

            {/* أزرار اختيار الجهة (التحكم السحري) */}
            <div>
              <label className="block mb-3 text-sm font-bold text-gray-700">جهة الاسترجاع</label>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${department === "aywa" ? "border-indigo-600 bg-indigo-50 shadow-sm text-indigo-700 font-bold" : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-gray-600"}`}>
                  <input type="radio" name="department" value="aywa" checked={department === "aywa"} onChange={() => setDepartment("aywa")} className="w-5 h-5 accent-indigo-600" />
                  <span>أيوا نزيل</span>
                </label>
                
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${department === "sabl" ? "border-indigo-600 bg-indigo-50 shadow-sm text-indigo-700 font-bold" : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-gray-600"}`}>
                  <input type="radio" name="department" value="sabl" checked={department === "sabl"} onChange={() => setDepartment("sabl")} className="w-5 h-5 accent-indigo-600" />
                  <span>شركة الشحن سبل</span>
                </label>
              </div>
            </div>

            {/* ==================================== */}
            {/* 🟦 حقول "أيوا نزيل" (تظهر فقط عند اختياره) */}
            {/* ==================================== */}
            {department === "aywa" && (
              <div className="space-y-5 animate-in slide-in-from-top-4 fade-in duration-300">
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">نوع الإجراء</label>
                  <select name="actionType" className="w-full p-3.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm text-gray-600" required>
                    <option value="">اختر نوع الإجراء</option>
                    <option value="إلغاء">إلغاء</option>
                    <option value="جزئي">جزئي</option>
                    <option value="كامل">كامل</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">رقم الطلب</label>
                  <input name="orderNumber" type="text" className="w-full p-3.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm" placeholder="أدخل رقم الطلب" required />
                </div>
                <div>
                  <label className="block mb-3 text-sm font-bold text-gray-700">نوع التواصل</label>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <label className="flex items-center justify-center gap-2 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700 has-[:checked]:font-bold">
                      <input type="radio" name="contactType" value="whatsapp" className="sr-only" required />
                      <span>واتساب</span>
                    </label>
                    <label className="flex items-center justify-center gap-2 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700 has-[:checked]:font-bold">
                      <input type="radio" name="contactType" value="call" className="sr-only" required />
                      <span>مكالمة</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">تفاصيل الطلب</label>
                  <textarea name="orderDetails" rows={4} className="w-full p-3.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all text-sm" placeholder="أدخل تفاصيل الطلب" required></textarea>
                </div>
              </div>
            )}

            {/* ==================================== */}
            {/* 🟧 حقول "شركة الشحن سبل" (تظهر فقط عند اختياره) */}
            {/* ==================================== */}
            {department === "sabl" && (
              <div className="space-y-5 animate-in slide-in-from-top-4 fade-in duration-300">
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">نوع المشكلة</label>
                  <select name="issueType" className="w-full p-3.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm text-gray-600" required>
                    <option value="">اختر نوع المشكلة</option>
                    <option value="عنوان غير صحيح">عنوان غير صحيح</option>
                    <option value="نقص في الطلب">نقص</option>
                    <option value="منتج مختلف">مختلف</option>
                    <option value="استرجاع جزئي">جزئي</option>
                    <option value="استرجاع كامل">كامل</option>
                  </select>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                  <h3 className="font-bold text-gray-800 text-sm mb-3">بيانات النزيل</h3>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-gray-600">الاسم الرباعي</label>
                    <input name="inmateName" type="text" className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm" placeholder="الاسم الكامل" required />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-gray-600">رقم الهوية</label>
                    <input name="inmateId" type="text" className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm" placeholder="رقم الهوية" required />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-gray-600">السجن</label>
                    <input name="prisonName" type="text" className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm" placeholder="اسم السجن" required />
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                  <h3 className="font-bold text-gray-800 text-sm mb-3">البيانات البنكية</h3>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-gray-600">رقم الحساب (IBAN)</label>
                    <input name="iban" type="text" dir="ltr" className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm text-left" placeholder="SAXXXXXXXXXXXXXXXXXX" required />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-gray-600">آخر 4 أرقام</label>
                    <input name="last4Digits" type="text" maxLength={4} dir="ltr" className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm text-center tracking-widest" placeholder="XXXX" required />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-gray-600">اسم صاحب الحساب</label>
                    <input name="accountName" type="text" className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm" placeholder="الاسم الكامل" required />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">إرفاق البلاغ</label>
                  <input type="file" name="file" className="w-full p-2 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:border-indigo-500 transition-all file:ml-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 file:cursor-pointer file:font-bold text-sm text-gray-600" required />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" disabled={isPending} className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2 font-bold disabled:opacity-70 group mt-8">
              {isPending ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <span>إرسال الطلب</span>
                  <Send className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}