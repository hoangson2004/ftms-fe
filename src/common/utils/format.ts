export function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDateTime(value: unknown) {
  if (!value) {
    return '-'
  }

  const parsed = new Date(String(value))

  if (Number.isNaN(parsed.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed)
}

export function truncateText(value: unknown, maxLength = 24) {
  const normalized = typeof value === 'string' ? value : String(value ?? '')

  if (!normalized) {
    return '-'
  }

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength)}...`
}
