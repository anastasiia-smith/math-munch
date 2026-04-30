import PropTypes from 'prop-types'

function ScoreBoard({ score, questionNumber, totalQuestions }) {
  return (
    <div className="scoreboard">
      <p>
        Score: <strong>{score}</strong>
      </p>
      <p>
        Question: <strong>{questionNumber}</strong> / {totalQuestions}
      </p>
    </div>
  )
}

ScoreBoard.propTypes = {
  score: PropTypes.number.isRequired,
  questionNumber: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
}

export default ScoreBoard
