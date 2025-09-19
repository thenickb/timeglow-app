export interface Profile {
  id: string;
  clerk_id: string;
  credits_remaining: number;
  credits_reset_at: Date | null;
  total_images_processed: number;
  created_at: Date;
  updated_at: Date;
}

export interface Image {
  id: string;
  user_id: string;
  original_url: string;
  original_size_bytes: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  preset_used: PresetType;
  processing_started_at: Date | null;
  processing_completed_at: Date | null;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Restoration {
  id: string;
  image_id: string;
  result_url: string;
  result_size_bytes: number | null;
  reroll_number: number;
  credits_used: number;
  processing_time_ms: number | null;
  gemini_response: any;
  created_at: Date;
}

export interface UsageLog {
  id: string;
  user_id: string;
  action: 'upload' | 'restore' | 'reroll' | 'download';
  credits_consumed: number;
  image_id: string | null;
  metadata: any;
  created_at: Date;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  valid_from: Date | null;
  valid_until: Date | null;
  max_uses: number | null;
  times_used: number;
  created_at: Date;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: string;
  current_period_start: Date | null;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
  created_at: Date;
  updated_at: Date;
}

export type PresetType =
  | 'automagic'
  | 'colorize'
  | 'denoise'
  | 'fix-tears'
  | 'remove-stains'
  | 'enhance-faces'
  | 'film-grain'
  | 'document';

export interface PresetOption {
  id: PresetType;
  name: string;
  description: string;
  icon: string;
  prompt: string;
}