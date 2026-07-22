import { useEffect, useState } from 'react'
import { getPaymentByOrderIdApi } from '../services/payment/payment-api'

type PollStatus = 'checking' | 'paid' | 'failed' | 'timeout'

const MAX_ATTEMPTS = 8
const POLL_INTERVAL_MS = 1500

const FAILED_STATUSES = new Set(['FAILED', 'CANCELLED'])

export function usePollPaymentStatus(orderId: number | null): PollStatus {
  const [status, setStatus] = useState<PollStatus>('checking')

  useEffect(() => {
    if (!orderId) return
    let cancelled = false

    async function poll() {
      for (let attempt = 0; attempt < MAX_ATTEMPTS && !cancelled; attempt++) {
        try {
          const res = await getPaymentByOrderIdApi(orderId as number)
          const paymentStatus = res.data?.status

          if (paymentStatus === 'PAID') {
            if (!cancelled) setStatus('paid')
            return
          }
          if (paymentStatus && FAILED_STATUSES.has(paymentStatus)) {
            if (!cancelled) setStatus('failed')
            return
          }
        } catch {
          // lỗi tạm thời -> thử lại
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
      }
      if (!cancelled) setStatus('timeout')
    }

    void poll()
    return () => {
      cancelled = true
    }
  }, [orderId])

  return status
}
