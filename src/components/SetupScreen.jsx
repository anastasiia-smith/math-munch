import { useState } from 'react'
import PropTypes from 'prop-types'

const candySprites = Object.entries(
  import.meta.glob('../assets/swirls/candy_*.png', { eager: true, import: 'default' }),
)
  .sort(([left], [right]) => {
    const leftIndex = Number.parseInt(left.match(/candy_(\d+)\.png$/)?.[1] ?? '0', 10)
    const rightIndex = Number.parseInt(right.match(/candy_(\d+)\.png$/)?.[1] ?? '0', 10)
    return leftIndex - rightIndex
  })
  .map(([, src]) => src)

const CANDY_THEME_OPTIONS = [0, 1, 2]

function SetupScreen({ defaultDifficulty, defaultCandyTheme, onStartGame }) {
  const [difficulty, setDifficulty] = useState(defaultDifficulty)
  const [candyTheme, setCandyTheme] = useState(defaultCandyTheme)

  const handleStart = () => {
    onStartGame({
      nextDifficulty: difficulty,
      nextCandyTheme: candyTheme,
    })
  }

  return (
    <section className="game-card setup-screen">
      <h1>Game Setup</h1>
      <p className="setup-label">Pick difficulty</p>
      <div className="setup-choice-row">
        {['simple', 'normal', 'hard'].map((option) => (
          <button
            key={option}
            type="button"
            className={`setup-choice ${difficulty === option ? 'selected' : ''}`}
            onClick={() => setDifficulty(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <p className="setup-label">Pick candy theme</p>
      <div className="setup-candy-row">
        {CANDY_THEME_OPTIONS.map((theme) => (
          <button
            key={theme}
            type="button"
            className={`setup-candy-choice ${candyTheme === theme ? 'selected' : ''}`}
            onClick={() => setCandyTheme(theme)}
            aria-label={`Candy theme ${theme + 1}`}
          >
            <img src={candySprites[(theme * 4) % candySprites.length]} alt="" aria-hidden="true" />
          </button>
        ))}
      </div>

      <button type="button" className="play-again" onClick={handleStart}>
        Start Game
      </button>
    </section>
  )
}

SetupScreen.propTypes = {
  defaultDifficulty: PropTypes.oneOf(['simple', 'normal', 'hard']).isRequired,
  defaultCandyTheme: PropTypes.number.isRequired,
  onStartGame: PropTypes.func.isRequired,
}

export default SetupScreen
