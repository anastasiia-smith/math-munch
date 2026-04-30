import { useEffect, useMemo, useRef, useState } from 'react'
import Game from './components/Game'

const DAILY_CANDY_STORAGE_PREFIX = 'omnom-candies-'
const CANDY_UPDATE_EVENT = 'omnom-candy-updated'

const candySprites = Object.entries(
  import.meta.glob('./assets/swirls/candy_*.png', { eager: true, import: 'default' }),
)
  .sort(([left], [right]) => {
    const leftIndex = Number.parseInt(left.match(/candy_(\d+)\.png$/)?.[1] ?? '0', 10)
    const rightIndex = Number.parseInt(right.match(/candy_(\d+)\.png$/)?.[1] ?? '0', 10)
    return leftIndex - rightIndex
  })
  .map(([, src]) => src)

const getTodayStorageKey = () => {
  const today = new Date().toISOString().slice(0, 10)
  return `${DAILY_CANDY_STORAGE_PREFIX}${today}`
}

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [todayCandyTotal, setTodayCandyTotal] = useState(0)
  const popoverRef = useRef(null)
  const buttonRef = useRef(null)

  const refreshTodayCandyTotal = () => {
    const key = getTodayStorageKey()
    const rawValue = window.localStorage.getItem(key) ?? '0'
    const parsedValue = Number.parseInt(rawValue, 10)
    setTodayCandyTotal(Number.isNaN(parsedValue) ? 0 : parsedValue)
  }

  useEffect(() => {
    refreshTodayCandyTotal()

    const handleCandyUpdate = () => refreshTodayCandyTotal()
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshTodayCandyTotal()
      }
    }

    window.addEventListener(CANDY_UPDATE_EVENT, handleCandyUpdate)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener(CANDY_UPDATE_EVENT, handleCandyUpdate)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!isOpen) {
        return
      }
      const target = event.target
      if (
        popoverRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return
      }
      setIsOpen(false)
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const candyPreviewCount = useMemo(() => Math.min(todayCandyTotal, 12), [todayCandyTotal])

  return (
    <main className="app-shell">
      <Game />
      <div className="candy-bank-floating">
        <button
          ref={buttonRef}
          type="button"
          className="candy-bank-button"
          aria-label="Open candy bank for today's total"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls="daily-candy-popover"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <img src={candySprites[0]} alt="" aria-hidden="true" />
          <span>Candy Bank</span>
        </button>
        {isOpen ? (
          <section
            id="daily-candy-popover"
            role="dialog"
            aria-label="Candies Om Nom ate today"
            className="candy-bank-popover"
            ref={popoverRef}
          >
            <p className="candy-bank-title">Today&apos;s Candy Count</p>
            <p className="candy-bank-total">Om Nom ate {todayCandyTotal} candies today.</p>
            <div className="candy-bank-images" aria-label="Candy visual count">
              {Array.from({ length: candyPreviewCount }, (_, index) => (
                <img
                  key={`daily-candy-${index}`}
                  src={candySprites[index % candySprites.length]}
                  alt=""
                  aria-hidden="true"
                />
              ))}
            </div>
            {todayCandyTotal > candyPreviewCount ? (
              <p className="candy-bank-more">+{todayCandyTotal - candyPreviewCount} more</p>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  )
}

export default App
