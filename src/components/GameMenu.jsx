import PropTypes from 'prop-types';
import coinImage from '../assets/img/coin.png';
import omNomImage from '../assets/reactions/reaction_3.png';

function GameMenu({
  isOpen,
  difficulty,
  coins,
  onToggle,
  onDifficultyChange,
  onHintClick,
  hintMessage,
}) {
  const onBackToHub = () => {
    window.location.reload();
  };
  return (
    <>
      <button
        type='button'
        className='menu-trigger'
        aria-label='Open game menu'
        onClick={onToggle}
      >
        ☰
      </button>
      {isOpen ? (
        <div
          className='menu-overlay'
          role='dialog'
          aria-modal='true'
          aria-label='Game menu'
        >
          <button
            type='button'
            className='menu-close'
            onClick={onToggle}
            aria-label='Close game menu'
          >
            ✕
          </button>
          <section className='menu-panel'>
            <button
              type='button'
              className='back-to-hub-button'
              onClick={onBackToHub}
              aria-label='Close game menu'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
              >
                <path d='M19 12H5' />
                <path d='M12 19L5 12L12 5' />
              </svg>
              back to hub
            </button>
            <h2>Game Menu</h2>
            <p className='setup-label'>Difficulty</p>
            <div className='setup-choice-row'>
              {['simple', 'normal', 'hard'].map((option) => (
                <button
                  key={option}
                  type='button'
                  className={`setup-choice ${
                    difficulty === option ? 'selected' : ''
                  }`}
                  onClick={() => onDifficultyChange(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className='menu-coins'>
              <img src={coinImage} alt='' aria-hidden='true' />
              <p>
                Coins: <strong>{coins}</strong>
              </p>
            </div>
            <br />
            <div className='hint-bubble'>
              <img
                src={omNomImage}
                alt='Hint bubble'
                aria-hidden='true'
                className='monster-image'
              />
            </div>
            <button
              type='button'
              className='play-again hint-button'
              onClick={onHintClick}
            >
              Hint (1 coin)
            </button>
            {/* <p className='menu-message'>Costs 1 omnom coin</p> */}
            {hintMessage ? <p className='hint-tooltip'>{hintMessage}</p> : null}
          </section>
        </div>
      ) : null}
    </>
  );
}

GameMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  difficulty: PropTypes.oneOf(['simple', 'normal', 'hard']).isRequired,
  coins: PropTypes.number.isRequired,
  onToggle: PropTypes.func.isRequired,
  onDifficultyChange: PropTypes.func.isRequired,
  onHintClick: PropTypes.func.isRequired,
  hintMessage: PropTypes.string.isRequired,
};

export default GameMenu;
