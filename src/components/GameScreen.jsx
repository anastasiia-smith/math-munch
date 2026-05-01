import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import QuestionCard from './QuestionCard';
import ScoreBoard from './ScoreBoard';
import GameMenu from './GameMenu';
import monsterImage from '../assets/reactions/reaction_0.png';
import coinImage from '../assets/img/coin.png';
import { addCandiesToDailyTotal } from '../utils/candyBank';

let audioContext;

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = (items) => {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

const getDifficultyConfig = (difficulty) => {
  if (difficulty === 'simple') {
    return { max: 10, operations: ['+'] };
  }

  if (difficulty === 'hard') {
    return { max: 20, operations: ['+', '-'] };
  }

  return { max: 10, operations: ['+', '-'] };
};

const createQuestion = (difficulty) => {
  const config = getDifficultyConfig(difficulty);
  const operation =
    config.operations[randomInt(0, config.operations.length - 1)];
  const max = config.max;

  if (operation === '+') {
    const first = randomInt(0, max);
    const second = randomInt(0, max - first);
    return { first, second, operation, answer: first + second };
  }

  const first = randomInt(0, max);
  const second = randomInt(0, first);
  return { first, second, operation, answer: first - second };
};

const createAnswerOptions = (correctAnswer) => {
  const optionSet = new Set([correctAnswer]);

  while (optionSet.size < 3) {
    const distance = randomInt(1, 5);
    const direction = Math.random() < 0.5 ? -1 : 1;
    const candidate = Math.max(
      0,
      Math.min(20, correctAnswer + distance * direction)
    );
    optionSet.add(candidate);
  }

  return shuffle([...optionSet]);
};

const getAudioContext = () => {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
};

const playTone = (
  context,
  frequency,
  duration,
  type = 'sine',
  volume = 0.04,
  delay = 0
) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startTime = context.currentTime + delay;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

const playSound = (kind) => {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  if (kind === 'correct') {
    playTone(context, 523, 0.12, 'triangle', 0.05);
    playTone(context, 659, 0.14, 'triangle', 0.05, 0.08);
    return;
  }

  if (kind === 'wrong') {
    playTone(context, 280, 0.15, 'sawtooth', 0.04);
    playTone(context, 210, 0.18, 'sawtooth', 0.03, 0.09);
    return;
  }

  if (kind === 'finish') {
    playTone(context, 523, 0.1, 'triangle', 0.05);
    playTone(context, 659, 0.1, 'triangle', 0.05, 0.08);
    playTone(context, 784, 0.18, 'triangle', 0.05, 0.16);
  }
};

function GameScreen({
  difficulty,
  coins,
  score,
  currentQuestion,
  totalQuestions,
  selectedCandyTheme,
  onScoreChange,
  onQuestionChange,
  onCoinsChange,
  onDifficultyChange,
  onFinish,
}) {
  const [question, setQuestion] = useState(() => createQuestion(difficulty));
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('neutral');
  const [isLocked, setIsLocked] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [showHintFor, setShowHintFor] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMessage, setMenuMessage] = useState('');

  useEffect(() => {
    setAnswers(createAnswerOptions(question.answer));
  }, [question]);

  const resetRound = () => {
    onScoreChange(0);
    onQuestionChange(1);
    setQuestion(createQuestion(difficulty));
    setAnswers([]);
    setFeedback('');
    setFeedbackType('neutral');
    setIsLocked(false);
    setWrongAnswers([]);
    setShowHintFor(null);
  };

  useEffect(() => {
    resetRound();
    // Resetting when difficulty changes keeps menu behavior predictable for kids.
  }, [difficulty]);

  const handleAnswer = (selectedAnswer) => {
    if (isLocked) {
      return;
    }

    const isCorrect = selectedAnswer === question.answer;
    const nextScore = isCorrect ? score + 1 : score;
    setFeedback(isCorrect ? "Yum! That's right!" : 'Oops! Try again!');
    setFeedbackType(isCorrect ? 'correct' : 'wrong');
    setIsLocked(true);
    playSound(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      onScoreChange(nextScore);
    } else {
      setWrongAnswers((prev) => [
        ...prev,
        {
          first: question.first,
          second: question.second,
          operation: question.operation,
          selectedAnswer,
          correctAnswer: question.answer,
        },
      ]);
    }

    window.setTimeout(() => {
      if (currentQuestion >= totalQuestions) {
        const finalWrongAnswers = isCorrect
          ? wrongAnswers
          : [
              ...wrongAnswers,
              {
                first: question.first,
                second: question.second,
                operation: question.operation,
                selectedAnswer,
                correctAnswer: question.answer,
              },
            ];
        const earnedCoin = nextScore === totalQuestions;
        playSound('finish');
        addCandiesToDailyTotal(nextScore);
        onFinish({
          finalScore: nextScore,
          finalWrongAnswers,
          earnedCoin,
        });
        return;
      }

      onQuestionChange(currentQuestion + 1);
      setQuestion(createQuestion(difficulty));
      setFeedback('');
      setFeedbackType('neutral');
      setIsLocked(false);
      setShowHintFor(null);
    }, 900);
  };

  const handleHint = () => {
    if (coins <= 0) {
      setMenuMessage('No coins left');
      return;
    }

    onCoinsChange(coins - 1);
    setShowHintFor(question.answer);
    setMenuMessage('Hint is active!');
  };

  const handleMenuDifficultyChange = (nextDifficulty) => {
    setMenuMessage('');
    onDifficultyChange(nextDifficulty);
  };

  return (
    <section className='game-card'>
      <GameMenu
        isOpen={menuOpen}
        difficulty={difficulty}
        coins={coins}
        onToggle={() => {
          setMenuOpen((prev) => !prev);
          setMenuMessage('');
        }}
        onDifficultyChange={handleMenuDifficultyChange}
        onHintClick={handleHint}
        hintMessage={menuMessage}
      />

      <header className='game-header'>
        <img
          className='monster-image'
          src={monsterImage}
          alt='Cute green candy monster'
        />
        <h1>Om Nom Math Munch</h1>
      </header>

      <div className='coins-inline'>
        <img src={coinImage} alt='' aria-hidden='true' />
        <p>{coins}</p>
      </div>

      <ScoreBoard
        score={score}
        questionNumber={currentQuestion}
        totalQuestions={totalQuestions}
      />

      <QuestionCard
        question={question}
        answers={answers}
        onAnswer={handleAnswer}
        feedback={feedback}
        feedbackType={feedbackType}
        isLocked={isLocked}
        highlightedAnswer={showHintFor}
        selectedCandyTheme={selectedCandyTheme}
      />
    </section>
  );
}

GameScreen.propTypes = {
  difficulty: PropTypes.oneOf(['simple', 'normal', 'hard']).isRequired,
  coins: PropTypes.number.isRequired,
  score: PropTypes.number.isRequired,
  currentQuestion: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  selectedCandyTheme: PropTypes.number.isRequired,
  onScoreChange: PropTypes.func.isRequired,
  onQuestionChange: PropTypes.func.isRequired,
  onCoinsChange: PropTypes.func.isRequired,
  onDifficultyChange: PropTypes.func.isRequired,
  onFinish: PropTypes.func.isRequired,
};

export default GameScreen;
