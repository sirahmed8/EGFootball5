export interface Community {
  id: string;
  name: string;
  description: string;
  city: string;
  membersCount: number;
  matchesPlayed: number;
  captainName: string;
  captainUid: string;
  logoEmoji: string;
  category: string;
  memberIds?: string[];
  createdAt?: number;
}
