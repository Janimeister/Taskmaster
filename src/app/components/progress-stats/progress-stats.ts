import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-progress-stats',
  imports: [],
  template: `
    @if (userService.currentUser()) {
      <div class="progress-stats">
        @let statsData = stats();
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-number">{{ statsData.completed }}</div>
            <div class="stat-label">Completed</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-number">{{ statsData.total - statsData.completed }}</div>
            <div class="stat-label">Remaining</div>
          </div>
          
          <div class="stat-card progress-card">
            <div class="circular-progress">
              <svg class="progress-ring" width="80" height="80">
                <circle
                  class="progress-ring-background"
                  stroke="#e9ecef"
                  stroke-width="6"
                  fill="transparent"
                  r="34"
                  cx="40"
                  cy="40"
                />
                <circle
                  class="progress-ring-progress"
                  stroke="url(#gradient)"
                  stroke-width="6"
                  fill="transparent"
                  r="34"
                  cx="40"
                  cy="40"
                  [style.stroke-dasharray]="2 * Math.PI * 34"
                  [style.stroke-dashoffset]="2 * Math.PI * 34 * (1 - statsData.percentage / 100)"
                  stroke-linecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="progress-text">
                <div class="progress-percentage">{{ statsData.percentage }}%</div>
                <div class="progress-subtitle">Complete</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './progress-stats.css'
})
export class ProgressStatsComponent {
  Math = Math; // Make Math available in template

  constructor(public userService: UserService) {}

  get stats() {
    return this.userService.getCompletionStats();
  }
}
