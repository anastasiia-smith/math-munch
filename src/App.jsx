import { useEffect, useMemo, useRef, useState } from 'react';
import StartScreen from './components/StartScreen';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import { CANDY_UPDATE_EVENT, getTodayStorageKey } from './utils/candyBank';

const candySprites = Object.entries(
  import.meta.glob('./assets/swirls/candy_*.png', {
    eager: true,
    import: 'default',
  })
)
  .sort(([left], [right]) => {
    const leftIndex = Number.parseInt(
      left.match(/candy_(\d+)\.png$/)?.[1] ?? '0',
      10
    );
    const rightIndex = Number.parseInt(
      right.match(/candy_(\d+)\.png$/)?.[1] ?? '0',
      10
    );
    return leftIndex - rightIndex;
  })
  .map(([, src]) => src);

const SCREENS = {
  start: 'start',
  setup: 'setup',
  game: 'game',
  result: 'result',
};

const TOTAL_QUESTIONS = 5;

function App() {
  const [screen, setScreen] = useState(SCREENS.start);
  const [difficulty, setDifficulty] = useState('normal');
  const [coins, setCoins] = useState(0);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedCandyTheme, setSelectedCandyTheme] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [lastRunEarnedCoin, setLastRunEarnedCoin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [todayCandyTotal, setTodayCandyTotal] = useState(0);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  const refreshTodayCandyTotal = () => {
    const key = getTodayStorageKey();
    const rawValue = window.localStorage.getItem(key) ?? '0';
    const parsedValue = Number.parseInt(rawValue, 10);
    setTodayCandyTotal(Number.isNaN(parsedValue) ? 0 : parsedValue);
  };

  useEffect(() => {
    refreshTodayCandyTotal();

    const handleCandyUpdate = () => refreshTodayCandyTotal();
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshTodayCandyTotal();
      }
    };

    window.addEventListener(CANDY_UPDATE_EVENT, handleCandyUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener(CANDY_UPDATE_EVENT, handleCandyUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!isOpen) {
        return;
      }
      const target = event.target;
      if (
        popoverRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const candyPreviewCount = useMemo(
    () => Math.min(todayCandyTotal, 12),
    [todayCandyTotal]
  );

  const startFreshGame = () => {
    setScore(0);
    setCurrentQuestion(1);
    setWrongAnswers([]);
    setLastRunEarnedCoin(false);
    setScreen(SCREENS.game);
  };

  const handleSetupStart = ({ nextDifficulty, nextCandyTheme }) => {
    setDifficulty(nextDifficulty);
    setSelectedCandyTheme(nextCandyTheme);
    startFreshGame();
  };

  const handleGameFinish = ({ finalScore, finalWrongAnswers, earnedCoin }) => {
    setScore(finalScore);
    setWrongAnswers(finalWrongAnswers);
    setLastRunEarnedCoin(earnedCoin);
    if (earnedCoin) {
      if (difficulty === 'simple') {
        setCoins((prev) => prev + 1);
      } else if (difficulty === 'normal') {
        setCoins((prev) => prev + 2);
      } else {
        setCoins((prev) => prev + 3);
      }
    }
    setScreen(SCREENS.result);
  };

  const handleDifficultyChange = (nextDifficulty) => {
    setDifficulty(nextDifficulty);
    setScore(0);
    setCurrentQuestion(1);
  };

  const renderScreen = () => {
    if (screen === SCREENS.start) {
      return <StartScreen onPlay={() => setScreen(SCREENS.setup)} />;
    }

    if (screen === SCREENS.setup) {
      return (
        <SetupScreen
          defaultDifficulty={difficulty}
          defaultCandyTheme={selectedCandyTheme}
          onStartGame={handleSetupStart}
        />
      );
    }

    if (screen === SCREENS.game) {
      return (
        <GameScreen
          difficulty={difficulty}
          coins={coins}
          score={score}
          currentQuestion={currentQuestion}
          totalQuestions={TOTAL_QUESTIONS}
          selectedCandyTheme={selectedCandyTheme}
          onScoreChange={setScore}
          onQuestionChange={setCurrentQuestion}
          onCoinsChange={setCoins}
          onDifficultyChange={handleDifficultyChange}
          onFinish={handleGameFinish}
        />
      );
    }

    return (
      <ResultScreen
        score={score}
        totalQuestions={TOTAL_QUESTIONS}
        wrongAnswers={wrongAnswers}
        earnedCoin={lastRunEarnedCoin}
        onPlayAgain={startFreshGame}
        difficulty={difficulty}
      />
    );
  };

  return (
    <main className='app-shell'>
      {renderScreen()}
      <div className='candy-bank-floating'>
        <button
          ref={buttonRef}
          type='button'
          className='candy-bank-button'
          aria-label="Open candy bank for today's total"
          aria-haspopup='dialog'
          aria-expanded={isOpen}
          aria-controls='daily-candy-popover'
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <img src={candySprites[0]} alt='' aria-hidden='true' />
          <span>Candy Bank</span>
        </button>
        {isOpen ? (
          <section
            id='daily-candy-popover'
            role='dialog'
            aria-label='Candies Om Nom ate today'
            className='candy-bank-popover'
            ref={popoverRef}
          >
            <p className='candy-bank-title'>Today&apos;s Candy Count</p>
            <p className='candy-bank-total'>
              Om Nom ate {todayCandyTotal} candies today.
            </p>
            <div className='candy-bank-images' aria-label='Candy visual count'>
              {Array.from({ length: candyPreviewCount }, (_, index) => (
                <img
                  key={`daily-candy-${index}`}
                  src={candySprites[index % candySprites.length]}
                  alt=''
                  aria-hidden='true'
                />
              ))}
            </div>
            {todayCandyTotal > candyPreviewCount ? (
              <p className='candy-bank-more'>
                +{todayCandyTotal - candyPreviewCount} more
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}

export default App;
