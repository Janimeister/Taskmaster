import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  
  /**
   * Sanitizes user input to prevent XSS attacks
   */
  sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove basic HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/script/gi, '') // Remove script references
      .substring(0, 100); // Limit length
  }

  /**
   * Validates nickname input
   */
  validateNickname(nickname: string): { isValid: boolean; error?: string } {
    if (!nickname || typeof nickname !== 'string') {
      return { isValid: false, error: 'Nickname is required' };
    }

    const trimmed = nickname.trim();
    
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Nickname cannot be empty' };
    }

    if (trimmed.length > 50) {
      return { isValid: false, error: 'Nickname must be 50 characters or less' };
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
      return { isValid: false, error: 'Nickname can only contain letters, numbers, spaces, hyphens, and underscores' };
    }

    return { isValid: true };
  }

  /**
   * Securely parses JSON from localStorage with error handling
   */
  safeJSONParse<T>(jsonString: string | null, defaultValue: T): T {
    if (!jsonString) return defaultValue;
    
    try {
      const parsed = JSON.parse(jsonString);
      
      // Basic type validation
      if (typeof parsed !== typeof defaultValue) {
        console.warn('SecurityService: Parsed JSON type mismatch, using default value');
        return defaultValue;
      }
      
      return parsed;
    } catch (error) {
      console.error('SecurityService: Failed to parse JSON safely:', error);
      return defaultValue;
    }
  }

  /**
   * Validates localStorage data size to prevent storage exhaustion
   */
  validateStorageSize(data: string, maxSizeKB: number = 100): boolean {
    const sizeInBytes = new Blob([data]).size;
    const sizeInKB = sizeInBytes / 1024;
    
    if (sizeInKB > maxSizeKB) {
      console.warn(`SecurityService: Data size (${sizeInKB.toFixed(2)}KB) exceeds limit (${maxSizeKB}KB)`);
      return false;
    }
    
    return true;
  }

  /**
   * Safely stores data in localStorage with validation
   */
  safeLocalStorageSet(key: string, value: any): boolean {
    if (!key || typeof key !== 'string') {
      console.error('SecurityService: Invalid localStorage key');
      return false;
    }

    // Server-side rendering check
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }

    try {
      const jsonString = JSON.stringify(value);
      
      if (!this.validateStorageSize(jsonString)) {
        return false;
      }

      localStorage.setItem(key, jsonString);
      return true;
    } catch (error) {
      console.error('SecurityService: Failed to store data safely:', error);
      return false;
    }
  }

  /**
   * Safely retrieves data from localStorage
   */
  safeLocalStorageGet<T>(key: string, defaultValue: T): T {
    if (!key || typeof key !== 'string') {
      console.error('SecurityService: Invalid localStorage key');
      return defaultValue;
    }

    // Server-side rendering check
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      return this.safeJSONParse(item, defaultValue);
    } catch (error) {
      console.error('SecurityService: Failed to retrieve data safely:', error);
      return defaultValue;
    }
  }

  /**
   * Rate limiting for actions (simple implementation)
   */
  private actionTimestamps = new Map<string, number[]>();

  isRateLimited(action: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const timestamps = this.actionTimestamps.get(action) || [];
    
    // Remove timestamps outside the window
    const validTimestamps = timestamps.filter(timestamp => now - timestamp < windowMs);
    
    if (validTimestamps.length >= maxAttempts) {
      console.warn(`SecurityService: Rate limit exceeded for action: ${action}`);
      return true;
    }
    
    // Add current timestamp
    validTimestamps.push(now);
    this.actionTimestamps.set(action, validTimestamps);
    
    return false;
  }

  /**
   * Content Security Policy checker (basic implementation)
   */
  validateTaskTitle(title: string): boolean {
    if (!title || typeof title !== 'string') return false;
    
    // Check for potential XSS vectors
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /<iframe/i,
      /eval\(/i,
      /document\./i,
      /window\./i
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(title));
  }

  /**
   * Generates a simple hash for data integrity checking
   */
  generateSimpleHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Validates data integrity
   */
  validateDataIntegrity(data: string, expectedHash?: string): boolean {
    if (!expectedHash) return true; // No hash to validate against
    
    const actualHash = this.generateSimpleHash(data);
    return actualHash === expectedHash;
  }
}
