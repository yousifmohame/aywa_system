import RefundClient from './RefundClient'
import { notFound } from 'next/navigation'

type Props = {
  params: { system: string }
}

export default async function RefundPage({ params }: Props) {
  const { system } = await params

  if (system !== 'aywa-nazeel' && system !== 'sabl') {
    notFound()
  }

  const systemName = system === 'aywa-nazeel' ? 'إيوا نزيل' : 'شركة الشحن سبل (استرداد)'

  return <RefundClient system={system} systemName={systemName} />
}