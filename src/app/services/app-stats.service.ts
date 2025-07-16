import { Injectable, signal, computed } from '@angular/core';

export interface AppStats {
  totalLogins: number;
  totalTasksCompleted: number;
  totalUsers: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AppStatsService {
  private _stats = signal<AppStats>({
    totalLogins: 0,
    totalTasksCompleted: 0,
    totalUsers: []
  });

  // Read-only signal for external consumption
  stats = this._stats.asReadonly();

  // Computed signals for derived values
  uniqueUserCount = computed(() => new Set(this._stats().totalUsers).size);
  averageTasksPerUser = computed(() => {
    const userCount = this.uniqueUserCount();
    return userCount > 0 ? Math.round(this._stats().totalTasksCompleted / userCount) : 0;
  });

  recordLogin(username: string): void {
    this._stats.update(stats => ({
      ...stats,
      totalLogins: stats.totalLogins + 1,
      totalUsers: [...stats.totalUsers, username]
    }));
  }

  recordTaskCompletion(): void {
    this._stats.update(stats => ({
      ...stats,
      totalTasksCompleted: stats.totalTasksCompleted + 1
    }));
  }

  recordTaskUncompletion(): void {
    this._stats.update(stats => ({
      ...stats,
      totalTasksCompleted: Math.max(0, stats.totalTasksCompleted - 1)
    }));
  }

  resetStats(): void {
    this._stats.set({
      totalLogins: 0,
      totalTasksCompleted: 0,
      totalUsers: []
    });
  }
}
