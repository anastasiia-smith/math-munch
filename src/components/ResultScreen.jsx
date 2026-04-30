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

function ResultScreen({ score, totalQuestions, onPlayAgain }) {
  const candyCount = Math.max(1, score)
  const scoreRatio = totalQuestions > 0 ? score / totalQuestions : 0
  const omNomReaction =
    scoreRatio >= 0.8
      ? reactionSprites[7]
      : scoreRatio >= 0.5
        ? reactionSprites[3]
        : reactionSprites[6]

  return (
    <section className="game-card result-screen">
      <h1>Great Job!</h1>
      <p className="result-text">
        You got <strong>{score}</strong> out of <strong>{totalQuestions}</strong> right!
      </p>

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

      <button className="play-again" onClick={onPlayAgain}>
        Play Again
      </button>
    </section>
  )
}

ResultScreen.propTypes = {
  score: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  onPlayAgain: PropTypes.func.isRequired,
}

export default ResultScreen
