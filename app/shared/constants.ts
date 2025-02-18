export const themes = {
  default: {
    container: 'bg-slate-800 text-white border-slate-700/50',
    background: 'bg-slate-900'
  },
  neon: {
    container: 'bg-black text-emerald-400 border-emerald-500/50',
    background: 'bg-zinc-950'
  },
  retro: {
    container: 'bg-amber-900 text-amber-200 border-amber-700/50',
    background: 'bg-amber-950'
  },
  dark: {
    container: 'bg-zinc-900 text-zinc-300 border-zinc-800/50',
    background: 'bg-zinc-950'
  }
};

export type Theme = 'default' | 'neon' | 'retro' | 'dark';