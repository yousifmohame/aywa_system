import FeedbackClient from './FeedbackClient'
import { notFound } from 'next/navigation'

type Props = {
  params: { system: string }
}

export default async function FeedbackPage({ params }: Props) {
  const { system } = await params

  // حماية الرابط لكي لا يعمل إلا مع هذين النظامين
  if (system !== 'aywa-nazeel' && system !== 'nazeel-store') {
    notFound()
  }

  const systemName = system === 'aywa-nazeel' ? 'إيوا نزيل' : 'نزيل ستور'

  return <FeedbackClient system={system} systemName={systemName} />
}