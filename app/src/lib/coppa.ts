/**
 * COPPA compliance utilities for ParkerJoe
 */

import { supabase } from '../services/supabaseApi';

export interface CoppaConfig {
  suppressAnalytics: boolean;
  suppressMarketing: boolean;
  allowChat: boolean;
  dataRetentionDays: number;
}

export const COPPA_CONFIG: Record<string, CoppaConfig> = {
  true: { // Child account
    suppressAnalytics: true,
    suppressMarketing: true,
    allowChat: true, // But with restrictions
    dataRetentionDays: 30
  },
  false: { // Adult/parent account
    suppressAnalytics: false,
    suppressMarketing: false,
    allowChat: true,
    dataRetentionDays: 365 * 2 // 2 years
  }
};

export function shouldSuppressTrackers(isChildAccount: boolean): boolean {
  return isChildAccount || COPPA_CONFIG[String(isChildAccount)].suppressAnalytics;
}

export function getCoppaCompliantAnalyticsConfig(isChildAccount: boolean): {
  enabled: boolean;
  anonymizeIp: boolean;
  allowAdFeatures: boolean;
} {
  return {
    enabled: !isChildAccount,
    anonymizeIp: true,
    allowAdFeatures: false
  };
}

export async function verifyParentalConsent(
  customerId: string, 
  method: 'credit_card' | 'form_upload' | 'video_call'
): Promise<boolean> {
  try {
    // Update customer profile with consent verification
    const { error } = await supabase
      .from('customer_profiles')
      .update({
        parental_consent_verified: true,
        parental_consent_method: method,
        parental_consent_date: new Date().toISOString()
      })
      .eq('id', customerId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    return false;
  }
}

export function isCoppaComplianceRequired(userAge?: number): boolean {
  if (userAge === undefined) return true; // Default to strict when unknown
  return userAge < 13;
}

export const COPPA_SAFE_QUESTIONS = [
  'What size does he wear?',
  'What occasion is this for?',
  'What\'s your budget range?',
  'Do you prefer a specific brand?',
  'What colors do you like?'
];

export const COPPA_UNSAFE_QUESTIONS = [
  'What is his name?',
  'How old is he?',
  'What school does he go to?',
  'Where do you live?',
  'Can you send a photo?'
];
