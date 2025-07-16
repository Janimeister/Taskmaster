import { inject, Injectable, signal } from '@angular/core';

export interface QuoteData {
  text: string;
  author: string;
  category: string;
}

/**
 * Modern service using signals for async data management
 * Demonstrates latest Angular patterns for data loading
 */
@Injectable({
  providedIn: 'root'
})
export class MotivationService {
  // Signals for state management
  private _quote = signal<QuoteData | null>(null);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);

  // Public readonly signals
  readonly quote = this._quote.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  private quotes: QuoteData[] = [
    {
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
      category: "motivation"
    },
    {
      text: "Don't be afraid to give up the good to go for the great.",
      author: "John D. Rockefeller",
      category: "success"
    },
    {
      text: "If you really look closely, most overnight successes took a long time.",
      author: "Steve Jobs",
      category: "perseverance"
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
      category: "dreams"
    },
    {
      text: "It is during our darkest moments that we must focus to see the light.",
      author: "Aristotle",
      category: "hope"
    },
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      category: "courage"
    }
  ];

  constructor() {
    // Load initial quote
    this.loadQuote();
  }

  // Method to refresh the quote
  async refreshQuote(): Promise<void> {
    this._error.set(null);
    await this.loadQuote();
  }

  private async loadQuote(): Promise<void> {
    this._isLoading.set(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      // Randomly select a quote
      const randomIndex = Math.floor(Math.random() * this.quotes.length);
      this._quote.set(this.quotes[randomIndex]);
      this._error.set(null);
    } catch (error) {
      this._error.set('Failed to load motivational quote');
      console.error('Error loading quote:', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  // Helper methods for template usage
  get hasQuote(): boolean {
    return this._quote() !== null;
  }

  get hasError(): boolean {
    return this._error() !== null;
  }
}
