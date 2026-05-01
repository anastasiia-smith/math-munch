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

const reactionSprites = Object.entries(
  import.meta.glob('../assets/reactions/reaction_*.png', { eager: true, import: 'default' }),
)
  .sort(([left], [right]) => {
    const leftIndex = Number.parseInt(left.match(/reaction_(\d+)\.png$/)?.[1] ?? '0', 10)
    const rightIndex = Number.parseInt(right.match(/reaction_(\d+)\.png$/)?.[1] ?? '0', 10)
    return leftIndex - rightIndex
  })
  .map(([, src]) => src)

function ResultScreen({ score, totalQuestions, wrongAnswers, earnedCoin, onPlayAgain }) {
  const candyCount = Math.max(1, score)
  const omNomReaction = reactionSprites[7]

  return (
    <section className="game-card result-screen">
      <h1>Great Job!</h1>
      <p className="result-text">
        You got <strong>{score}</strong> out of <strong>{totalQuestions}</strong> right!
      </p>
      {earnedCoin ? (
        <p className="perfect-note">Perfect 5/5! You earned +1 Om Nom coin.</p>
      ) : (
        <p className="result-text small-note">Keep going to collect more coins!</p>
      )}

      <div className="reward-row" aria-label="om nom reaction">
        {omNomReaction ? <img className="result-omnom" src={omNomReaction} alt="Om Nom reaction" /> : null}
      </div>

      <div className="reward-row" aria-label="candies earned">
        {Array.from({ length: candyCount }, (_, index) => (
          <img
            className="reward-candy"
            key={`candy-${index}`}
            src={candySprites[index % candySprites.length]}
            alt=""
            aria-hidden="true"
          />
        ))}
      </div>

      {wrongAnswers.length > 0 ? (
        <section className="review-box" aria-label="missed questions review">
          <h2>Let&apos;s learn these:</h2>
          <ul className="review-list">
            {wrongAnswers.map((item, index) => (
              <li key={`${item.first}-${item.operation}-${item.second}-${index}`}>
                {item.first} {item.operation} {item.second} = {item.correctAnswer}
                <span className="review-note"> (you answered {item.selectedAnswer})</span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="perfect-note">Perfect run! You nailed every answer.</p>
      )}

      <button className="play-again" onClick={onPlayAgain}>
        Play Again
      </button>
    </section>
  )
}

ResultScreen.propTypes = {
  score: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  wrongAnswers: PropTypes.arrayOf(
    PropTypes.shape({
      first: PropTypes.number.isRequired,
      second: PropTypes.number.isRequired,
      operation: PropTypes.oneOf(['+', '-']).isRequired,
      selectedAnswer: PropTypes.number.isRequired,
      correctAnswer: PropTypes.number.isRequired,
    })
  ).isRequired,
  earnedCoin: PropTypes.bool.isRequired,
  onPlayAgain: PropTypes.func.isRequired,
}

export default ResultScreen
