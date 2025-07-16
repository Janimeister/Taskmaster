import { Component, computed } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  imports: [],
  template: `
    @if (userService.currentUser()) {
      <div class="task-list">
        @for (group of groupedTasks(); track group.category) {
          <div class="category-section">
            <div class="category-header">
              <h3 class="category-title">{{ group.category }}</h3>
              <div class="category-progress">
                @let progress = getCategoryProgress(group.tasks);
                <span class="progress-text">{{ progress.completed }}/{{ progress.total }}</span>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    [style.width.%]="progress.percentage"
                  ></div>
                </div>
                <span class="progress-percentage">{{ progress.percentage }}%</span>
              </div>
            </div>
            
            <div class="tasks-grid">
              @for (task of group.tasks; track task.id) {
                <div 
                  class="task-card"
                  [class.completed]="isTaskCompleted(task.id)"
                  (click)="toggleTask(task.id)"
                >
                  <div class="task-checkbox">
                    @if (isTaskCompleted(task.id)) {
                      <svg class="check-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20 8l-1.4-1.4L9 16.2z"/>
                      </svg>
                    }
                  </div>
                  
                  <div class="task-content">
                    <h4 class="task-title">{{ task.title }}</h4>
                    <p class="task-description">{{ task.description }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="no-user-message">
        <h3>Welcome to Task Checker!</h3>
        <p>Please enter your nickname above to start tracking your progress.</p>
      </div>
    }
  `,
  styleUrl: './task-list.css'
})
export class TaskListComponent {
  constructor(
    public taskService: TaskService,
    public userService: UserService
  ) {}

  get groupedTasks() {
    return computed(() => {
      const tasks = this.taskService.tasks();
      const categories = this.taskService.getAllCategories();
      
      return categories.map(category => ({
        category,
        tasks: tasks.filter(task => task.category === category)
      }));
    });
  }

  toggleTask(taskId: string): void {
    if (this.userService.isTaskCompleted(taskId)) {
      this.userService.uncompleteTask(taskId);
    } else {
      this.userService.completeTask(taskId);
    }
  }

  isTaskCompleted(taskId: string): boolean {
    return this.userService.isTaskCompleted(taskId);
  }

  getCategoryProgress(tasks: Task[]): { completed: number; total: number; percentage: number } {
    const total = tasks.length;
    const completed = tasks.filter(task => this.isTaskCompleted(task.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  }
}
