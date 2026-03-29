"use client";

import { useState } from "react";
import { createTaskAction } from "@/app/actions/tasks";
import { Plus, X, Loader2, Calendar } from "lucide-react";

export default function AddTaskModal({ employees }: { employees: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    await createTaskAction(formData);

    setIsLoading(false);
    setIsOpen(false);
  }

  return (
    <>
      {/* BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition"
      >
        <Plus size={16} />
        مهمة جديدة
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-[Tajawal]"
          dir="rtl"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">

            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 text-sm">
                إسناد مهمة جديدة
              </h3>

              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* TITLE */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1">
                  عنوان المهمة
                </label>
                <input
                  name="title"
                  required
                  placeholder="مثال: مراجعة طلبات العملاء"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1">
                  التفاصيل
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="اكتب تفاصيل المهمة..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition"
                />
              </div>

              {/* ASSIGNED */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1">
                  إسناد إلى
                </label>
                <select
                  name="assignedToId"
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">اختر الموظف...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} - {emp.department?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DATE */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1">
                  تاريخ التسليم
                </label>

                <div className="relative">
                  <input
                    type="date"
                    name="dueDate"
                    className="w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <Calendar
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={16}
                  />
                </div>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "حفظ المهمة"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}