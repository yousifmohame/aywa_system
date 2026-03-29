"use client";

import { useState } from "react";
import { editEmployeeAction } from "@/app/actions/employees";
import {
  X,
  UserCog,
  Loader2,
  Save,
  User,
  Clock,
  MonitorSmartphone,
} from "lucide-react";

export default function EditEmployeeModal({
  employee,
  departments,
}: {
  employee: any;
  departments: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    formData.append("id", employee.id);

    const result = await editEmployeeAction(formData);

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
    }
  }

  const systems = [
    { id: "aywa_nazeel", name: "إيوا نزيل" },
    { id: "nazeel_store", name: "نزيل ستور" },
    { id: "prison_nazeel", name: "نزيل السجن" },
    { id: "liniora", name: "لينيورا" },
  ];

  const currentSystems = employee.allowedSystems
    ? employee.allowedSystems.split(",")
    : [];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
        title="تعديل"
      >
        <UserCog size={16} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-[Tajawal]"
          dir="rtl"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">

            {/* HEADER */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-semibold text-gray-900 text-sm">
                تعديل بيانات{" "}
                <span className="text-blue-600">{employee.fullName}</span>
              </h3>

              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* ERROR */}
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg text-center font-semibold border border-red-100">
                  {error}
                </div>
              )}

              {/* NAME */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1">
                  الاسم الكامل
                </label>
                <input
                  name="fullName"
                  defaultValue={employee.fullName}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1">
                  معرف الدخول
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="email"
                    defaultValue={employee.email || employee.username}
                    required
                    className="w-full px-3 py-2.5 pl-9 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    dir="ltr"
                  />
                  <User
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={16}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1">
                  كلمة المرور
                </label>
                <input
                  type="text"
                  name="password"
                  placeholder="اتركها فارغة للإبقاء على القديمة"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  dir="ltr"
                />
              </div>

              {/* DEPARTMENT + ROLE */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    القسم
                  </label>
                  <select
                    name="departmentId"
                    defaultValue={employee.departmentId || ""}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">اختر القسم...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    الدور
                  </label>
                  <select
                    name="role"
                    defaultValue={employee.role}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="EMPLOYEE">موظف</option>
                    <option value="SUPERVISOR">مشرف</option>
                  </select>
                </div>
              </div>

              {/* SYSTEMS */}
              <div className="border-t border-dashed border-gray-200 pt-4">
                <h4 className="text-xs font-semibold text-blue-700 mb-3 flex items-center gap-1">
                  <MonitorSmartphone size={14} /> صلاحيات الأنظمة
                </h4>

                <div className="grid grid-cols-2 gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  {systems.map((sys) => (
                    <label
                      key={sys.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name="allowedSystems"
                        value={sys.id}
                        defaultChecked={currentSystems.includes(sys.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-xs font-semibold text-gray-700">
                        {sys.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* TIME */}
              <div className="border-t border-dashed border-gray-200 pt-4">
                <h4 className="text-xs font-semibold text-blue-700 mb-3 flex items-center gap-1">
                  <Clock size={14} /> مواعيد العمل
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="time"
                    name="customStartTime"
                    defaultValue={employee.customStartTime || ""}
                    className="w-full px-2 py-2 text-blue-700 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="time"
                    name="customEndTime"
                    defaultValue={employee.customEndTime || ""}
                    className="w-full px-2 py-2 text-blue-700 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* ACTIVE */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <input
                  type="checkbox"
                  name="isActive"
                  id={`isActive-${employee.id}`}
                  defaultChecked={employee.isActive}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={`isActive-${employee.id}`}
                  className="text-sm text-gray-700 font-semibold"
                >
                  الحساب مفعل
                </label>
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
                  <>
                    <Save size={16} /> حفظ التعديلات
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}