import { Component, signal, computed, viewChild, ElementRef, effect, afterNextRender, inject } from '@angular/core';
import { TaskManagerComponent } from './components/task-manager';
import { AppStatsService } from './services/app-stats.service';
import { SecurityService } from './services/security.service';

@Component({
  selector: 'app-root',
  imports: [TaskManagerComponent],
  template: `
    <div class="app-container" [class]="'theme-' + currentTheme()">
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title">{{ texts().title }}</h1>
          <p class="app-subtitle">{{ texts().subtitle }}</p>
          @if (lastActivity()) {
            <p class="activity-indicator">{{ lastActivity() }}</p>
          }
          <div class="theme-controls">
            <button 
              (click)="toggleLanguage()" 
              class="language-btn"
              [title]="currentLanguage() === 'en' ? 'Vaihda suomeksi' : 'Switch to English'"
            >
              {{ currentLanguage() === 'en' ? '🇫🇮' : '🇺🇸' }}
            </button>
            <button 
              (click)="toggleTheme()" 
              class="theme-btn"
              [class.dark]="currentTheme() === 'dark'"
            >
              {{ currentTheme() === 'light' ? '🌙' : '☀️' }} 
              {{ currentTheme() === 'light' ? texts().darkMode : texts().lightMode }}
            </button>
          </div>
        </div>
      </header>

      <main class="app-main">
        <app-task-manager 
          #taskManagerRef
          [theme]="currentTheme()"
          [maxTasks]="10"
          [showCelebration]="true"
          [autoFocus]="true"
          [taskTitle]="'🚀 Your Development Journey'"
          (userLoggedIn)="onUserLoggedIn($event)"
          (userLoggedOut)="onUserLoggedOut()"
          (taskCompleted)="onTaskCompleted($event)"
          (taskUncompleted)="onTaskUncompleted($event)"
          (allTasksCompleted)="onAllTasksCompleted($event)"
          (progressChanged)="onProgressChanged($event)"
          (themeChanged)="onThemeChanged($event)"
          (languageChanged)="onLanguageChanged($event)"
        ></app-task-manager>
        
        <div class="features-section">
          <h2>{{ texts().whyChoose }}</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">✅</div>
              <h3>{{ texts().progressTracking }}</h3>
              <p>{{ texts().progressTrackingDesc }}</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">💾</div>
              <h3>{{ texts().autoSave }}</h3>
              <p>{{ texts().autoSaveDesc }}</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">📱</div>
              <h3>{{ texts().responsive }}</h3>
              <p>{{ texts().responsiveDesc }}</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">⚡</div>
              <h3>{{ texts().fastModern }}</h3>
              <p>{{ texts().fastModernDesc }}</p>
            </div>
          </div>
        </div>
      </main>

      <footer class="app-footer">
        <div class="footer-content">
          <p>&copy; {{ currentYear() }} Janimeister {{ texts().title }}. {{ texts().footer }}</p>
        </div>
      </footer>
    </div>
  `,
  styleUrl: './app.css'
})
export class App {
  title = signal('Task Tracker');
  lastActivity = signal('');
  currentTheme = signal<'light' | 'dark'>('light');
  currentLanguage = signal<'en' | 'fi'>('en');
  
  // ViewChild to access the task manager component
  taskManagerRef = viewChild<TaskManagerComponent>('taskManagerRef');

  // Computed property for current year
  currentYear = computed(() => new Date().getFullYear());

  private statsService = inject(AppStatsService);
  private securityService = inject(SecurityService);

  // Translation system
  texts = computed(() => {
    const lang = this.currentLanguage();
    return this.getTexts(lang);
  });

