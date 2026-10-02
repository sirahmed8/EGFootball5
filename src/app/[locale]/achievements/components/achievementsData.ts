export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  category: 'Matches' | 'Scoring' | 'Goals' | 'Loyalty' | 'Social';
  reward?: string;
}

export const RANK_TITLES: [number, string][] = [
  [1, 'Rookie Player'],
  [3, 'Amateur Baller'],
  [5, 'Semi-Pro Striker'],
  [8, 'Pitch Veteran'],
  [12, 'Stadium Legend'],
  [Infinity, 'Hall of Famer 🏆'],
];

export function getRankTitle(lvl: number): string {
  for (const [threshold, title] of RANK_TITLES) {
    if (lvl <= threshold) return title;
  }
  return 'Hall of Famer 🏆';
}

export const CATEGORY_COLORS: Record<string, string> = {
  Matches: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Scoring: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Goals: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  Loyalty: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Social: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

export function buildAchievements({
  matchesPlayed,
  goals,
  assists,
  saves,
}: {
  matchesPlayed: number;
  goals: number;
  assists: number;
  saves: number;
}): Achievement[] {
  return [
    {
      id: '1',
      title: 'First Touch',
      description: 'Book and complete your first 5-a-side match.',
      icon: '⚽',
      progress: Math.min(1, matchesPlayed),
      maxProgress: 1,
      unlocked: matchesPlayed >= 1,
      category: 'Matches',
      reward: '+100 XP',
    },
    {
      id: '2',
      title: 'Veteran Baller',
      description: 'Play 10 matches on the platform.',
      icon: '🏟️',
      progress: Math.min(10, matchesPlayed),
      maxProgress: 10,
      unlocked: matchesPlayed >= 10,
      category: 'Matches',
      reward: '+500 XP',
    },
    {
      id: '3',
      title: 'Legend of the Pitch',
      description: 'Complete 25 matches — a true platform veteran.',
      icon: '👑',
      progress: Math.min(25, matchesPlayed),
      maxProgress: 25,
      unlocked: matchesPlayed >= 25,
      category: 'Matches',
      reward: 'Gold Badge',
    },
    {
      id: '4',
      title: 'First Goal',
      description: 'Score your first goal in a public match.',
      icon: '🥅',
      progress: Math.min(1, goals),
      maxProgress: 1,
      unlocked: goals >= 1,
      category: 'Goals',
      reward: '+30 XP',
    },
    {
      id: '5',
      title: 'Hat-Trick Hero',
      description: 'Score 3 or more goals total across all matches.',
      icon: '🎩',
      progress: Math.min(3, goals),
      maxProgress: 3,
      unlocked: goals >= 3,
      category: 'Goals',
      reward: '+150 XP',
    },
    {
      id: '6',
      title: 'Top Striker',
      description: 'Score 10 goals in competitive matches.',
      icon: '🔥',
      progress: Math.min(10, goals),
      maxProgress: 10,
      unlocked: goals >= 10,
      category: 'Scoring',
      reward: 'Striker Badge',
    },
    {
      id: '7',
      title: 'Playmaker',
      description: 'Record 5 assists — the team needs you.',
      icon: '🅰️',
      progress: Math.min(5, assists),
      maxProgress: 5,
      unlocked: assists >= 5,
      category: 'Scoring',
      reward: '+200 XP',
    },
    {
      id: '8',
      title: 'Clean Sheet Keeper',
      description: 'Record 3 saves or clean sheets as goalkeeper.',
      icon: '🧤',
      progress: Math.min(3, saves),
      maxProgress: 3,
      unlocked: saves >= 3,
      category: 'Loyalty',
      reward: 'GK Badge',
    },
    {
      id: '9',
      title: 'Night Owl',
      description: 'Play a late night match (10 PM – 2 AM slot).',
      icon: '🌙',
      progress: matchesPlayed >= 1 ? 1 : 0,
      maxProgress: 1,
      unlocked: matchesPlayed >= 1,
      category: 'Loyalty',
      reward: '+50 XP',
    },
    {
      id: '10',
      title: 'Community Pillar',
      description: 'Join or create a squad community.',
      icon: '🛡️',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      category: 'Social',
      reward: 'Community Badge',
    },
    {
      id: '11',
      title: 'Challenge Accepted',
      description: 'Post or accept a squad challenge in the arena.',
      icon: '⚔️',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      category: 'Social',
      reward: '+100 XP',
    },
    {
      id: '12',
      title: 'Goal Clip Star',
      description: 'Submit a goal clip to the Goal of the Month contest.',
      icon: '🎬',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      category: 'Social',
      reward: 'Fame Badge',
    },
  ];
}
