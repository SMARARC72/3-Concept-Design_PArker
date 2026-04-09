/**
 * Security utilities for input sanitization and COPPA compliance
 */

export function sanitizeInput(input: string, maxLength: number = 500): string {
  if (!input) return '';
  
  // Strip HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove script tags and event handlers
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  // Enforce max length
  return sanitized.slice(0, maxLength);
}

export function detectAgeIndicator(message: string): number | null {
  const lowerMessage = message.toLowerCase();
  
  // Direct age statements
  const agePatterns = [
    /i am (\d+) years? old/,
    /i'm (\d+) years? old/,
    /im (\d+) years? old/,
    /i am (\d+)/,
    /i'm (\d+)/,
    /(\d+) years? old/
  ];
  
  for (const pattern of agePatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      const age = parseInt(match[1], 10);
      if (age >= 0 && age <= 120) return age;
    }
  }
  
  // Grade-based inference
  const gradePatterns = [
    /(\d+)(?:th|st|nd|rd) grade/,
    /in grade (\d+)/,
    /i'm in (\d+)(?:th|st|nd|rd)/,
    /i am in (\d+)(?:th|st|nd|rd)/
  ];
  
  for (const pattern of gradePatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      const grade = parseInt(match[1], 10);
      // Approximate age: grade + 5-6
      return grade + 5;
    }
  }
  
  return null;
}

export function handlePotentialChild(userInput: string): {
  isChild: boolean;
  response?: string;
  shouldRedirect: boolean;
} {
  const age = detectAgeIndicator(userInput);
  
  if (age !== null && age < 13) {
    return {
      isChild: true,
      response: "Hey there! I'd love to help, but I need to chat with a parent or guardian. Can you grab a grown-up for me?",
      shouldRedirect: true
    };
  }
  
  return { isChild: false, shouldRedirect: false };
}

export function containsPII(text: string): boolean {
  const piiPatterns = [
    // Phone numbers
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
    // Email addresses
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    // Full names (simplified check)
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/,
    // Addresses (simplified)
    /\d+\s+\w+\s+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|court|ct|circle|cir|boulevard|blvd)/i,
    // School names
    /\b\w+\s+(?:elementary|middle school|high school|primary school)\b/i
  ];
  
  return piiPatterns.some(pattern => pattern.test(text));
}

export function validateCoppaSafety(input: string): {
  safe: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  
  if (containsPII(input)) {
    violations.push('Potential PII detected');
  }
  
  const age = detectAgeIndicator(input);
  if (age !== null && age < 13) {
    violations.push('Child user detected - parental consent required');
  }
  
  return {
    safe: violations.length === 0,
    violations
  };
}

export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
