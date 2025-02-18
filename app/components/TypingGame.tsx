'use client';

import { useState, useEffect, useRef } from 'react';
import { Achievements } from "./game/Achievements";

type Difficulty = 'easy' | 'medium' | 'hard';
type GameMode = 'time' | 'words' | 'zen';

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

const WORD_LISTS: Record<Difficulty, string[]> = {
  easy: [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
    'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this'
  ],
  medium: [
    'computer', 'program', 'window', 'system', 'network', 'memory',
    'keyboard', 'screen', 'folder', 'software', 'browser', 'desktop',
    'laptop', 'mouse', 'server', 'coding', 'typing', 'learning'
  ],
  hard: [
    'development', 'programming', 'javascript', 'technology', 'application',
    'experience', 'performance', 'professional', 'understanding', 'environment',
    'communication', 'organization', 'requirements', 'opportunity'
  ]
};

function getRandomWords(difficulty: Difficulty): string[] {
  return WORD_LISTS[difficulty];
}

interface Stats {
  totalGamesPlayed: number;
  totalWordsTyped: number;
  averageWpm: number;
  bestWpm: number;
  totalTimePlayed: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  condition: () => boolean;
  unlocked: boolean;
}

interface PlayerScore {
  name: string;
  wpm: number;
  accuracy: number;
  difficulty: Difficulty;
  date: string;
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
  const [wpm, setWpm] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      description: 'Reach 50 WPM',
      condition: () => stats.bestWpm >= 50 || wpm >= 50,
      unlocked: false
    },
    {
      id: 'perfect_10',
      title: 'Perfect 10',
      description: 'Type 10 words with 100% accuracy',
      condition: () => score >= 10 && accuracy === 100,
      unlocked: false
    },
    {
      id: 'marathon',
      title: 'Marathon Runner',
      description: 'Play 10 games',
      condition: () => stats.totalGamesPlayed >= 10,
      unlocked: false
    }
  ]);
  const [stats, setStats] = useState<Stats>({
    totalGamesPlayed: 0,
    totalWordsTyped: 0,
    averageWpm: 0,
    bestWpm: 0,
    totalTimePlayed: 0
  });
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [playerName, setPlayerName] = useState('');
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const loadWords = () => {
      setIsLoading(true);
      try {
        DIFFICULTY_SETTINGS[difficulty].words = getRandomWords(difficulty);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in loadWords:', error);
        setIsLoading(false);
      }
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

  useEffect(() => {
    const savedStats = localStorage.getItem('typingGameStats');
    const savedAchievements = localStorage.getItem('typingGameAchievements');
    const savedLeaderboard = localStorage.getItem('typingGameLeaderboard');
    const savedName = localStorage.getItem('typingGamePlayerName');

    if (savedStats) setStats(JSON.parse(savedStats));
    if (savedLeaderboard) setLeaderboard(JSON.parse(savedLeaderboard));
    if (savedName) setPlayerName(savedName);
    
    if (savedAchievements) {
      const saved = JSON.parse(savedAchievements);
      setAchievements(prev => prev.map(achievement => ({
        ...achievement,
        unlocked: saved.find((a: Achievement) => a.id === achievement.id)?.unlocked || false
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('typingGameStats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('typingGameAchievements', JSON.stringify(achievements));
    console.log('Saved achievements to localStorage:', achievements);
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('typingGameLeaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  useEffect(() => {
    localStorage.setItem('typingGamePlayerName', playerName);
  }, [playerName]);

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
    startTimeRef.current = Date.now();
    
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

      const elapsedMinutes = (Date.now() - startTimeRef.current) / 60000;
      const newWpm = Math.round(score / elapsedMinutes) || 0;
      setWpm(newWpm);
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

  const Progress = () => (
    <div className="w-full h-2 bg-slate-700/30 rounded-full overflow-hidden">
      <div 
        className="h-full bg-emerald-500 transition-all duration-1000"
        style={{ 
          width: `${(timeLeft / DIFFICULTY_SETTINGS[difficulty].timeLimit) * 100}%`
        }}
      />
    </div>
  );

  useEffect(() => {
    if (!isPlaying && score > 0) {
      const newStats = {
        ...stats,
        totalGamesPlayed: stats.totalGamesPlayed + 1,
        totalWordsTyped: stats.totalWordsTyped + score,
        bestWpm: Math.max(stats.bestWpm, wpm),
        averageWpm: Math.round((stats.averageWpm * stats.totalGamesPlayed + wpm) / (stats.totalGamesPlayed + 1)),
        totalTimePlayed: stats.totalTimePlayed + DIFFICULTY_SETTINGS[difficulty].timeLimit
      };
      
      setStats(newStats);
      localStorage.setItem('typingGameStats', JSON.stringify(newStats));

      // Check achievements immediately after updating stats
      const newAchievements = achievements.map(achievement => ({
        ...achievement,
        unlocked: achievement.unlocked || achievement.condition()
      }));

      if (JSON.stringify(newAchievements) !== JSON.stringify(achievements)) {
        console.log('Updating achievements:', {
          current: achievements,
          new: newAchievements,
          stats: newStats,
          wpm: wpm
        });
        setAchievements(newAchievements);
        localStorage.setItem('typingGameAchievements', JSON.stringify(newAchievements));
      }
    }
  }, [isPlaying]);

  return (
    <div className={`max-w-2xl mx-auto p-6 rounded-2xl shadow-2xl border backdrop-blur-sm flex flex-col gap-4 max-h-screen overflow-y-auto`}>
      <h2 className="text-3xl font-bold text-white text-center bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
        Speed Typer
      </h2>
      
      <div className="flex flex-col gap-2">
        <div ref={selectRef}>
          <label className="block mb-1 text-slate-300">Select Difficulty:</label>
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
                      setIsLoading(false);
                      DIFFICULTY_SETTINGS[option.value as Difficulty].words = getRandomWords(option.value as Difficulty);
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

        <div className="flex space-x-2">
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

        <button
          onClick={() => setIsSoundEnabled(prev => !prev)}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 
            transition-colors duration-200"
          title={`Sound ${isSoundEnabled ? 'On' : 'Off'}`}
        >
          {isSoundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      <div className="flex-1 min-h-0">
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
              <div className={`text-lg transform transition-all duration-200 ${
                showSuccess ? 'scale-110 text-emerald-400' : ''
              }`}>
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
            
            <Progress />

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
      </div>

      {!isPlaying && (
        <div className="flex flex-col gap-3 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(highScore).map(([diff, score]) => (
              <div key={diff} className="text-center p-3 bg-slate-700/30 rounded-lg">
                <p className="text-slate-400 text-sm capitalize">{diff} Best</p>
                <p className="text-xl font-bold text-emerald-400">{score}</p>
              </div>
            ))}
          </div>

          {stats.totalGamesPlayed > 0 && (
            <div className="bg-slate-700/30 rounded-lg p-3">
              <h3 className="text-lg font-bold text-emerald-400 mb-1">Your Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-400">Games Played</p>
                  <p className="text-xl font-bold text-white">{stats.totalGamesPlayed}</p>
                </div>
                <div>
                  <p className="text-slate-400">Best WPM</p>
                  <p className="text-xl font-bold text-white">{stats.bestWpm}</p>
                </div>
                <div>
                  <p className="text-slate-400">Average WPM</p>
                  <p className="text-xl font-bold text-white">{stats.averageWpm}</p>
                </div>
                <div>
                  <p className="text-slate-400">Total Words</p>
                  <p className="text-xl font-bold text-white">{stats.totalWordsTyped}</p>
                </div>
              </div>
            </div>
          )}

          <Achievements 
            achievements={achievements}
            stats={stats}
            wpm={wpm}
            score={score}
            accuracy={accuracy}
          />

          {leaderboard.length > 0 && (
            <div className="bg-slate-700/30 rounded-lg p-3">
              <h3 className="text-lg font-bold text-emerald-400 mb-1">Leaderboard</h3>
              <div className="flex flex-col gap-2">
                {leaderboard.map((score, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-2 rounded ${
                      score.name === playerName ? 'bg-emerald-500/10 border border-emerald-500/20' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-slate-400 w-6">{index + 1}.</span>
                      <div>
                        <p className="font-bold text-white">{score.name}</p>
                        <p className="text-sm text-slate-400">
                          {new Date(score.date).toLocaleDateString()} - {score.difficulty}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">{score.wpm} WPM</p>
                      <p className="text-sm text-slate-400">{score.accuracy}% accuracy</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TypingGame; 