  private getTexts(language: 'en' | 'fi') {
    const translations = {
      en: {
        title: 'Taskmaster',
        subtitle: 'Web application for fun task tracking',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        whyChoose: 'Why Choose Taskmaster?',
        progressTracking: 'Progress Tracking',
        progressTrackingDesc: 'Visual progress indicators and completion statistics',
        autoSave: 'Auto-Save',
        autoSaveDesc: 'Your progress is automatically saved in your browser',
        responsive: 'Responsive',
        responsiveDesc: 'Works perfectly on desktop, tablet, and mobile',
        fastModern: 'Fast & Modern',
        fastModernDesc: 'Built with Angular 20 and latest web technologies',
        footer: 'Built with ❤️ and with GitHub Copilot.',
        // Status messages
        switchedToTheme: 'Switched to {theme} theme',
        languageChangedTo: 'Language changed to {language}',
        welcomeUser: 'Welcome {username}! (Login #{count})',
        userLoggedOut: 'User logged out',
        taskCompleted: 'Completed: {task} (Total: {count})',
        taskUnchecked: 'Unchecked: {task}',
        allTasksCompleted: '{username} completed all tasks! Average: {average} tasks/user',
        english: 'English',
        finnish: 'Finnish',
        lightTheme: 'light',
        darkTheme: 'dark'
      },
      fi: {
        title: 'Taskmaster',
        subtitle: 'Webbisovellus hauskojen tehtävien tekemiseen',
        darkMode: 'Tumma tila',
        lightMode: 'Vaalea tila',
        whyChoose: 'Miksi valita Taskmaster?',
        progressTracking: 'Edistymisen seuranta',
        progressTrackingDesc: 'Visuaaliset edistymisindikaattorit ja valmistumistilastot',
        autoSave: 'Automaattitallennus',
        autoSaveDesc: 'Edistymisesi tallennetaan automaattisesti selaimeen',
        responsive: 'Responsiivinen',
        responsiveDesc: 'Toimii täydellisesti työpöydällä, tabletilla ja mobiilissa',
        fastModern: 'Nopea ja moderni',
        fastModernDesc: 'Rakennettu Angular 20:lla ja uusimmilla web-teknologioilla',
        footer: 'Rakennettu ❤️:lla ja GitHub Copilotin avulla.',
        // Status messages
        switchedToTheme: 'Vaihdettu {theme} teemaan',
        languageChangedTo: 'Kieli vaihdettu: {language}',
        welcomeUser: 'Tervetuloa {username}! (Kirjautuminen #{count})',
        userLoggedOut: 'Käyttäjä kirjautui ulos',
        taskCompleted: 'Valmis: {task} (Yhteensä: {count})',
        taskUnchecked: 'Merkitty keskeneräiseksi: {task}',
        allTasksCompleted: '{username} suoritti kaikki tehtävät! Keskiarvo: {average} tehtävää/käyttäjä',
        english: 'englanti',
        finnish: 'suomi',
        lightTheme: 'vaalea',
        darkTheme: 'tumma'
      }
    };
    return translations[language];
  }

