// app/dashboard/complaints/ComplaintsList.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getAllComplaintsAction } from "@/app/actions/complaints";
import AssignButton from "./AssignButton";
import { User, Wrench, Loader2 } from "lucide-react";

export default function ComplaintsList({ 
  initialComplaints, 
  employees, 
  totalPages 
}: { 
  initialComplaints: any[]; 
  employees: any[]; 
  totalPages: number;
}) {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(totalPages > 1);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const statusColors: any = {
    PENDING: "bg-blue-100 text-blue-700 border-blue-200",
    SOLVED: "bg-green-100 text-green-700 border-green-200",
    CLOSED: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const statusText: any = {
    PENDING: "جديد / قيد المعالجة",
    SOLVED: "تم الحل",
    CLOSED: "مغلق",
  };

  // دالة جلب المزيد من البيانات
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    const nextPage = page + 1;
    
    try {
      const res = await getAllComplaintsAction(nextPage, 50); // نجلب 50 في كل مرة
      if (res.success && res.data) {
        setComplaints((prev) => [...prev, ...res.data]);
        setPage(nextPage);
        if (nextPage >= (res.metadata?.totalPages || 1)) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error loading more complaints", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // مراقبة الوصول لأسفل الصفحة (Intersection Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  if (complaints.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-400 font-medium">لا توجد شكاوى حالياً</p>
      </div>
    );
  }

  return (
    <>
      {/* 1. عرض الجوال (Mobile View) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {complaints.map((c) => (
          <div key={c.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-gray-400 font-medium block mb-1">رقم البلاغ</span>
                <span className="text-base font-bold text-blue-600 font-mono">#{c.orderNumber || "---"}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${statusColors[c.status] || "bg-gray-100"}`}>
                {statusText[c.status]}
              </span>
            </div>

            <div className="space-y-3 pt-3 border-t border-dashed border-gray-100">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                  <User size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">العميل</span>
                  <span className="font-bold">{c.clientName}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                  <Wrench size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">الخدمة</span>
                  <span className="font-medium">{c.serviceType}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
              <div>
                {c.assignedTo ? (
                  <div className="flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100">
                    <span className="text-[10px] text-indigo-400">مسند لـ:</span>
                    <span className="text-xs font-bold text-indigo-700">{c.assignedTo.fullName}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded">غير مسند</span>
                )}
              </div>
              <div>
                <AssignButton complaint={c} employees={employees} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. عرض سطح المكتب (Desktop View) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-right font-bold text-gray-600 text-xs uppercase tracking-wider">رقم البلاغ</th>
                <th className="px-6 py-4 text-right font-bold text-gray-600 text-xs uppercase tracking-wider">العميل</th>
                <th className="px-6 py-4 text-right font-bold text-gray-600 text-xs uppercase tracking-wider">الخدمة</th>
                <th className="px-6 py-4 text-right font-bold text-gray-600 text-xs uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-4 text-right font-bold text-gray-600 text-xs uppercase tracking-wider">المسند إليه</th>
                <th className="px-6 py-4 text-center font-bold text-gray-600 text-xs uppercase tracking-wider">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-blue-600 font-mono">#{c.orderNumber || "---"}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        <User size={12} />
                      </div>
                      {c.clientName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{c.serviceType}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[c.status] || "bg-gray-100"}`}>
                      {statusText[c.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.assignedTo ? (
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 inline-block">
                        {c.assignedTo.fullName}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[10px] italic">-- غير مسند --</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <AssignButton complaint={c} employees={employees} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* عنصر التتبع (Observer Target) ومؤشر التحميل */}
      {hasMore && (
        <div ref={observerTarget} className="flex justify-center items-center py-6 mt-4">
          {loading ? (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="animate-spin" size={24} />
              <span className="font-medium text-sm">جاري تحميل المزيد...</span>
            </div>
          ) : (
            <div className="h-10"></div> /* مساحة شفافة ليقوم المراقب باكتشافها */
          )}
        </div>
      )}
    </>
  );
}
