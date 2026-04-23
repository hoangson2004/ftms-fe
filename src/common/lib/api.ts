import axiosLib from 'axios'
import type { AnyRecord, ApiListResult } from '@/common/types/api'

export function isRecord(value: unknown): value is AnyRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function getValueByPath(source: unknown, path: string) {
  if (!isRecord(source)) {
    return undefined
  }

  return path
    .split('.')
    .reduce<unknown>((current, segment) => (isRecord(current) ? current[segment] : undefined), source)
}

export function unwrapApiData<T>(payload: unknown): T {
  if (isRecord(payload) && 'data' in payload) {
    return payload.data as T
  }

  return payload as T
}

function extractItems<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[]
  }

  if (!isRecord(payload)) {
    return []
  }

  const collectionKeys = ['items', 'results', 'records', 'rows', 'list', 'content']

  for (const key of collectionKeys) {
    const value = payload[key]

    if (Array.isArray(value)) {
      return value as T[]
    }
  }

  if (Array.isArray(payload.data)) {
    return payload.data as T[]
  }

  const nestedCollections = Object.values(payload).filter(Array.isArray)

  if (nestedCollections.length === 1) {
    return nestedCollections[0] as T[]
  }

  return []
}

function extractTotal(payload: unknown, itemCount: number) {
  if (!isRecord(payload)) {
    return itemCount
  }

  const totalCandidates = [
    payload.total,
    payload.totalItems,
    payload.totalElements,
    payload.count,
    payload.itemCount,
    isRecord(payload.meta) ? payload.meta.total : undefined,
    isRecord(payload.pagination) ? payload.pagination.total : undefined,
    isRecord(payload.page) ? payload.page.total : undefined,
  ]

  for (const candidate of totalCandidates) {
    if (typeof candidate === 'number') {
      return candidate
    }
  }

  return itemCount
}

export function extractListResponse<T>(payload: unknown): ApiListResult<T> {
  const data = unwrapApiData<unknown>(payload)
  const items = extractItems<T>(data)
  const total = extractTotal(data, items.length)

  return {
    items,
    total,
  }
}

export function getErrorMessage(error: unknown) {
  if (axiosLib.isAxiosError(error)) {
    const message = error.response?.data?.message

    if (Array.isArray(message)) {
      return message.join(', ')
    }

    if (typeof message === 'string') {
      return message
    }

    if (typeof error.response?.data?.error === 'string') {
      return error.response.data.error
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Request failed. Please try again.'
}

export function compactObject(input: AnyRecord) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== '' && value !== undefined && value !== null),
  )
}
