const DAILY_CANDY_STORAGE_PREFIX = 'omnom-candies-'
export const CANDY_UPDATE_EVENT = 'omnom-candy-updated'

export const getTodayStorageKey = () => {
  const today = new Date().toISOString().slice(0, 10)
  return `${DAILY_CANDY_STORAGE_PREFIX}${today}`
}

export const addCandiesToDailyTotal = (candiesToAdd) => {
  if (typeof window === 'undefined') {
    return
  }

  const key = getTodayStorageKey()
  const currentValue = Number.parseInt(window.localStorage.getItem(key) ?? '0', 10)
  const safeCurrent = Number.isNaN(currentValue) ? 0 : currentValue
  const nextTotal = safeCurrent + candiesToAdd
  window.localStorage.setItem(key, String(nextTotal))
  window.dispatchEvent(new Event(CANDY_UPDATE_EVENT))
}
