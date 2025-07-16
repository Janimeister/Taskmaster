import { Directive, ElementRef, input, effect, untracked } from '@angular/core';

/**
 * Modern standalone directive using input signals and effects
 * for auto-focusing elements with enhanced behavior
 */
@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective {
  // Input signal with transformer
  enabled = input(true, {
    transform: (value: unknown) => {
      if (typeof value === 'string') {
        return value !== 'false' && value !== '';
      }
      return Boolean(value);
    }
  });

  // Delay input with default value and number transformer
  delay = input(0, {
    transform: (value: string | number) => {
      const num = typeof value === 'string' ? parseInt(value, 10) : value;
      return isNaN(num) ? 0 : Math.max(0, num);
    }
  });

  constructor(private elementRef: ElementRef<HTMLElement>) {
    // Effect to handle auto-focus behavior
    effect(() => {
      const shouldFocus = this.enabled();
      const delayMs = this.delay();

      if (shouldFocus && this.elementRef.nativeElement) {
        untracked(() => {
          if (delayMs > 0) {
            setTimeout(() => {
              this.focusElement();
            }, delayMs);
          } else {
            this.focusElement();
          }
        });
      }
    });
  }

  private focusElement(): void {
    const element = this.elementRef.nativeElement;
    
    if (element && typeof element.focus === 'function') {
      // Enhanced focus with selection for input elements
      element.focus();
      
      if ((element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) && 
          typeof element.select === 'function') {
        // Only select if the select method exists and it's an input/textarea
        try {
          element.select();
        } catch (error) {
          // Silently ignore selection errors
          console.debug('Could not select element content:', error);
        }
      }
    }
  }
}
