import { Component, computed, inject, input } from '@angular/core';
import { UserService } from '../../services/user.service';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-leaderboard',
  imports: [DatePipe, DecimalPipe],
  template: `
    <div class="leaderboard">
      <h2 class="leaderboard-title">🏆 {{ texts().leaderboard }}</h2>
      
      @if (userService.leaderboard().length > 0) {
        <div class="leaderboard-list">
          @for (entry of userService.leaderboard(); track entry.nickname; let i = $index) {
            <div 
              class="leaderboard-item"
              [class]="getRankClass(i)"
              [class.current-user]="entry.nickname === userService.currentUser()"
            >
              <div class="rank">
                @if (getRankIcon(i)) {
                  <span class="rank-icon">{{ getRankIcon(i) }}</span>
                } @else {
                  <span class="rank-number">#{{ i + 1 }}</span>
                }
              </div>
              
              <div class="player-info">
                <div class="player-name">
                  {{ entry.nickname }}
                  @if (entry.nickname === userService.currentUser()) {
                    <span class="you-badge">{{ texts().you }}</span>
                  }
                </div>
                <div class="player-stats">
                  <span class="completed-count">{{ entry.completedCount }} {{ texts().tasks }}</span>
                  <span class="completion-rate">{{ entry.completionRate | number:'1.0-0' }}% {{ texts().complete }}</span>
                </div>
              </div>
              
              <div class="last-activity">
                @if (entry.lastActivity.getTime() > 0) {
                  <span class="activity-text">{{ texts().lastActive }}</span>
                  <span class="activity-date">{{ entry.lastActivity | date:'short' }}</span>
                } @else {
                  <span class="no-activity">{{ texts().noActivity }}</span>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-leaderboard">
          <p>{{ texts().noProgress }}</p>
          <p>{{ texts().completeTasksToAppear }}</p>
        </div>
      }
    </div>
  `,
  styleUrl: './leaderboard.css'
})
export class LeaderboardComponent {
  userService = inject(UserService);
  
  // Accept language as input from parent component
  language = input<'en' | 'fi'>('en');

  texts = computed(() => {
    const lang = this.language();
    return {
      leaderboard: lang === 'en' ? 'Leaderboard' : 'Tulostaulukko',
      you: lang === 'en' ? 'You' : 'Sinä',
      tasks: lang === 'en' ? 'tasks' : 'tehtävää',
      complete: lang === 'en' ? 'complete' : 'valmis',
      lastActive: lang === 'en' ? 'Last active:' : 'Viimeksi aktiivinen:',
      noActivity: lang === 'en' ? 'No activity yet' : 'Ei vielä aktiivisuutta',
      noProgress: lang === 'en' ? 'No progress recorded yet.' : 'Ei vielä tallennettua edistymistä.',
      completeTasksToAppear: lang === 'en' ? 'Complete some tasks to appear on the leaderboard!' : 'Suorita tehtäviä päästäksesi tulostaulukkoon!'
    };
  });

  getRankIcon(index: number): string {
    switch (index) {
      case 0: return '🏆';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  }

  getRankClass(index: number): string {
    switch (index) {
      case 0: return 'rank-gold';
      case 1: return 'rank-silver';
      case 2: return 'rank-bronze';
      default: return '';
    }
  }
}
