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

const CORRECT_REACTION_INDEX = 0
const WRONG_REACTION_INDEX = 5

function CandyRow({ count, colorOffset = 0, label }) {
  return (
    <div className="candy-row" aria-label={label}>
      {Array.from({ length: count }, (_, index) => {
        const spriteIndex = (index + colorOffset) % candySprites.length
        const sprite = candySprites[spriteIndex]
        return (
          <img
            className="candy"
            style={{ animationDelay: `${index * 50}ms` }}
            key={`${label}-${index}`}
            src={sprite}
            alt=""
            aria-hidden="true"
          />
        )
      })}
    </div>
  )
}

function QuestionCard({ question, answers, onAnswer, feedback, feedbackType, isLocked }) {
  const reactionImage =
    feedbackType === 'correct'
      ? reactionSprites[CORRECT_REACTION_INDEX]
      : feedbackType === 'wrong'
        ? reactionSprites[WRONG_REACTION_INDEX]
        : null

  return (
    <article className="question-card">
      <h2 className="problem">
        {question.first} {question.operation} {question.second} = ?
      </h2>

      <div className="visual-math">
        <CandyRow count={question.first} label="first number candies" />
        <span className="operator">{question.operation}</span>
        <CandyRow count={question.second} colorOffset={2} label="second number candies" />
      </div>

      <div className="answers-grid">
        {answers.map((answer, index) => (
          <button
            className="answer-button"
            key={`${answer}-${index}`}
            onClick={() => onAnswer(answer)}
            disabled={isLocked}
          >
            {answer}
          </button>
        ))}
      </div>

      <div className={`feedback ${feedbackType}`}>
        {reactionImage ? <img className="reaction" src={reactionImage} alt="" aria-hidden="true" /> : null}
        <p>{feedback || 'Pick the yummiest answer!'}</p>
      </div>
    </article>
  )
}

QuestionCard.propTypes = {
  question: PropTypes.shape({
    first: PropTypes.number.isRequired,
    second: PropTypes.number.isRequired,
    operation: PropTypes.oneOf(['+', '-']).isRequired,
    answer: PropTypes.number.isRequired,
  }).isRequired,
  answers: PropTypes.arrayOf(PropTypes.number).isRequired,
  onAnswer: PropTypes.func.isRequired,
  feedback: PropTypes.string.isRequired,
  feedbackType: PropTypes.oneOf(['neutral', 'correct', 'wrong']).isRequired,
  isLocked: PropTypes.bool.isRequired,
}

CandyRow.propTypes = {
  count: PropTypes.number.isRequired,
  colorOffset: PropTypes.number,
  label: PropTypes.string.isRequired,
}

export default QuestionCard
