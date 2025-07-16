import { Injectable, signal, computed, inject } from '@angular/core';
import { UserProgress, LeaderboardEntry } from '../models/task.model';
import { TaskService } from './task.service';
import { SecurityService } from './security.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USER_PROGRESS_KEY = 'task-checker-user-progress';
  private readonly CURRENT_USER_KEY = 'task-checker-current-user';
  
  private currentUserSignal = signal<string>('');
  private userProgressSignal = signal<Record<string, UserProgress>>({});
  
  private taskService = inject(TaskService);
  private securityService = inject(SecurityService);

  constructor() {
    this.loadUserData();
  }

  get currentUser() {
    return this.currentUserSignal.asReadonly();
  }

  get userProgress() {
    return this.userProgressSignal.asReadonly();
  }

  get currentUserProgress() {
    return computed(() => {
      const currentUser = this.currentUserSignal();
      const allProgress = this.userProgressSignal();
      return currentUser ? allProgress[currentUser] : null;
    });
  }

  get leaderboard() {
    return computed((): LeaderboardEntry[] => {
      const allProgress = this.userProgressSignal();
      const totalTasks = this.taskService.tasks().length;
      
      return Object.values(allProgress)
        .map(progress => ({
          nickname: progress.nickname,
          completedCount: progress.completedTasks.length,
          completionRate: totalTasks > 0 ? (progress.completedTasks.length / totalTasks) * 100 : 0,
          lastActivity: progress.completedAt.length > 0 
            ? new Date(Math.max(...progress.completedAt.map(date => new Date(date).getTime())))
            : new Date(0)
        }))
        .sort((a, b) => {
          if (a.completedCount !== b.completedCount) {
            return b.completedCount - a.completedCount;
          }
          return b.lastActivity.getTime() - a.lastActivity.getTime();
        });
    });
  }

  private loadUserData(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    // Load current user with security validation
    const currentUser = localStorage.getItem(this.CURRENT_USER_KEY);
    if (currentUser) {
      const validation = this.securityService.validateNickname(currentUser);
      if (validation.isValid) {
        this.currentUserSignal.set(this.securityService.sanitizeInput(currentUser));
      } else {
        console.warn('Invalid stored user nickname, clearing:', validation.error);
        localStorage.removeItem(this.CURRENT_USER_KEY);
      }
    }

    // Load user progress with secure parsing
    const defaultProgress: Record<string, UserProgress> = {};
    const storedProgress = this.securityService.safeLocalStorageGet(
      this.USER_PROGRESS_KEY, 
      defaultProgress
    );
    
    // Validate and sanitize stored progress
    const sanitizedProgress: Record<string, UserProgress> = {};
    for (const [nickname, progress] of Object.entries(storedProgress)) {
      const validation = this.securityService.validateNickname(nickname);
      if (validation.isValid && progress && typeof progress === 'object') {
        const sanitizedNickname = this.securityService.sanitizeInput(nickname);
        sanitizedProgress[sanitizedNickname] = {
          nickname: sanitizedNickname,
          completedTasks: Array.isArray(progress.completedTasks) ? progress.completedTasks : [],
          completedAt: Array.isArray(progress.completedAt) 
            ? progress.completedAt.map(date => new Date(date))
            : []
        };
      }
    }
    
    this.userProgressSignal.set(sanitizedProgress);
  }

  private saveUserData(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      // Save current user with validation
      const currentUser = this.currentUserSignal();
      if (currentUser) {
        const validation = this.securityService.validateNickname(currentUser);
        if (validation.isValid) {
          localStorage.setItem(this.CURRENT_USER_KEY, currentUser);
        } else {
          console.error('Cannot save invalid nickname:', validation.error);
          return;
        }
      }

      // Save user progress with secure storage
      const success = this.securityService.safeLocalStorageSet(
        this.USER_PROGRESS_KEY, 
        this.userProgressSignal()
      );
      
      if (!success) {
        console.error('Failed to save user progress - data may be too large');
      }
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
    }
  }

  setCurrentUser(nickname: string): void {
    // Rate limiting check
    if (this.securityService.isRateLimited('setCurrentUser', 5, 30000)) {
      console.warn('Rate limit exceeded for user login attempts');
      return;
    }

    // Validate and sanitize nickname
    const validation = this.securityService.validateNickname(nickname);
    if (!validation.isValid) {
      console.error('Invalid nickname:', validation.error);
      return;
    }
    
    const sanitizedNickname = this.securityService.sanitizeInput(nickname.trim());
    this.currentUserSignal.set(sanitizedNickname);
    
    // Create user progress entry if it doesn't exist
    const currentProgress = this.userProgressSignal();
    if (!currentProgress[sanitizedNickname]) {
      this.userProgressSignal.set({
        ...currentProgress,
        [sanitizedNickname]: {
          nickname: sanitizedNickname,
          completedTasks: [],
          completedAt: []
        }
      });
    }
    
    this.saveUserData();
  }

  clearCurrentUser(): void {
    this.currentUserSignal.set('');
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
  }

  /**
   * Reset all user data including progress and current user
   */
  resetAllUserData(): void {
    console.log('UserService: Resetting all user data');
    
    // Clear in-memory state
    this.currentUserSignal.set('');
    this.userProgressSignal.set({});
    
    // Clear localStorage data
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // Clear new service-based keys
      localStorage.removeItem(this.CURRENT_USER_KEY);
      localStorage.removeItem(this.USER_PROGRESS_KEY);
      
      // Clear legacy keys for backward compatibility
      localStorage.removeItem('taskApp_allUsers');
      localStorage.removeItem('taskApp_userData');
      
      console.log('UserService: All user data cleared from localStorage');
    }
  }

  completeTask(taskId: string): void {
    const currentUser = this.currentUserSignal();
    if (!currentUser) return;

    const currentProgress = this.userProgressSignal();
    const userProgress = currentProgress[currentUser];
    
    if (!userProgress) return;

    // Check if task is already completed
    if (userProgress.completedTasks.includes(taskId)) return;

    // Add task to completed list
    const updatedProgress = {
      ...currentProgress,
      [currentUser]: {
        ...userProgress,
        completedTasks: [...userProgress.completedTasks, taskId],
        completedAt: [...userProgress.completedAt, new Date()]
      }
    };

    this.userProgressSignal.set(updatedProgress);
    this.saveUserData();
  }

  uncompleteTask(taskId: string): void {
    const currentUser = this.currentUserSignal();
    if (!currentUser) return;

    const currentProgress = this.userProgressSignal();
    const userProgress = currentProgress[currentUser];
    
    if (!userProgress) return;

    const taskIndex = userProgress.completedTasks.indexOf(taskId);
    if (taskIndex === -1) return;

    // Remove task from completed list
    const updatedCompletedTasks = [...userProgress.completedTasks];
    const updatedCompletedAt = [...userProgress.completedAt];
    
    updatedCompletedTasks.splice(taskIndex, 1);
    updatedCompletedAt.splice(taskIndex, 1);

    const updatedProgress = {
      ...currentProgress,
      [currentUser]: {
        ...userProgress,
        completedTasks: updatedCompletedTasks,
        completedAt: updatedCompletedAt
      }
    };

    this.userProgressSignal.set(updatedProgress);
    this.saveUserData();
  }

  isTaskCompleted(taskId: string): boolean {
    const currentUser = this.currentUserSignal();
    if (!currentUser) return false;

    const userProgress = this.userProgressSignal()[currentUser];
    return userProgress ? userProgress.completedTasks.includes(taskId) : false;
  }

  getCompletionStats() {
    return computed(() => {
      const currentUser = this.currentUserSignal();
      if (!currentUser) return { completed: 0, total: 0, percentage: 0 };

      const userProgress = this.userProgressSignal()[currentUser];
      const totalTasks = this.taskService.tasks().length;
      const completed = userProgress ? userProgress.completedTasks.length : 0;

      return {
        completed,
        total: totalTasks,
        percentage: totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0
      };
    });
  }
}
