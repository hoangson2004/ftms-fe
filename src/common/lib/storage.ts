export const storage = {
  get<T>(key: string) {
    const rawValue = window.localStorage.getItem(key)

    if (!rawValue) {
      return null
    }

    return JSON.parse(rawValue) as T
  },
  set(key: string, value: unknown) {
    window.localStorage.setItem(key, JSON.stringify(value))
  },
  remove(key: string) {
    window.localStorage.removeItem(key)
  },
}
