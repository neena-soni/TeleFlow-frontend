export interface TrendPoint {
  month: string
  successful: number
  failed: number
  rollbacks: number
}

export const serviceMix = [
  { name: '5G Mobile (Ultra & Basic)', share: 58.4, tickets: 12480, color: '#3b82f6' },
  { name: 'Fiber Broadband (300 & 100 Mbps)', share: 41.6, tickets: 8890, color: '#10b981' },
]

export const circleMix = [
  { circle: 'Maharashtra', flag: 'MH', pct: 28.5, orders: 5840 },
  { circle: 'Delhi NCR', flag: 'DL', pct: 24.2, orders: 4960 },
  { circle: 'Karnataka', flag: 'KA', pct: 21.3, orders: 4360 },
  { circle: 'Tamil Nadu', flag: 'TN', pct: 15.1, orders: 3090 },
  { circle: 'Other Circles', flag: 'IN', pct: 10.9, orders: 2230 },
]

export const retryBuckets = [
  { attempt: 'Attempt 1 (Immediate)', count: 18240 },
  { attempt: 'Attempt 2 (Transient Backoff)', count: 1120 },
  { attempt: 'Attempt 3 (Final Retry)', count: 210 },
  { attempt: 'Rollback Compensated', count: 94 },
]

export const rollbackTrend = [
  { week: 'W1', count: 14 },
  { week: 'W2', count: 18 },
  { week: 'W3', count: 9 },
  { week: 'W4', count: 21 },
  { week: 'W5', count: 12 },
  { week: 'W6', count: 16 },
  { week: 'W7', count: 8 },
  { week: 'W8', count: 11 },
]

export const seedTrends: TrendPoint[] = [
  { month: 'JAN', successful: 1420, failed: 42, rollbacks: 18 },
  { month: 'FEB', successful: 1580, failed: 38, rollbacks: 14 },
  { month: 'MAR', successful: 1710, failed: 45, rollbacks: 19 },
  { month: 'APR', successful: 1690, failed: 51, rollbacks: 22 },
  { month: 'MAY', successful: 1840, failed: 32, rollbacks: 12 },
  { month: 'JUN', successful: 1960, failed: 29, rollbacks: 11 },
  { month: 'JUL', successful: 2100, failed: 34, rollbacks: 15 },
  { month: 'AUG', successful: 2240, failed: 28, rollbacks: 9 },
]
