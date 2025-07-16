import { Component, ChangeDetectionStrategy, signal, input, output, model, computed, effect, ElementRef } from '@angular/core';
import { MotivationService } from '../services/motivation.service';

export interface SettingsConfig {
  theme: 'light' | 'dark';
  language: 'en' | 'fi';
  soundEnabled: boolean;
  showMotivation: boolean;
}

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Settings Toggle Button - Always visible -->
    <button 
      class="settings-toggle"
      [class.hidden]="isOpen()"
      (click)="openPanel($event)"
      aria-label="Open settings">
      ⚙️
    </button>

    <!-- Settings Panel - Only when open -->
    @if (isOpen()) {
      <div class="settings-panel open">
        
        <!-- Settings Header -->
        <div class="settings-header">
          <h3>⚙️ {{ texts().settings }}</h3>
          <button 
            class="close-btn"
            (click)="closePanel()"
            aria-label="Close settings">
            ✕
          </button>
        </div>

        <!-- Settings Content -->
        <div class="settings-content">
          
          <!-- Theme Setting -->
          <div class="setting-group">
            <label class="setting-label">🎨 {{ texts().theme }}</label>
            <select 
              [value]="settings().theme" 
              (change)="updateTheme($event)">
              <option value="light">{{ texts().light }}</option>
              <option value="dark">{{ texts().dark }}</option>
            </select>
          </div>

          <!-- Language Setting -->
          <div class="setting-group">
            <label class="setting-label">🌐 {{ texts().language }}</label>
            <select 
              [value]="settings().language" 
              (change)="updateLanguage($event)">
              <option value="en">{{ texts().english }}</option>
              <option value="fi">{{ texts().finnish }}</option>
            </select>
          </div>

          <!-- Sound Setting -->
          <div class="setting-group">
            <label class="setting-label">
              <input 
                type="checkbox"
                [checked]="settings().soundEnabled"
                (change)="updateSound($event)">
              🔊 {{ texts().soundEffects }}
            </label>
          </div>

          <!-- Motivation Setting -->
          <div class="setting-group">
            <label class="setting-label">
              <input 
                type="checkbox"
                [checked]="settings().showMotivation"
                (change)="updateMotivation($event)">
              💪 {{ texts().showMotivation }}
            </label>
          </div>

          <!-- Reset Progress Section -->
          <div class="setting-group danger-zone">
            <label class="setting-label danger-label">🗑️ {{ texts().dangerZone }}</label>
            @if (!showResetConfirmation()) {
              <button 
                class="reset-btn"
                (click)="showResetDialog()">
                {{ texts().resetAllProgress }}
              </button>
              <p class="reset-description">{{ texts().resetDescription }}</p>
            } @else {
              <div class="confirmation-dialog">
                <p class="warning-text">⚠️ {{ texts().confirmReset }}</p>
                <p class="warning-text">{{ texts().actionCannotBeUndone }}</p>
                <div class="confirmation-buttons">
                  <button 
                    class="confirm-btn"
                    (click)="confirmReset()">
                    {{ texts().yesDeleteAll }}
                  </button>
                  <button 
                    class="cancel-btn"
                    (click)="cancelReset()">
                    {{ texts().cancel }}
                  </button>
                </div>
              </div>
            }
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .settings-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      max-height: 90vh;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      transform: translateX(100%);
      transition: transform 0.3s ease-out;
      z-index: 1000;
      overflow-y: auto;
      will-change: transform;
    }

    .settings-panel.open {
      transform: translateX(0);
    }

    .settings-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .settings-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .close-btn:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .settings-content {
      padding: 1rem;
      background: white;
      color: #333;
    }

    :host(.theme-dark) .settings-content {
      background: #2d3748 !important;
      color: #fff !important;
    }

    .setting-group {
      margin-bottom: 1.5rem;
    }

    .setting-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      cursor: pointer;
      color: #333;
    }

    :host(.theme-dark) .setting-label {
      color: #fff !important;
    }

    select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      width: 100%;
      cursor: pointer;
      background: white;
      color: #333;
    }

    :host(.theme-dark) select {
      background: #4a5568 !important;
      color: #fff !important;
      border-color: #4a5568 !important;
    }

    input[type="checkbox"] {
      cursor: pointer;
    }

    .danger-zone {
      border-top: 2px solid #dc3545;
      padding-top: 1rem;
      margin-top: 2rem;
    }

    .danger-label {
      color: #dc3545 !important;
      font-weight: 600;
    }

    .reset-btn {
      width: 100%;
      padding: 0.75rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .reset-btn:hover {
      background: #c82333;
      transform: translateY(-1px);
    }

    .reset-description {
      font-size: 0.8rem;
      color: #666;
      margin: 0.5rem 0 0 0;
      font-style: italic;
    }

    :host(.theme-dark) .reset-description {
      color: #a0aec0 !important;
    }

    .confirmation-dialog {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 6px;
      padding: 1rem;
    }

    :host(.theme-dark) .confirmation-dialog {
      background: #4a5568 !important;
      border-color: #667eea !important;
    }

    .warning-text {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      color: #856404;
      font-weight: 500;
    }

    :host(.theme-dark) .warning-text {
      color: #f7fafc !important;
    }

    .confirmation-buttons {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .confirm-btn {
      flex: 1;
      padding: 0.5rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .confirm-btn:hover {
      background: #c82333;
    }

    .cancel-btn {
      flex: 1;
      padding: 0.5rem;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .cancel-btn:hover {
      background: #5a6268;
    }

    .settings-toggle {
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      width: 60px !important;
      height: 60px !important;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white;
      border: none !important;
      font-size: 1.8rem;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      transition: all 0.2s ease;
      z-index: 99999 !important;
      display: flex !important;
      align-items: center;
      justify-content: center;
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
    }

    .settings-toggle.hidden {
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    .settings-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    }

    .settings-toggle:active {
      transform: scale(0.95);
    }
  `]
})
export class SettingsPanelComponent {
  readonly settings = model.required<SettingsConfig>();
  readonly isOpen = input.required<boolean>();
  readonly currentTheme = input.required<'light' | 'dark'>();

  readonly panelOpened = output<void>();
  readonly panelClosed = output<void>();
  readonly resetProgress = output<void>();

  readonly longPressMessage = signal(false);
  readonly showResetConfirmation = signal(false);

  // Translation system for settings panel
  readonly texts = computed(() => {
    const lang = this.settings().language;
    return this.getTexts(lang);
  });

  private getTexts(language: 'en' | 'fi') {
    const translations = {
      en: {
        settings: 'Settings',
        theme: 'Theme',
        language: 'Language',
        soundEffects: 'Sound Effects',
        showMotivation: 'Show Motivation',
        dangerZone: 'Danger Zone',
        resetAllProgress: 'Reset All Progress',
        resetDescription: 'This will permanently delete all user progress data.',
        confirmReset: 'This will permanently delete ALL user progress!',
        actionCannotBeUndone: 'This action cannot be undone.',
        yesDeleteAll: 'Yes, Delete All',
        cancel: 'Cancel',
        light: 'Light',
        dark: 'Dark',
        english: 'English',
        finnish: 'Suomi'
      },
      fi: {
        settings: 'Asetukset',
        theme: 'Teema',
        language: 'Kieli',
        soundEffects: 'Äänitehosteet',
        showMotivation: 'Näytä motivaatio',
        dangerZone: 'Vaaravyöhyke',
        resetAllProgress: 'Nollaa kaikki edistyminen',
        resetDescription: 'Tämä poistaa pysyvästi kaikki käyttäjien edistymistiedot.',
        confirmReset: 'Tämä poistaa pysyvästi KAIKKI käyttäjien edistymistiedot!',
        actionCannotBeUndone: 'Tätä toimintoa ei voi peruuttaa.',
        yesDeleteAll: 'Kyllä, poista kaikki',
        cancel: 'Peruuta',
        light: 'Vaalea',
        dark: 'Tumma',
        english: 'English',
        finnish: 'Suomi'
      }
    };
    return translations[language];
  }

  constructor(public motivationService: MotivationService, private elementRef: ElementRef) {
    effect(() => {
      const theme = this.currentTheme();
      const hostElement = this.elementRef?.nativeElement;
      
      if (!hostElement || typeof document === 'undefined') return;
      
      hostElement.classList.remove('theme-light', 'theme-dark');
      hostElement.classList.add(`theme-${theme}`);
    });
  }

  openPanel(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.panelOpened.emit();
  }

  closePanel(): void {
    this.panelClosed.emit();
  }

  updateTheme(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newTheme = target.value as 'light' | 'dark';
    
    this.settings.update(settings => ({
      ...settings,
      theme: newTheme
    }));
  }

  updateLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newLanguage = target.value as 'en' | 'fi';
    
    this.settings.update(settings => ({
      ...settings,
      language: newLanguage
    }));
  }

  updateSound(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.settings.update(settings => ({
      ...settings,
      soundEnabled: target.checked
    }));
  }

  updateMotivation(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.settings.update(settings => ({
      ...settings,
      showMotivation: target.checked
    }));
  }

  showResetDialog(): void {
    this.showResetConfirmation.set(true);
  }

  cancelReset(): void {
    this.showResetConfirmation.set(false);
  }

  confirmReset(): void {
    this.showResetConfirmation.set(false);
    this.resetProgress.emit();
  }
}