  // Helper method for string interpolation
  private interpolate(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return values[key]?.toString() || match;
    });
  }

  constructor() {
    // Load theme and language from localStorage on startup
    if (typeof localStorage !== 'undefined') {
      const savedSettings = this.securityService.safeLocalStorageGet<any>('appSettings', null);
      if (savedSettings) {
        this.currentTheme.set(savedSettings.theme || 'light');
        this.currentLanguage.set(savedSettings.language || 'en');
        console.log('Loaded header theme and language from localStorage:', savedSettings.theme, savedSettings.language);
      }
    }

    // Apply theme class to body element
    effect(() => {
      if (typeof document !== 'undefined') {
        const body = document.body;
        const currentTheme = this.currentTheme();
        
        // Remove existing theme classes
        body.classList.remove('theme-light', 'theme-dark');
        
        // Add current theme class
        body.classList.add(`theme-${currentTheme}`);
        
        console.log(`Applied theme-${currentTheme} to body element`);
      }
    });

    // Sync the header theme and language with task manager's saved settings
    afterNextRender(() => {
      const taskManager = this.taskManagerRef();
      if (taskManager) {
        const savedTheme = taskManager.appSettings().theme;
        const savedLanguage = taskManager.appSettings().language;
        
        if (savedTheme !== this.currentTheme()) {
          this.currentTheme.set(savedTheme);
          console.log('Synced header theme with task manager settings:', savedTheme);
        }
        
        if (savedLanguage !== this.currentLanguage()) {
          this.currentLanguage.set(savedLanguage);
          console.log('Synced header language with task manager settings:', savedLanguage);
        }
      }
    });
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(newTheme);
    
    const texts = this.texts();
    const themeText = newTheme === 'light' ? texts.lightTheme : texts.darkTheme;
    const message = this.interpolate(texts.switchedToTheme, { theme: themeText });
    this.lastActivity.set(`🎨 ${message}`);
    
    // Also update the task manager's settings
    const taskManager = this.taskManagerRef();
    if (taskManager && taskManager.appSettings) {
      try {
        taskManager.appSettings.update(settings => ({
          ...settings,
          theme: newTheme
        }));
        console.log('Updated task manager theme from header toggle:', newTheme);
      } catch (error) {
        console.log('Failed to update task manager theme:', error);
        // Fallback: Save directly to localStorage
        this.updateLocalStorage({ theme: newTheme });
      }
    } else {
      console.log('Task manager not available, saving to localStorage');
      this.updateLocalStorage({ theme: newTheme });
    }
  }

  toggleLanguage(): void {
    const newLanguage = this.currentLanguage() === 'en' ? 'fi' : 'en';
    this.currentLanguage.set(newLanguage);
    
    const texts = this.texts();
    const languageText = newLanguage === 'en' ? texts.english : texts.finnish;
    const message = this.interpolate(texts.languageChangedTo, { language: languageText });
    this.lastActivity.set(`🌐 ${message}`);
    
    // Also update the task manager's settings
    const taskManager = this.taskManagerRef();
    if (taskManager && taskManager.appSettings) {
      try {
        taskManager.appSettings.update(settings => ({
          ...settings,
          language: newLanguage
        }));
        console.log('Updated task manager language from header toggle:', newLanguage);
      } catch (error) {
        console.log('Failed to update task manager language:', error);
        // Fallback: Save directly to localStorage
        this.updateLocalStorage({ language: newLanguage });
      }
    } else {
      console.log('Task manager not available, saving to localStorage');
      this.updateLocalStorage({ language: newLanguage });
    }
  }

  private updateLocalStorage(updates: Partial<{ theme: 'light' | 'dark'; language: 'en' | 'fi' }>): void {
    if (typeof localStorage !== 'undefined') {
      // Use SecurityService for safe localStorage operations
      const currentSettings = this.securityService.safeJSONParse(
        localStorage.getItem('appSettings'), 
        {"theme":"light","language":"en","soundEnabled":true,"showMotivation":false}
      );
      Object.assign(currentSettings, updates);
      this.securityService.safeLocalStorageSet('appSettings', currentSettings);
      console.log('Updated settings in localStorage:', updates);
    }
  }

  onThemeChanged(theme: 'light' | 'dark' | 'auto'): void {
    // Convert 'auto' to 'light' for the header toggle (since header only supports light/dark)
    const headerTheme = theme === 'auto' ? 'light' : theme;
    this.currentTheme.set(headerTheme);
    
    const texts = this.texts();
    const themeText = theme === 'light' ? texts.lightTheme : theme === 'dark' ? texts.darkTheme : 'auto';
    const message = this.interpolate(texts.switchedToTheme, { theme: themeText });
    this.lastActivity.set(`🎨 ${message}`);
    console.log('Theme changed from settings:', theme);
  }

  onLanguageChanged(language: 'en' | 'fi'): void {
    this.currentLanguage.set(language);
    
    const texts = this.texts();
    const languageText = language === 'en' ? texts.english : texts.finnish;
    const message = this.interpolate(texts.languageChangedTo, { language: languageText });
    this.lastActivity.set(`🌐 ${message}`);
    console.log('Language changed from settings:', language);
    
    // Also update localStorage to keep sync
    this.updateLocalStorage({ language: language });
  }

  onUserLoggedIn(username: string): void {
    this.statsService.recordLogin(username);
    const texts = this.texts();
    const message = this.interpolate(texts.welcomeUser, { 
      username: username, 
      count: this.statsService.stats().totalLogins 
    });
    this.lastActivity.set(`👋 ${message}`);
    console.log('User logged in:', username);
  }

  onUserLoggedOut(): void {
    const texts = this.texts();
    this.lastActivity.set(`👋 ${texts.userLoggedOut}`);
    console.log('User logged out');
  }

  onTaskCompleted(task: any): void {
    this.statsService.recordTaskCompletion();
    const texts = this.texts();
    const message = this.interpolate(texts.taskCompleted, { 
      task: task.title, 
      count: this.statsService.stats().totalTasksCompleted 
    });
    this.lastActivity.set(`✅ ${message}`);
    console.log('Task completed:', task);
  }

  onTaskUncompleted(task: any): void {
    this.statsService.recordTaskUncompletion();
    const texts = this.texts();
    const message = this.interpolate(texts.taskUnchecked, { task: task.title });
    this.lastActivity.set(`◻️ ${message}`);
    console.log('Task uncompleted:', task);
  }

  onAllTasksCompleted(username: string): void {
    const texts = this.texts();
    const message = this.interpolate(texts.allTasksCompleted, { 
      username: username, 
      average: this.statsService.averageTasksPerUser() 
    });
    this.lastActivity.set(`🎉 ${message}`);
    console.log('All tasks completed by:', username);
  }

  onProgressChanged(progress: { completed: number; total: number; percentage: number }): void {
    console.log('Progress updated:', progress);
    // Could emit to analytics, update global state, etc.
  }
}
