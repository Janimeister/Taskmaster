import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-login',
  imports: [FormsModule],
  template: `
    @if (userService.currentUser(); as currentUser) {
      <div class="user-info">
        <div class="welcome-message">
          <span class="greeting">Hello, <strong>{{ currentUser }}</strong>!</span>
          <button class="logout-btn" (click)="onLogout()" title="Logout">
            <span>×</span>
          </button>
        </div>
      </div>
    } @else {
      <div class="login-form">
        <div class="input-group">
          <input 
            type="text" 
            [(ngModel)]="nickname" 
            (keypress)="onKeyPress($event)"
            placeholder="Enter your nickname" 
            class="nickname-input"
            maxlength="30"
          />
          <button 
            (click)="onLogin()" 
            [disabled]="!nickname().trim()"
            class="login-btn"
          >
            Start
          </button>
        </div>
        <p class="login-help">
          Enter a nickname to track your progress and compete with others!
        </p>
      </div>
    }
  `,
  styleUrl: './user-login.css'
})
export class UserLoginComponent {
  nickname = signal('');

  constructor(public userService: UserService) {}

  onLogin(): void {
    const nicknameValue = this.nickname().trim();
    if (nicknameValue) {
      this.userService.setCurrentUser(nicknameValue);
    }
  }

  onLogout(): void {
    this.userService.clearCurrentUser();
    this.nickname.set('');
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onLogin();
    }
  }
}
