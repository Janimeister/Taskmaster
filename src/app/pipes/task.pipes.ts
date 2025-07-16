import { Pipe, PipeTransform } from '@angular/core';

/**
 * Modern standalone pipe for formatting task completion status
 */
@Pipe({
  name: 'taskStatus',
  standalone: true,
  pure: true
})
export class TaskStatusPipe implements PipeTransform {
  transform(completed: boolean, format: 'icon' | 'text' | 'badge' = 'icon'): string {
    switch (format) {
      case 'icon':
        return completed ? '✅' : '⏳';
      case 'text':
        return completed ? 'Completed' : 'Pending';
      case 'badge':
        return completed ? '🏆 Done' : '📋 Todo';
      default:
        return completed ? '✅' : '⏳';
    }
  }
}

/**
 * Standalone pipe for progress percentage formatting
 */
@Pipe({
  name: 'progressFormat',
  standalone: true,
  pure: true
})
export class ProgressFormatPipe implements PipeTransform {
  transform(
    completed: number, 
    total: number, 
    format: 'percentage' | 'fraction' | 'bar' = 'percentage'
  ): string {
    if (total === 0) return format === 'percentage' ? '0%' : '0/0';

    const percentage = Math.round((completed / total) * 100);

    switch (format) {
      case 'percentage':
        return `${percentage}%`;
      case 'fraction':
        return `${completed}/${total}`;
      case 'bar':
        const barLength = 20;
        const filled = Math.round((percentage / 100) * barLength);
        const empty = barLength - filled;
        return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage}%`;
      default:
        return `${percentage}%`;
    }
  }
}
