import TypingGame from './components/TypingGame';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-slate-900 bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <TypingGame />
    </main>
  );
}
