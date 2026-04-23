export type AnyRecord = Record<string, unknown>

export type ApiListResult<T> = {
  items: T[]
  total: number
}
