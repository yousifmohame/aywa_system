import { getComplaintByIdAction } from '@/app/actions/complaints'
import { redirect } from 'next/navigation'
import ComplaintDetailsView from './ComplaintDetailsView' // سننشئه في الخطوة التالية

type Props = {
  params: { id: string }
}

export default async function ComplaintDetailsPage({ params }: Props) {
  // 1. جلب الـ ID من الرابط (Next.js 13+)
  // ملاحظة: في النسخ الحديثة جداً قد تحتاج لـ await params
  const { id } = await params 

  // 2. جلب البيانات من السيرفر
  const res = await getComplaintByIdAction(id)

  if (res.error || !res.data) {
    return (
      <div className="p-8 text-center text-red-500">
        عذراً، لم يتم العثور على الشكوى المطلوبة.
      </div>
    )
  }

  // 3. عرض المكون التفاعلي
  return <ComplaintDetailsView complaint={res.data} />
}