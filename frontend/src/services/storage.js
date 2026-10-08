const STORAGE_PREFIX = 'edumind:'

export const storage = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
      if (value === null) return fallback
      return JSON.parse(value)
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value))
    } catch (error) {
      console.warn('Could not save to localStorage', error)
    }
  },
  remove(key) {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
  }
}
