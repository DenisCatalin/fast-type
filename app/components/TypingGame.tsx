'use client';

import { useState, useEffect, useRef } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';
type GameMode = 'time' | 'words' | 'zen';

interface GameConfig {
  timeLimit: number;
  wordLength: number;
  wordCount: number;
  words: string[];
}

const DIFFICULTY_SETTINGS: Record<Difficulty, GameConfig> = {
  easy: {
    timeLimit: 15,
    wordLength: 5,
    wordCount: 100,
    words: [],
  },
  medium: {
    timeLimit: 10,
    wordLength: 8,
    wordCount: 100,
    words: [],
  },
  hard: {
    timeLimit: 5,
    wordLength: 12,
    wordCount: 100,
    words: [],
  },
};

async function fetchRandomWords(length: number, count: number): Promise<string[]> {
  try {
    const response = await fetch(
      `https://random-word-api.herokuapp.com/word?length=${length}&number=${count}`
    );
    if (!response.ok) throw new Error('Failed to fetch words');
    return await response.json();
  } catch (error) {
    console.error('Error fetching words:', error);
    return ['error', 'loading', 'retry', 'please', 'wait'];
  }
}

const TypingGame = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const [highScore, setHighScore] = useState<Record<Difficulty, number>>({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [totalWordsTyped, setTotalWordsTyped] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [nextWord, setNextWord] = useState('');
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const correctSound = useRef<HTMLAudioElement | null>(null);
  const wrongSound = useRef<HTMLAudioElement | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('time');
  const [showSuccess, setShowSuccess] = useState(false);
  const [wordsLeft, setWordsLeft] = useState(10);

  useEffect(() => {
    const loadWords = async () => {
      setIsLoading(true);
      const config = DIFFICULTY_SETTINGS[difficulty];
      const newWords = await fetchRandomWords(config.wordLength, config.wordCount);
      DIFFICULTY_SETTINGS[difficulty].words = newWords;
      setIsLoading(false);
    };

    loadWords();
  }, [difficulty]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    correctSound.current = new Audio('/correct.mp3');
    wrongSound.current = new Audio('/wrong.mp3');
  }, []);

  const getRandomWord = () => {
    const words = DIFFICULTY_SETTINGS[difficulty].words;
    if (words.length === 0) return '';
    const word = nextWord || words[Math.floor(Math.random() * words.length)];
    setNextWord(words[Math.floor(Math.random() * words.length)]);
    return word;
  };

  const startGame = () => {
    if (DIFFICULTY_SETTINGS[difficulty].words.length === 0) {
      return;
    }
    setScore(0);
    setUserInput('');
    setIsPlaying(true);
    
    switch (gameMode) {
      case 'time':
        setTimeLeft(DIFFICULTY_SETTINGS[difficulty].timeLimit);
        break;
      case 'words':
        setWordsLeft(10);
        setTimeLeft(999);
        break;
      case 'zen':
        setTimeLeft(999);
        break;
    }
    setCurrentWord(getRandomWord());
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isPlaying]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);

    if (value === currentWord) {
      if (correctSound.current && isSoundEnabled) {
        correctSound.current.play();
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 500);
      setScore((prev) => prev + 1);
      setTotalWordsTyped((prev) => prev + 1);
      setCurrentWord(getRandomWord());
      setUserInput('');
      
      switch (gameMode) {
        case 'time':
          setTimeLeft(DIFFICULTY_SETTINGS[difficulty].timeLimit);
          break;
        case 'words':
          setWordsLeft((prev) => {
            const newWordsLeft = prev - 1;
            if (newWordsLeft === 0) {
              setIsPlaying(false);
            }
            return newWordsLeft;
          });
          break;
      }
      
      setHighScore(prev => ({
        ...prev,
        [difficulty]: Math.max(prev[difficulty], score + 1)
      }));
    } else if (value.length > currentWord.length || !currentWord.startsWith(value)) {
      if (wrongSound.current && isSoundEnabled) {
        wrongSound.current.play();
      }
      setWrongAttempts(prev => prev + 1);
      setAccuracy(Number(((totalWordsTyped * 100) / (totalWordsTyped + wrongAttempts + 1)).toFixed(1)));
    }
  };

  const canStartGame = !isLoading && DIFFICULTY_SETTINGS[difficulty].words.length > 0;

  const difficultyOptions = [
    { value: 'easy', label: 'Easy (15s)', desc: 'Short Words' },
    { value: 'medium', label: 'Medium (10s)', desc: 'Medium Words' },
    { value: 'hard', label: 'Hard (5s)', desc: 'Long Words' },
  ];

  const getWordProgress = (current: string, target: string) => {
    return target.split('').map((char, i) => {
      if (!current[i]) return 'pending';
      return current[i] === char ? 'correct' : 'wrong';
    });
  };

  return (
    <div className="min-w-96 mx-auto p-8 bg-slate-800 rounded-2xl shadow-2xl text-white border border-slate-700/50 backdrop-blur-sm">
      <h2 className="text-3xl font-bold mb-6 text-white text-center bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
        Speed Typer
      </h2>
      
      <div className="mb-6" ref={selectRef}>
        <label className="block mb-2 text-slate-300">Select Difficulty:</label>
        <div className="relative">
          <button
            onClick={() => !isPlaying && setIsSelectOpen(!isSelectOpen)}
            disabled={isPlaying}
            className={`w-full p-4 text-left border rounded-lg bg-slate-700/50 text-white border-slate-600 
              focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200
              ${isPlaying ? 'opacity-50 cursor-not-allowed' : 'hover:border-emerald-500'}
              ${isSelectOpen ? 'border-emerald-500 ring-1 ring-emerald-500' : ''}`}
          >
            <span className="flex items-center justify-between">
              <span>
                {difficultyOptions.find(opt => opt.value === difficulty)?.label}
                <span className="ml-2 text-slate-400 text-sm">
                  {difficultyOptions.find(opt => opt.value === difficulty)?.desc}
                </span>
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${isSelectOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>

          {isSelectOpen && !isPlaying && (
            <div className="absolute w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setDifficulty(option.value as Difficulty);
                    setIsSelectOpen(false);
                  }}
                  className={`w-full p-4 text-left hover:bg-slate-700/50 transition-colors duration-150
                    ${option.value === difficulty ? 'bg-slate-700/50 text-emerald-400' : 'text-white'}
                    ${option.value === difficultyOptions[0].value ? 'rounded-t-lg' : ''}
                    ${option.value === difficultyOptions[difficultyOptions.length - 1].value ? 'rounded-b-lg' : ''}`}
                >
                  <span className="block font-medium">{option.label}</span>
                  <span className="block text-sm text-slate-400">{option.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        {(['time', 'words', 'zen'] as GameMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setGameMode(mode)}
            className={`px-4 py-2 rounded-lg ${
              gameMode === mode
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700/50 text-slate-300'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-8 animate-pulse">
          <div className="inline-block w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-400 mt-4">Loading words...</p>
        </div>
      ) : !isPlaying ? (
        <button
          onClick={startGame}
          disabled={!canStartGame}
          className={`w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] font-medium text-lg shadow-lg shadow-emerald-500/20 ${
            !canStartGame
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:from-emerald-600 hover:to-emerald-700'
          }`}
        >
          {canStartGame ? 'Start Game' : 'Loading words...'}
        </button>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-700/30 p-4 rounded-lg">
            <div className="text-lg">
              <span className="text-slate-400">
                {gameMode === 'time' && 'Time left:'}
                {gameMode === 'words' && 'Words left:'}
                {gameMode === 'zen' && 'Words typed:'}
              </span>
              <span className="ml-2 text-emerald-400 font-bold">
                {gameMode === 'time' && `${timeLeft}s`}
                {gameMode === 'words' && wordsLeft}
                {gameMode === 'zen' && score}
              </span>
            </div>
            <div className="text-lg">
              <span className="text-slate-400">Score:</span>
              <span className="ml-2 text-emerald-400 font-bold">{score}</span>
            </div>
            {gameMode !== 'time' && (
              <button
                onClick={() => setIsPlaying(false)}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Stop Game
              </button>
            )}
          </div>
          
          <div className="text-center p-6 bg-slate-700/30 rounded-lg">
            <p className="text-lg text-slate-300 mb-3">Type this word:</p>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 select-none">
              {currentWord}
            </p>
            <p className="text-sm text-slate-400 mt-2">Next: {nextWord}</p>
          </div>

          <div className="flex justify-center space-x-1 mb-4">
            {currentWord.split('').map((char, i) => (
              <span
                key={i}
                className={`text-2xl font-mono ${
                  !userInput[i]
                    ? 'text-slate-600'
                    : userInput[i] === char
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {char}
              </span>
            ))}
          </div>

          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            className="w-full p-4 border rounded-lg bg-slate-700/50 text-white border-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-lg tracking-wide"
            autoFocus
            placeholder="Type here..."
          />
        </div>
      )}

      {!isPlaying && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          {Object.entries(highScore).map(([diff, score]) => (
            <div key={diff} className="text-center p-4 bg-slate-700/30 rounded-lg">
              <p className="text-slate-400 text-sm capitalize">{diff} Best</p>
              <p className="text-2xl font-bold text-emerald-400">{score}</p>
            </div>
          ))}
        </div>
      )}

      {!isPlaying && score > 0 && (
        <div className="mt-6 text-center p-4 bg-slate-700/30 rounded-lg">
          <p className="text-slate-300">Previous Score</p>
          <p className="text-3xl font-bold text-emerald-400">{score}</p>
        </div>
      )}

      <button
        onClick={() => setIsSoundEnabled(!isSoundEnabled)}
        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-700/50"
      >
        {isSoundEnabled ? '🔊' : '🔇'}
      </button>
    </div>
  );
};

export default TypingGame; 