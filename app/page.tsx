'use client';

import TypingGame from './components/TypingGame';
import { useState } from 'react';
import { themes, type Theme } from './shared/constants';

export default function Home() {
  const [theme, setTheme] = useState<Theme>('default');

  return (
    <main className={`min-h-screen p-8 ${themes[theme].background}`}>
      <TypingGame onThemeChange={setTheme} />
    </main>
  );
}
