import React from 'react'
import { Badge } from './Badge'
import type { VisitStatus } from '@/types'
import { VISIT_STATUS_LABELS } from '@/types'

const statusVariants: Record<VisitStatus, 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'gray' | 'orange'> = {
  bought: 'green',
  not_bought: 'red',
  will_buy_later: 'yellow',
  no_money: 'gray',
  uses_other_app: 'purple',
  need_manager: 'blue',
  revisit_needed: 'orange',
}

export function VisitStatusBadge({ status }: { status: VisitStatus }) {
  return (
    <Badge variant={statusVariants[status]}>
      {VISIT_STATUS_LABELS[status]}
    </Badge>
  )
}
