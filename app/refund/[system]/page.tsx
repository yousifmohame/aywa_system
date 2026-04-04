import RefundClient from './RefundClient'
import { notFound } from 'next/navigation'

type Props = {
  params: { system: string }
}

export default async function RefundPage({ params }: Props) {
  const { system } = await params

  // تمت إضافة nazeel-sabl
  if (system !== 'aywa-nazeel' && system !== 'sabl' && system !== 'nazeel-store' && system !== 'nazeel-sabl') {
    notFound()
  }

  // تحديد الاسم
  const systemName = 
    system === 'aywa-nazeel' ? 'إيوا نزيل' : 
    system === 'sabl' ? 'شركة الشحن سبل (إيوا نزيل)' : 
    system === 'nazeel-store' ? 'نزيل ستور' :
    'شركة الشحن سبل (نزيل ستور)'; // 👈 الاسم الجديد

  return <RefundClient system={system as any} systemName={systemName} />
}