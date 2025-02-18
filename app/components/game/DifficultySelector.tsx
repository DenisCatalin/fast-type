import { useRef } from 'react';
import { Difficulty } from '../../types/game';

interface Props {
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
  isPlaying: boolean;
  isSelectOpen: boolean;
  setIsSelectOpen: (isOpen: boolean) => void;
}

export const DifficultySelector = ({ 
  difficulty, 
  setDifficulty, 
  isPlaying, 
  isSelectOpen, 
  setIsSelectOpen 
}: Props) => {
  const selectRef = useRef<HTMLDivElement>(null);
  
  const difficultyOptions = [
    { value: 'easy', label: 'Easy (15s)', desc: 'Short Words' },
    { value: 'medium', label: 'Medium (10s)', desc: 'Medium Words' },
    { value: 'hard', label: 'Hard (5s)', desc: 'Long Words' },
  ];

  return (
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
          {/* ... rest of the button content ... */}
        </button>

        {isSelectOpen && !isPlaying && (
          <div className="absolute w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10">
            {/* ... options content ... */}
          </div>
        )}
      </div>
    </div>
  );
}; 