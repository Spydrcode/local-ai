/**
 * Hiring and onboarding types for contractor businesses
 */

export type RoleType =
  | 'installer'
  | 'technician'
  | 'foreman'
  | 'office'
  | 'laborer'
  | 'apprentice'
  | 'dispatcher'
  | 'sales'
  | 'other';

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'seasonal';
export type PayType = 'hourly' | 'salary' | 'per_job' | 'commission';
export type JobPostingStatus = 'draft' | 'active' | 'paused' | 'closed';
export type ApplicantStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export type OnboardingStatus = 'pending' | 'in_progress' | 'completed' | 'abandoned';

export interface JobPosting {
  id: string;
  demo_id: string;
  job_title: string;
  role_type: RoleType;
  employment_type: EmploymentType;
  pay_type: PayType;
  pay_min?: number;
  pay_max?: number;
  pay_currency: string;
  job_ad_title: string;
  job_ad_description: string;
  requirements: string[];
  benefits?: string[];
  screening_questions: ScreeningQuestion[];
  status: JobPostingStatus;
  platforms?: string[];
  posted_at?: string;
  closed_at?: string;
  views_count: number;
  applicants_count: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ScreeningQuestion {
  id?: string;
  question: string;
  type: 'yes_no' | 'text' | 'multiple_choice' | 'number';
  weight: number; // 1-10, importance for scoring
  required: boolean;
  choices?: string[]; // for multiple_choice
  correct_answer?: string | number; // for scoring
  scoring_criteria?: string; // how to evaluate text answers
}

export interface ScreeningResponse {
  question_id: string;
  answer: string | number | boolean;
  score: number; // 0-10 based on question weight
}

export interface Applicant {
  id: string;
  demo_id: string;
  job_posting_id?: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  resume_url?: string;
  portfolio_url?: string;
  screening_responses?: ScreeningResponse[];
  screening_score?: number; // 0-100
  status: ApplicantStatus;
  interview_scheduled_at?: string;
  interview_notes?: string;
  hired_at?: string;
  start_date?: string;
  rejection_reason?: string;
  source?: string;
  metadata?: Record<string, any>;
  applied_at: string;
  updated_at: string;
}

export interface OnboardingChecklistItem {
  id?: string;
  day: number; // 1-7
  task: string;
  owner: 'admin' | 'foreman' | 'manager' | 'hr' | 'self';
  description?: string;
  completed: boolean;
  completed_at?: string;
  notes?: string;
}

export interface OnboardingChecklist {
  id: string;
  demo_id: string;
  applicant_id: string;
  role_type: RoleType;
  start_date: string;
  checklist_items: OnboardingChecklistItem[];
  total_items: number;
  completed_items: number;
  completion_percentage: number;
  status: OnboardingStatus;
  created_at: string;
  completed_at?: string;
  updated_at: string;
}

export interface OnboardingTemplate {
  id: string;
  demo_id?: string;
  role_type: RoleType;
  template_name: string;
  industry?: string;
  checklist_items: Omit<OnboardingChecklistItem, 'id' | 'completed' | 'completed_at' | 'notes'>[];
  is_system_template: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// AI-generated job ad output
export interface GeneratedJobAd {
  job_ad_title: string;
  job_ad_description: string;
  requirements: string[];
  benefits: string[];
  screening_questions: ScreeningQuestion[];
  posting_schedule: PostingSchedule;
  estimated_time_to_hire_days: number;
  expected_applicant_quality: 'low' | 'medium' | 'high' | 'very_high';
  recommended_platforms: PlatformRecommendation[];
}

export interface PostingSchedule {
  primary_day: string; // "Monday"
  primary_time: string; // "9:00 AM"
  refresh_days: string[]; // ["Wednesday", "Friday"]
  reasoning: string;
}

export interface PlatformRecommendation {
  platform: 'indeed' | 'facebook' | 'craigslist' | 'linkedin' | 'ziprecruiter' | 'google_jobs';
  priority: number; // 1-3
  reasoning: string;
  estimated_reach: string;
  cost_estimate?: string;
}

// Hiring agent input/output
export interface HiringAgentInput {
  role_type: RoleType;
  job_title?: string;
  pay_min?: number;
  pay_max?: number;
  pay_type: PayType;
  location: string;
  employment_type: EmploymentType;
  required_certifications?: string[];
  required_experience_years?: number;
  profile: {
    industry: string;
    company_culture?: string;
    existing_benefits?: string[];
    typical_workday?: string;
  };
}

export interface HiringAgentOutput {
  generated_job_ad: GeneratedJobAd;
  onboarding_checklist_preview: OnboardingChecklistItem[];
  hiring_timeline: HiringTimeline;
  recommended_next_steps: string[];
}

export interface HiringTimeline {
  post_job: string; // "Day 1: Post to Indeed and Facebook"
  screening: string; // "Days 2-5: Screen applicants"
  interviews: string; // "Days 6-10: Conduct interviews"
  decision: string; // "Days 11-12: Make offer"
  onboarding: string; // "Days 13-14: Complete paperwork"
  start_date: string; // "Day 15: First day of work"
}

// Applicant analytics
export interface ApplicantFunnel {
  applied: number;
  screening: number;
  interview: number;
  offer: number;
  hired: number;
  conversion_rate: number; // applied -> hired
  avg_time_to_hire_days: number;
}

export interface ApplicantSource {
  source: string;
  count: number;
  hired_count: number;
  conversion_rate: number;
  avg_quality_score: number;
}
