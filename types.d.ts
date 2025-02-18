interface GameConfig {
  timeLimit: number;
  wordLength: number;
  wordCount: number;
  words: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  condition: () => boolean;
  unlocked: boolean;
}

interface Stats {
  totalGamesPlayed: number;
  totalWordsTyped: number;
  averageWpm: number;
  bestWpm: number;
  totalTimePlayed: number;
}

interface PlayerScore {
  name: string;
  wpm: number;
  accuracy: number;
}

interface Props {
  onThemeChange: (theme: Theme) => void;
}