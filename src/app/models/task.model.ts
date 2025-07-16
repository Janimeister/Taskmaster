export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface UserProgress {
  nickname: string;
  completedTasks: string[];
  completedAt: Date[];
}

export interface LeaderboardEntry {
  nickname: string;
  completedCount: number;
  completionRate: number;
  lastActivity: Date;
}
