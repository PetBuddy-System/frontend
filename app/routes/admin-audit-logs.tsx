// routes/admin-audit-logs.tsx
import { AdminAuditPage } from '~/features/admin'

import type { Route } from './+types/admin-audit-logs'

export function meta({ }: Route.MetaArgs) {
    return [{ title: 'Audit Logs' }]
}

export default function AdminAuditLogs() {
    return <AdminAuditPage />
}