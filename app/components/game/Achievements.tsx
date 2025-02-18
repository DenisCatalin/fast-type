interface Props {
  achievements: Achievement[];
  stats: Stats;
  wpm: number;
  score: number;
  accuracy: number;
}

export const Achievements = ({ achievements, stats, wpm, score, accuracy }: Props) => {
  const getAchievementStatus = (achievement: Achievement) => {
    switch (achievement.id) {
      case 'speed_demon':
        return stats.bestWpm >= 50 || wpm >= 50;
      case 'perfect_10':
        return score >= 10 && accuracy === 100;
      case 'marathon_runner':
        return stats.totalGamesPlayed >= 10;
      default:
        return false;
    }
  };

  return (
    <div className="bg-slate-700/30 rounded-lg p-3">
      <h3 className="text-lg font-bold text-emerald-400 mb-1">Achievements</h3>
      <div className="grid gap-2">
        {achievements.map(achievement => (
          <div 
            key={achievement.id} 
            className={`flex items-center space-x-2 p-2 rounded-lg ${
              getAchievementStatus(achievement)
                ? 'bg-emerald-500/10 border border-emerald-500/20' 
                : 'bg-slate-800/50 opacity-50'
            }`}
          >
            <span className="text-2xl">
              {getAchievementStatus(achievement) ? '🏆' : '🔒'}
            </span>
            <div>
              <p className="font-bold text-white">{achievement.title}</p>
              <p className="text-sm text-slate-400">{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 