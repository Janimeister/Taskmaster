import { Directive, ElementRef, input, output, effect, signal } from '@angular/core';

/**
 * Modern host directive for adding click-outside functionality
 * Demonstrates composition pattern with directives
 */
@Directive({
  selector: '[appClickOutside]',
  standalone: true,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:touchstart)': 'onDocumentClick($event)'
  }
})
export class ClickOutsideDirective {
  // Input signal for enabling/disabling the directive
  enabled = input(true);
  
  // Output signal for when click outside occurs
  clickOutside = output<Event>();

  constructor(private elementRef: ElementRef) {}

  onDocumentClick(event: Event): void {
    if (!this.enabled()) return;

    const target = event.target as Node;
    const element = this.elementRef.nativeElement;

    if (element && !element.contains(target)) {
      this.clickOutside.emit(event);
    }
  }
}

/**
 * Modern directive for long press gesture detection
 */
@Directive({
  selector: '[appLongPress]',
  standalone: true,
  host: {
    '(mousedown)': 'onMouseDown($event)',
    '(mouseup)': 'onMouseUp($event)',
    '(mouseleave)': 'onMouseUp($event)',
    '(touchstart)': 'onTouchStart($event)',
    '(touchend)': 'onTouchEnd($event)',
    '(touchcancel)': 'onTouchEnd($event)'
  }
})
export class LongPressDirective {
  // Input signals with transformers
  duration = input(800, {
    transform: (value: string | number) => {
      const num = typeof value === 'string' ? parseInt(value, 10) : value;
      return isNaN(num) ? 800 : Math.max(100, num);
    }
  });

  enabled = input(true);

  // Output signals
  longPress = output<Event>();
  longPressStart = output<Event>();
  longPressEnd = output<Event>();

  private timer = signal<number | null>(null);
  private isPressed = signal(false);

  onMouseDown(event: MouseEvent): void {
    this.startPress(event);
  }

  onMouseUp(event: MouseEvent): void {
    this.endPress(event);
  }

  onTouchStart(event: TouchEvent): void {
    this.startPress(event);
  }

  onTouchEnd(event: TouchEvent): void {
    this.endPress(event);
  }

  private startPress(event: Event): void {
    if (!this.enabled()) return;

    this.isPressed.set(true);
    this.longPressStart.emit(event);

    const timerId = window.setTimeout(() => {
      if (this.isPressed()) {
        this.longPress.emit(event);
      }
    }, this.duration());

    this.timer.set(timerId);
  }

  private endPress(event: Event): void {
    if (!this.enabled()) return;

    this.isPressed.set(false);
    this.longPressEnd.emit(event);

    const timerId = this.timer();
    if (timerId !== null) {
      clearTimeout(timerId);
      this.timer.set(null);
    }
  }
}
