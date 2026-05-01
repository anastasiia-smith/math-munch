import PropTypes from 'prop-types'
import coinImage from '../assets/img/coin.png'

function GameMenu({
  isOpen,
  difficulty,
  coins,
  onToggle,
  onDifficultyChange,
  onHintClick,
  hintMessage,
}) {
  return (
    <>
      <button type="button" className="menu-trigger" aria-label="Open game menu" onClick={onToggle}>
        ☰
      </button>
      {isOpen ? (
        <div className="menu-overlay" role="dialog" aria-modal="true" aria-label="Game menu">
          <button type="button" className="menu-close" onClick={onToggle} aria-label="Close game menu">
            ✕
          </button>
          <section className="menu-panel">
            <h2>Game Menu</h2>
            <p className="setup-label">Difficulty</p>
            <div className="setup-choice-row">
              {['simple', 'normal', 'hard'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`setup-choice ${difficulty === option ? 'selected' : ''}`}
                  onClick={() => onDifficultyChange(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="menu-coins">
              <img src={coinImage} alt="" aria-hidden="true" />
              <p>
                Coins: <strong>{coins}</strong>
              </p>
            </div>

            <button type="button" className="play-again hint-button" onClick={onHintClick}>
              Hint
            </button>
            <p className="hint-tooltip">Costs 1 omnom coin</p>
            {hintMessage ? <p className="menu-message">{hintMessage}</p> : null}
          </section>
        </div>
      ) : null}
    </>
  )
}

GameMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  difficulty: PropTypes.oneOf(['simple', 'normal', 'hard']).isRequired,
  coins: PropTypes.number.isRequired,
  onToggle: PropTypes.func.isRequired,
  onDifficultyChange: PropTypes.func.isRequired,
  onHintClick: PropTypes.func.isRequired,
  hintMessage: PropTypes.string.isRequired,
}

export default GameMenu
