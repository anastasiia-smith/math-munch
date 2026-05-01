import PropTypes from 'prop-types'
import omNomImage from '../assets/reactions/reaction_0.png'

function StartScreen({ onPlay }) {
  return (
    <section className="game-card start-screen">
      <div className="start-bubble">
        <img src={omNomImage} alt="Om Nom in a bubble" />
      </div>
      <h1>Om Nom Math Munch</h1>
      <p className="result-text">Ready for a sweet math adventure?</p>
      <button type="button" className="play-again" onClick={onPlay}>
        Play
      </button>
    </section>
  )
}

StartScreen.propTypes = {
  onPlay: PropTypes.func.isRequired,
}

export default StartScreen
