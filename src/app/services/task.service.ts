import { Injectable, signal, inject } from '@angular/core';
import { Task } from '../models/task.model';
import { SecurityService } from './security.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly TASKS_KEY = 'task-checker-tasks';
  private securityService = inject(SecurityService);
  
  private readonly defaultTasks: Task[] = [
    {
      id: '1',
      title: 'Setup Development Environment',
      description: 'Install Node.js, npm, and your preferred code editor',
      category: 'Setup'
    },
    {
      id: '2',
      title: 'Learn TypeScript Basics',
      description: 'Understand types, interfaces, and basic TypeScript syntax',
      category: 'Learning'
    },
    {
      id: '3',
      title: 'Create First Component',
      description: 'Build your first Angular component with template and styles',
      category: 'Development'
    },
    {
      id: '4',
      title: 'Implement Data Binding',
      description: 'Practice property binding, event binding, and two-way binding',
      category: 'Development'
    },
    {
      id: '5',
      title: 'Add Routing',
      description: 'Set up Angular Router and create navigation between pages',
      category: 'Development'
    },
    {
      id: '6',
      title: 'Work with Services',
      description: 'Create a service and inject it into components',
      category: 'Development'
    },
    {
      id: '7',
      title: 'Handle Forms',
      description: 'Implement reactive forms with validation',
      category: 'Development'
    },
    {
      id: '8',
      title: 'Style Components',
      description: 'Add CSS styling and make components responsive',
      category: 'Design'
    },
    {
      id: '9',
      title: 'Add HTTP Client',
      description: 'Make API calls using Angular HttpClient',
      category: 'Development'
    },
    {
      id: '10',
      title: 'Write Unit Tests',
      description: 'Create unit tests for your components and services',
      category: 'Testing'
    },
    {
      id: '11',
      title: 'Optimize Performance',
      description: 'Implement lazy loading and OnPush change detection',
      category: 'Optimization'
    },
    {
      id: '12',
      title: 'Deploy Application',
      description: 'Build and deploy your application to a hosting platform',
      category: 'Deployment'
    }
  ];

  private tasksSignal = signal<Task[]>([]);

  constructor() {
    this.loadTasks();
  }

  get tasks() {
    return this.tasksSignal.asReadonly();
  }

  private loadTasks(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const defaultTasks = this.defaultTasks;
      const storedTasks = this.securityService.safeLocalStorageGet(this.TASKS_KEY, defaultTasks);
      
      // Validate stored tasks
      if (Array.isArray(storedTasks)) {
        const validatedTasks = storedTasks.filter(task => 
          task && 
          typeof task.id === 'string' && 
          typeof task.title === 'string' && 
          typeof task.description === 'string' &&
          typeof task.category === 'string' &&
          this.securityService.validateTaskTitle(task.title)
        );
        
        if (validatedTasks.length === storedTasks.length) {
          this.tasksSignal.set(validatedTasks);
        } else {
          console.warn('Some stored tasks were invalid, using defaults');
          this.tasksSignal.set(defaultTasks);
          this.saveTasks();
        }
      } else {
        this.tasksSignal.set(defaultTasks);
        this.saveTasks();
      }
    } else {
      // Server-side rendering - use default tasks
      this.tasksSignal.set(this.defaultTasks);
    }
  }

  private saveTasks(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const success = this.securityService.safeLocalStorageSet(this.TASKS_KEY, this.tasksSignal());
      if (!success) {
        console.error('Failed to save tasks - data may be too large');
      }
    }
  }

  /**
   * Reset all tasks to their default uncompleted state
   */
  resetAllTasks(): void {
    console.log('TaskService: Resetting all tasks to default state');
    
    // Reset all tasks to incomplete
    const resetTasks = this.defaultTasks.map(task => ({ ...task }));
    this.tasksSignal.set(resetTasks);
    
    // Save the reset state
    this.saveTasks();
    
    console.log('TaskService: All tasks reset to default incomplete state');
  }

  addTask(task: Omit<Task, 'id'>): void {
    const newTask: Task = {
      ...task,
      id: Date.now().toString()
    };
    
    const currentTasks = this.tasksSignal();
    this.tasksSignal.set([...currentTasks, newTask]);
    this.saveTasks();
  }

  updateTask(id: string, updates: Partial<Task>): void {
    const currentTasks = this.tasksSignal();
    const updatedTasks = currentTasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    );
    this.tasksSignal.set(updatedTasks);
    this.saveTasks();
  }

  deleteTask(id: string): void {
    const currentTasks = this.tasksSignal();
    const filteredTasks = currentTasks.filter(task => task.id !== id);
    this.tasksSignal.set(filteredTasks);
    this.saveTasks();
  }

  getTaskById(id: string): Task | undefined {
    return this.tasksSignal().find(task => task.id === id);
  }

  getTasksByCategory(category: string): Task[] {
    return this.tasksSignal().filter(task => task.category === category);
  }

  getAllCategories(): string[] {
    const categories = this.tasksSignal().map(task => task.category);
    return [...new Set(categories)].sort();
  }
}
