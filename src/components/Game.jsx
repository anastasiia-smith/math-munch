import { useEffect, useState } from 'react';
import QuestionCard from './QuestionCard';
import ScoreBoard from './ScoreBoard';
import ResultScreen from './ResultScreen';
import monsterImage from '../assets/reactions/reaction_0.png';

const TOTAL_QUESTIONS = 5;
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

const createQuestion = () => {
  const operation = Math.random() < 0.5 ? '+' : '-';

  if (operation === '+') {
    const first = randomInt(0, 19);
    const second = randomInt(0, 19 - first);
    const answer = first + second;

    return {
      first,
      second,
      operation,
      answer,
    };
  }

  const first = randomInt(0, 19);
  const second = randomInt(0, first);
  const answer = first - second;

  return {
    first,
    second,
    operation,
    answer,
  };
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

function Game() {
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(() =>
    createQuestion()
  );
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('neutral');
  const [isLocked, setIsLocked] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  useEffect(() => {
    setAnswers(createAnswerOptions(currentQuestion.answer));
  }, [currentQuestion]);

  const loadNextQuestion = () => {
    if (questionNumber >= TOTAL_QUESTIONS) {
      setIsComplete(true);
      return;
    }

    setQuestionNumber((prev) => prev + 1);
    setCurrentQuestion(createQuestion());
    setFeedback('');
    setFeedbackType('neutral');
    setIsLocked(false);
  };

  const handleAnswer = (selectedAnswer) => {
    if (isLocked) {
      return;
    }

    const isCorrect = selectedAnswer === currentQuestion.answer;

    setFeedback(isCorrect ? "Yum! That's right!" : 'Oops! Try again!');
    setFeedbackType(isCorrect ? 'correct' : 'wrong');
    setIsLocked(true);
    playSound(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setWrongAnswers((prev) => [
        ...prev,
        {
          first: currentQuestion.first,
          second: currentQuestion.second,
          operation: currentQuestion.operation,
          selectedAnswer,
          correctAnswer: currentQuestion.answer,
        },
      ]);
    }

    if (questionNumber >= TOTAL_QUESTIONS) {
      playSound('finish');
    }

    window.setTimeout(loadNextQuestion, 900);
  };

  const handleRestart = () => {
    setQuestionNumber(1);
    setScore(0);
    setCurrentQuestion(createQuestion());
    setAnswers([]);
    setFeedback('');
    setFeedbackType('neutral');
    setIsLocked(false);
    setIsComplete(false);
    setWrongAnswers([]);
  };

  if (isComplete) {
    return (
      <ResultScreen
        score={score}
        totalQuestions={TOTAL_QUESTIONS}
        wrongAnswers={wrongAnswers}
        onPlayAgain={handleRestart}
      />
    );
  }

  return (
    <section className='game-card'>
      <header className='game-header'>
        <img
          className='monster-image'
          src={monsterImage}
          alt='Cute green candy monster'
        />
        <h1>Om Nom Math Munch</h1>
      </header>

      <ScoreBoard
        score={score}
        questionNumber={questionNumber}
        totalQuestions={TOTAL_QUESTIONS}
      />

      <QuestionCard
        question={currentQuestion}
        answers={answers}
        onAnswer={handleAnswer}
        feedback={feedback}
        feedbackType={feedbackType}
        isLocked={isLocked}
      />
    </section>
  );
}

export default Game;
