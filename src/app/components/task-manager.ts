import { Component, signal, computed, effect, viewChild, ElementRef, afterNextRender, output, input, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { AutoFocusDirective } from '../directives/auto-focus.directive';
import { LongPressDirective } from '../directives/interaction.directives';
import { TaskStatusPipe } from '../pipes/task.pipes';
import { SettingsPanelComponent, type SettingsConfig } from './settings-panel.component';
import { LeaderboardComponent } from './leaderboard/leaderboard';
import { MotivationService } from '../services/motivation.service';
import { UserService } from '../services/user.service';
import { TaskService } from '../services/task.service';
import { SecurityService } from '../services/security.service';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  points: number; // Points value for task completion
}

@Component({
  selector: 'app-task-manager',
  imports: [
    FormsModule, 
    AutoFocusDirective, 
    LongPressDirective, 
    TaskStatusPipe, 
    SettingsPanelComponent,
    LeaderboardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('taskComplete', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8) translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ])
    ]),
    trigger('celebrationBanner', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5) translateY(-50px)' }),
        animate('500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ])
    ]),
    trigger('taskList', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger(50, [
            animate('200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="task-manager" [class]="themeClass()">
      @if (!currentUser()) {
        <div class="login-section">
          <h3>🎯 {{ texts().startTaskJourney }}</h3>
          <p>{{ texts().enterNickname }}</p>
          <div class="input-group">
            <input 
              #nicknameInput
              type="text" 
              [(ngModel)]="nickname" 
              (keypress)="onKeyPress($event)"
              [placeholder]="texts().nicknamePlaceholder" 
              class="nickname-input"
              maxlength="20"
              appAutoFocus="true"
              delay="300"
            />
            <button 
              (click)="login()" 
              [disabled]="!nickname().trim()"
              class="login-btn"
            >
              {{ texts().startTracking }}
            </button>
          </div>
        </div>
      } @else {
        <div class="user-dashboard">
          <div class="user-header">
            <div class="user-info">
              <h3>{{ texts().welcomeBack }}, {{ currentUser() }}! 👋</h3>
              <p>{{ texts().continueJourney }}</p>
            </div>
            <div class="header-controls">
              <button (click)="logout()" class="logout-btn">{{ texts().logout }}</button>
            </div>
          </div>
          
          <div class="progress-section">
            <div class="progress-card">
              <div class="progress-circle" [style.--progress]="progressPercentage()">              <div class="progress-text">
                <span class="progress-number">{{ progressPercentage() }}%</span>
                <span class="progress-label">{{ texts().complete }}</span>
              </div>
            </div>
            <div class="progress-stats">
              <h4>{{ earnedPoints() }} / {{ totalPoints() }} {{ texts().pointsEarned }}</h4>
              <p>{{ totalPoints() - earnedPoints() }} {{ texts().pointsRemaining }}</p>
            </div>
            </div>
          </div>
          
          <div class="tasks-section">
            <h4>📝 {{ texts().developmentTasks }}</h4>
            <div class="task-list" [@taskList]="filteredTasks().length">
              @for (task of filteredTasks(); track task.id) {
                <div class="task-item" 
                     [class.completed]="task.completed" 
                     [@taskComplete]
                     appLongPress
                     duration="1000"
                     (longPress)="onTaskLongPress(task)">
                  <label class="task-label">
                    <input 
                      type="checkbox" 
                      [checked]="task.completed"
                      (change)="toggleTask(task.id)"
                      class="task-checkbox"
                    />
                    <span class="task-title">{{ task.title }}</span>
                    <span class="task-status">{{ task.completed | taskStatus:'icon' }}</span>
                  </label>
                  <div class="task-meta">
                    <small>Status: {{ task.completed | taskStatus:'text' }} • Points: {{ task.points }}</small>
                  </div>
                </div>
              }
            </div>
          </div>

          @if (isAllTasksCompleted() && showCelebration()) {
            <div class="celebration-banner" [@celebrationBanner]>
              <h3>🎉 {{ texts().congratulations }}!</h3>
              <p>{{ texts().journeyComplete }}</p>
            </div>
          }

          <!-- Motivational Section -->
          @if (appSettings().showMotivation) {
            <div class="motivation-section">
              <h4>💪 {{ texts().dailyMotivation }}</h4>
              @if (motivationService.isLoading()) {
                <div class="motivation-loading">{{ texts().loadingInspiration }}</div>
              } @else if (motivationService.error()) {
                <div class="motivation-error">{{ motivationService.error() }}</div>
              } @else if (motivationService.quote()) {
                <div class="motivation-quote">
                  <blockquote>
                    "{{ motivationService.quote()?.text }}"
                  </blockquote>
                  <cite>— {{ motivationService.quote()?.author }}</cite>
                  <div class="quote-category">{{ motivationService.quote()?.category }}</div>
                </div>
              }
              <button 
                class="refresh-quote-btn" 
                (click)="refreshMotivationalQuote()"
                [disabled]="motivationService.isLoading()">
                🔄 {{ texts().newQuote }}
              </button>
            </div>
          }

          <div class="leaderboard-section">
            <app-leaderboard [language]="appSettings().language" />
          </div>
        </div>
      }

      <!-- Settings Panel Integration -->
      <app-settings-panel
        [(settings)]="appSettings"
        [isOpen]="settingsOpen()"
        [currentTheme]="appSettings().theme"
        (panelOpened)="onSettingsPanelOpened()"
        (panelClosed)="onSettingsPanelClosed()"
        (resetProgress)="onResetProgress()"
      />
    </div>
  `,
  styles: [`
    .task-manager {
      max-width: 800px;
      margin: 2rem auto;
      padding: 1rem;
      transition: all 0.3s ease;
    }

    /* Theme support */
    .theme-light {
      --bg-primary: white;
      --bg-secondary: #f8f9fa;
      --text-primary: #333;
      --text-secondary: #6c757d;
      --border-color: #e9ecef;
      --accent-color: #667eea;
    }

    .theme-dark {
      --bg-primary: #2d3748;
      --bg-secondary: #4a5568;
      --text-primary: #f7fafc;
      --text-secondary: #a0aec0;
      --border-color: #4a5568;
      --accent-color: #9f7aea;
    }

    .login-section {
      text-align: center;
      background: var(--bg-primary, white);
      padding: 3rem 2rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      color: var(--text-primary, #333);
    }

    .login-section h3 {
      color: var(--text-primary, #333);
      margin-bottom: 1rem;
      font-size: 1.8rem;
    }

    .login-section p {
      color: var(--text-secondary, #6c757d);
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    .input-group {
      display: flex;
      gap: 1rem;
      max-width: 400px;
      margin: 0 auto;
    }

    .nickname-input {
      flex: 1;
      padding: 1rem;
      border: 2px solid var(--border-color, #e9ecef);
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: var(--bg-primary, white);
      color: var(--text-primary, #333);
    }

    .nickname-input:focus {
      outline: none;
      border-color: var(--accent-color, #667eea);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .login-btn {
      padding: 1rem 2rem;
      background: linear-gradient(135deg, var(--accent-color, #667eea) 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .login-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .user-dashboard {
      background: var(--bg-primary, white);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      color: var(--text-primary, #333);
    }

    .user-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid var(--border-color, #f8f9fa);
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .language-toggle {
      padding: 0.5rem;
      background: var(--bg-secondary, #f8f9fa);
      color: var(--text-primary, #333);
      border: 2px solid var(--border-color, #e9ecef);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1.2rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .language-toggle:hover {
      background: var(--border-color, #e9ecef);
      transform: translateY(-1px);
    }

    .user-info h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary, #333);
      font-size: 1.5rem;
    }

    .user-info p {
      margin: 0;
      color: var(--text-secondary, #6c757d);
    }

    .logout-btn {
      padding: 0.75rem 1.5rem;
      background: var(--bg-secondary, #f8f9fa);
      color: var(--text-secondary, #6c757d);
      border: 2px solid var(--border-color, #e9ecef);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .logout-btn:hover {
      background: var(--border-color, #e9ecef);
      color: var(--text-primary, #495057);
    }

    .progress-section {
      margin-bottom: 3rem;
    }

    .progress-card {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 2rem;
      background: var(--bg-secondary, #f8f9fa);
      border-radius: 16px;
    }

    .progress-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: conic-gradient(
        var(--accent-color, #667eea) 0deg, 
        var(--accent-color, #667eea) calc(var(--progress, 0) * 3.6deg), 
        var(--border-color, #e9ecef) calc(var(--progress, 0) * 3.6deg)
      );
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      flex-shrink: 0;
    }

    .progress-circle::before {
      content: '';
      width: 90px;
      height: 90px;
      background: var(--bg-primary, white);
      border-radius: 50%;
      position: absolute;
    }

    .progress-text {
      position: relative;
      text-align: center;
      z-index: 1;
    }

    .progress-number {
      display: block;
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--text-primary, #333);
    }

    .progress-label {
      display: block;
      font-size: 0.9rem;
      color: var(--text-secondary, #6c757d);
    }

    .progress-stats h4 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary, #333);
      font-size: 1.3rem;
    }

    .progress-stats p {
      margin: 0;
      color: var(--text-secondary, #6c757d);
      font-size: 1rem;
    }

    .tasks-section h4 {
      color: var(--text-primary, #333);
      margin-bottom: 1.5rem;
      font-size: 1.3rem;
    }

    .task-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .task-item {
      padding: 1.5rem;
      background: var(--bg-secondary, #f8f9fa);
      border-radius: 12px;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      cursor: pointer;
      user-select: none;
    }

    .task-item:hover {
      background: var(--border-color, #e9ecef);
      transform: translateY(-2px);
    }

    .task-meta {
      margin-top: 0.5rem;
      color: var(--text-muted, #6c757d);
      font-size: 0.875rem;
    }

    .task-status {
      margin-left: 0.5rem;
      font-size: 1.2rem;
    }

    .task-item.completed {
      background: #d4edda;
      border-color: #c3e6cb;
    }

    .theme-dark .task-item.completed {
      background: #2d5a3d;
      border-color: #4a6b5a;
    }

    .task-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      width: 100%;
    }

    .task-checkbox {
      margin-right: 1rem;
      transform: scale(1.3);
      cursor: pointer;
    }

    .task-title {
      flex: 1;
      font-size: 1rem;
      color: var(--text-primary, #333);
      transition: all 0.3s ease;
    }

    .task-item.completed .task-title {
      text-decoration: line-through;
      color: var(--text-secondary, #6c757d);
    }

    .completion-icon {
      margin-left: 1rem;
      font-size: 1.2rem;
    }

    .celebration-banner {
      margin-top: 2rem;
      padding: 2rem;
      background: linear-gradient(135deg, var(--accent-color, #667eea) 0%, #764ba2 100%);
      color: white;
      border-radius: 16px;
      text-align: center;
    }

    .celebration-banner h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
    }

    .celebration-banner p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    @media (max-width: 768px) {
      .task-manager {
        padding: 1rem;
      }
      
      .input-group {
        flex-direction: column;
      }
      
      .user-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
      
      .header-controls {
        justify-content: center;
      }
      
      .progress-card {
        flex-direction: column;
        text-align: center;
      }
      
      .task-item {
        padding: 1rem;
      }
    }

    /* Motivation Section Styles */
    .motivation-section {
      margin-top: 2rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
      text-align: center;
    }

    .motivation-section h4 {
      margin: 0 0 1rem 0;
      font-size: 1.2rem;
    }

    .motivation-quote {
      margin: 1rem 0;
    }

    .motivation-quote blockquote {
      font-size: 1.1rem;
      font-style: italic;
      margin: 0 0 0.5rem 0;
      line-height: 1.5;
    }

    .motivation-quote cite {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
      margin-top: 0.5rem;
      opacity: 0.9;
    }

    .quote-category {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 0.5rem;
      padding: 0.25rem 0.5rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: inline-block;
    }

    .motivation-loading,
    .motivation-error {
      padding: 1rem;
      font-style: italic;
      opacity: 0.8;
    }

    .motivation-error {
      color: #ffcccb;
    }

    .refresh-quote-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 1rem;
    }

    .refresh-quote-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }

    .refresh-quote-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* Dark theme support for motivation section */
    .theme-dark .motivation-section {
      background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
    }

    /* Leaderboard Section Styles */
    .leaderboard-section {
      margin-top: 2rem;
    }

    .leaderboard-section app-leaderboard {
      display: block;
    }
  `]
})
export class TaskManagerComponent {
  nickname = signal('');
  currentUser = signal('');
  
  // Input signals for configuration - makes component highly reusable
  readonly theme = input<'light' | 'dark'>('light');
  readonly maxTasks = input<number>(10);
  readonly showCelebration = input<boolean>(true);
  readonly autoFocus = input<boolean>(true);
  readonly taskTitle = input<string>('📝 Development Tasks');
  
  // ViewChild with signals for better focus management
  nicknameInput = viewChild<ElementRef>('nicknameInput');

  // Output signals for events - makes component more reusable
  readonly userLoggedIn = output<string>();
  readonly userLoggedOut = output<void>();
  readonly taskCompleted = output<Task>();
  readonly taskUncompleted = output<Task>();
  readonly allTasksCompleted = output<string>(); // Emit username when all tasks done
  readonly progressChanged = output<{ completed: number; total: number; percentage: number; earnedPoints: number; totalPoints: number }>();
  readonly themeChanged = output<'light' | 'dark'>();
  readonly languageChanged = output<'en' | 'fi'>();
  
  // Settings-related signals
  settingsOpen = signal(false);
  appSettings = signal<SettingsConfig>({
    theme: 'light',
    language: 'en',
    soundEnabled: true,
    showMotivation: false
  });
  
  tasks = signal<Task[]>([
    { id: 1, title: 'Setup development environment', completed: false, points: 10 },
    { id: 2, title: 'Learn TypeScript fundamentals', completed: false, points: 20 },
    { id: 3, title: 'Master Angular components and services', completed: false, points: 30 },
    { id: 4, title: 'Implement responsive design patterns', completed: false, points: 25 },
    { id: 5, title: 'Add user authentication and data persistence', completed: false, points: 35 },
    { id: 6, title: 'Create interactive user interfaces', completed: false, points: 40 },
    { id: 7, title: 'Optimize performance and bundle size', completed: false, points: 50 },
    { id: 8, title: 'Write comprehensive tests', completed: false, points: 45 },
    { id: 9, title: 'Setup CI/CD pipeline', completed: false, points: 55 },
    { id: 10, title: 'Deploy to production (Cloudflare Pages)', completed: false, points: 60 }
  ]);

  // Computed signals with configuration support
  filteredTasks = computed(() => this.tasks().slice(0, this.maxTasks()));
  completedCount = computed(() => this.filteredTasks().filter(task => task.completed).length);
  totalPoints = computed(() => this.filteredTasks().reduce((sum, task) => sum + task.points, 0));
  earnedPoints = computed(() => this.filteredTasks().filter(task => task.completed)
    .reduce((sum, task) => sum + task.points, 0));
  progressPercentage = computed(() => Math.round((this.earnedPoints() / this.totalPoints()) * 100));
  isAllTasksCompleted = computed(() => this.completedCount() === this.filteredTasks().length);
  themeClass = computed(() => `theme-${this.appSettings().theme}`);
  animationsEnabled = computed(() => true); // Always enabled as requested

  // Translation system
  texts = computed(() => {
    const lang = this.appSettings().language;
    return this.getTexts(lang);
  });

  private getTexts(language: 'en' | 'fi') {
    const translations = {
      en: {
        // Login section
        startTaskJourney: 'Start Your Tasks',
        enterNickname: 'Enter your nickname to begin tracking your tasks!',
        nicknamePlaceholder: 'Enter your nickname',
        startTracking: 'Start progressing through tasks',
        
        // User dashboard
        welcomeBack: 'Welcome back',
        continueJourney: 'Continue your tasks',
        logout: 'Logout',
        complete: 'Complete',
        tasksCompleted: 'tasks completed',
        tasksRemaining: 'tasks remaining',
        pointsEarned: 'points earned',
        pointsRemaining: 'points remaining',
        
        // Celebration
        congratulations: 'Congratulations!',
        journeyComplete: "You've completed your entire development journey! Time to deploy and celebrate! 🚀",
        
        // Motivation
        dailyMotivation: 'Daily Motivation',
        loadingInspiration: 'Loading inspiration...',
        newQuote: 'New Quote',
        
        // Task status
        statusComplete: 'Complete',
        statusIncomplete: 'Incomplete',
        
        // Tasks
        developmentTasks: 'Development Tasks'
      },
      fi: {
        // Login section
        startTaskJourney: 'Aloita tehtävät',
        enterNickname: 'Syötä nimimerkki aloittaaksesi tehtävien tekeminen!',
        nicknamePlaceholder: 'Syötä nimimerkki',
        startTracking: 'Aloita tehtävien tekeminen',
        
        // User dashboard
        welcomeBack: 'Tervetuloa takaisin',
        continueJourney: 'Jatka suoritustasi',
        logout: 'Kirjaudu ulos',
        complete: 'Valmis',
        tasksCompleted: 'tehtävää valmista',
        tasksRemaining: 'tehtävää jäljellä',
        pointsEarned: 'pistettä ansaittu',
        pointsRemaining: 'pistettä jäljellä',
        
        // Celebration
        congratulations: 'Onnittelut!',
        journeyComplete: 'Olet suorittanut kaikki tehtävät! Aika juhlia! 🚀',
        
        // Motivation
        dailyMotivation: 'Päivittäinen motivaatio',
        loadingInspiration: 'Ladataan inspiraatiota...',
        newQuote: 'Uusi lainaus',
        
        // Task status
        statusComplete: 'Valmis',
        statusIncomplete: 'Kesken',
        
        // Tasks
        developmentTasks: 'Kehitystehtävät'
      }
    };
    return translations[language];
  }

  constructor(
    public motivationService: MotivationService,
    private userService: UserService,
    private taskService: TaskService,
    private securityService: SecurityService
  ) {
    // Sync with UserService when it's available
    effect(() => {
      try {
        if (this.userService && this.userService.currentUser) {
          const currentUser = this.userService.currentUser();
          if (currentUser && currentUser !== this.currentUser()) {
            this.currentUser.set(currentUser);
            this.loadUserProgress(currentUser);
            console.log('Synced current user from UserService:', currentUser);
          }
        }
      } catch (error) {
        console.error('Error syncing with UserService:', error);
      }
    });
    
    // Load app settings
    this.loadAppSettings();
    
    // Auto-save effect - UserService handles persistence automatically
    effect(() => {
      // Only run in browser environment
      if (typeof window === 'undefined') return;
      
      // Track both user and tasks signals for logging purposes
      const user = this.currentUser();
      const tasks = this.tasks();
      
      // UserService automatically saves when user/task state changes
      if (user || tasks.some(task => task.completed)) {
        console.log('Task state changed - UserService will handle persistence');
      }
    });

    // Progress tracking effect - emit progress changes
    effect(() => {
      const completed = this.completedCount();
      const total = this.filteredTasks().length;
      const percentage = this.progressPercentage();
      const user = this.currentUser();

      // Emit progress changes when user is logged in
      if (user) {
        this.progressChanged.emit({ 
          completed, 
          total, 
          percentage,
          earnedPoints: this.earnedPoints(),
          totalPoints: this.totalPoints()
        });

        // Check if all tasks completed
        if (this.isAllTasksCompleted() && completed > 0) {
          this.allTasksCompleted.emit(user);
        }
      }
    });

    // Watch for settings changes from the settings panel (two-way binding)
    effect(() => {
      const currentSettings = this.appSettings();
      
      // Save to localStorage using SecurityService
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        this.securityService.safeLocalStorageSet('appSettings', currentSettings);
      }
      
      // Note: We'll handle theme/language change detection in a separate effect
    });

    // Detect theme changes and emit events
    effect(() => {
      const currentTheme = this.appSettings().theme;
      // Use a static variable to track previous theme
      const previousTheme = (this as any)._previousTheme;
      
      if (previousTheme !== undefined && previousTheme !== currentTheme) {
        console.log('🎨 Theme changed from', previousTheme, 'to', currentTheme);
        this.themeChanged.emit(currentTheme);
      }
      
      (this as any)._previousTheme = currentTheme;
    });

    // Detect language changes and emit events  
    effect(() => {
      const currentLanguage = this.appSettings().language;
      // Use a static variable to track previous language
      const previousLanguage = (this as any)._previousLanguage;
      
      if (previousLanguage !== undefined && previousLanguage !== currentLanguage) {
        console.log('🌐 Language changed from', previousLanguage, 'to', currentLanguage);
        this.languageChanged.emit(currentLanguage);
      }
      
      (this as any)._previousLanguage = currentLanguage;
    });

    // Auto-focus effect - focus input when user logs out or on page load
    afterNextRender(() => {
      if (!this.currentUser() && this.autoFocus()) {
        this.focusNicknameInput();
      }
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.nickname().trim()) {
      this.login();
    }
  }

  login(): void {
    const name = this.nickname().trim();
    if (name) {
      this.currentUser.set(name);
      this.nickname.set('');
      
      // Set current user in UserService for leaderboard
      this.userService.setCurrentUser(name);
      
      // Load user-specific progress
      this.loadUserProgress(name);
      
      // Emit login event
      this.userLoggedIn.emit(name);
    }
  }

  logout(): void {
    // Save current user's progress before logging out
    this.saveUserData();
    
    // Clear current user in UserService
    this.userService.clearCurrentUser();
    
    // Clear current user but keep tasks as they are for saving
    this.currentUser.set('');
    
    // Emit logout event
    this.userLoggedOut.emit();
    
    // Focus the input after logout for better UX
    setTimeout(() => this.focusNicknameInput(), 0);
  }

  focusNicknameInput(): void {
    this.nicknameInput()?.nativeElement.focus();
  }

  toggleTask(taskId: number): void {
    const currentTasks = this.tasks();
    const task = currentTasks.find(t => t.id === taskId);
    
    if (task) {
      const newCompleted = !task.completed;
      
      this.tasks.update(tasks => 
        tasks.map(t => 
          t.id === taskId ? { ...t, completed: newCompleted } : t
        )
      );

      // Update UserService for leaderboard data
      const taskIdString = taskId.toString();
      if (newCompleted) {
        this.userService.completeTask(taskIdString);
      } else {
        this.userService.uncompleteTask(taskIdString);
      }

      // Emit task completion events
      const updatedTask = { ...task, completed: newCompleted };
      if (newCompleted) {
        this.taskCompleted.emit(updatedTask);
        this.playSound('complete');
        
        // Check if all tasks are completed for success sound
        setTimeout(() => {
          if (this.isAllTasksCompleted()) {
            this.playSound('success');
          }
        }, 100);
      } else {
        this.taskUncompleted.emit(updatedTask);
      }
    }
  }

  private saveUserData(): void {
    // This method is now handled by UserService automatically
    // No manual localStorage operations needed
    console.log('User data persistence is handled by UserService');
  }

  private loadUserProgress(username: string): void {
    // Sync task state with UserService data
    this.tasks.update(tasks => 
      tasks.map(task => ({
        ...task,
        completed: this.userService.isTaskCompleted(task.id.toString())
      }))
    );
    console.log(`Synced progress with UserService for user: ${username}`);
  }

  private loadAppSettings(): void {
    // Load app settings using SecurityService
    const settings = this.securityService.safeLocalStorageGet('appSettings', null);
    if (settings) {
      this.appSettings.set(settings);
      console.log('Loaded settings from localStorage:', settings);
    }
  }

  private loadUserData(): void {
    // This method is now replaced by the effect in constructor
    // and loadAppSettings method
    console.log('loadUserData called - now handled by constructor effect');
  }

  // New methods for modern features integration
  onTaskLongPress(task: Task): void {
    console.log('Long press detected on task:', task.title);
    // Could trigger context menu, quick actions, etc.
  }

  onSettingsPanelOpened(): void {
    console.log('Settings panel opened from task manager');
    this.settingsOpen.set(true);
  }

  onSettingsPanelClosed(): void {
    console.log('Settings panel closed from task manager');
    this.settingsOpen.set(false);
  }

  onResetProgress(): void {
    console.log('Reset progress requested from settings panel');
    
    // Use the services to properly reset all data
    this.userService.resetAllUserData();
    this.taskService.resetAllTasks();
    
    // Reset current tasks to incomplete in local state to sync with UI
    this.tasks.update(tasks => 
      tasks.map(task => ({ ...task, completed: false }))
    );
    
    // Clear current user in local state
    this.currentUser.set('');
    
    console.log('All progress reset - user logged out and tasks cleared');
  }

  toggleLanguage(): void {
    const currentLanguage = this.appSettings().language;
    const newLanguage = currentLanguage === 'en' ? 'fi' : 'en';
    
    console.log('Language toggle clicked - changing from', currentLanguage, 'to', newLanguage);
    
    this.appSettings.update(settings => ({
      ...settings,
      language: newLanguage
    }));
    
    // Emit language change event
    this.languageChanged.emit(newLanguage);
    
    // Save settings to localStorage using SecurityService
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.securityService.safeLocalStorageSet('appSettings', this.appSettings());
    }
  }

  refreshMotivationalQuote(): void {
    this.motivationService.refreshQuote();
  }

  private playSound(type: 'complete' | 'success'): void {
    if (!this.appSettings().soundEnabled) return;
    
    // Create audio context for simple sound effects
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'complete') {
          // Happy completion sound
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        } else if (type === 'success') {
          // Success fanfare
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
          oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3); // C6
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.log('Audio not supported or failed:', error);
      }
    }
  }
}
