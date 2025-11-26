/**
 * Quality Control (QC) types for contractor job inspection
 */

export type JobType = 'installation' | 'repair' | 'maintenance' | 'remodel' | 'new_construction';
export type JobStatus =
  | 'scheduled'
  | 'in_progress'
  | 'qc_pending'
  | 'qc_passed'
  | 'qc_failed'
  | 'completed'
  | 'invoiced';

export type PhotoType = 'before' | 'during' | 'after' | 'defect' | 'close_up' | 'overview';
export type QCAssessment = 'pass' | 'fail' | 'needs_review';
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ContractorJob {
  id: string;
  demo_id: string;
  job_name: string;
  job_number?: string;
  job_type: JobType;
  service_type?: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  customer_email?: string;
  status: JobStatus;
  scheduled_date?: string;
  started_at?: string;
  completed_at?: string;
  qc_analyzed_at?: string;
  assigned_crew?: Array<{ name: string; role: string }>;
  lead_technician?: string;
  estimated_value?: number;
  final_value?: number;
  invoice_number?: string;
  qc_result?: QCAnalysisResult;
  qc_pass_fail?: 'pass' | 'fail' | 'needs_review';
  qc_confidence?: number;
  photo_count: number;
  job_notes?: string;
  customer_notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface JobPhoto {
  id: string;
  demo_id: string;
  job_id: string;
  photo_url: string;
  photo_type: PhotoType;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  description?: string;
  location_in_job?: string;
  analyzed: boolean;
  defects_detected?: DetectedDefect[];
  uploaded_by?: string;
  uploaded_at: string;
  metadata?: Record<string, any>;
}

export interface DetectedDefect {
  defect: string;
  severity: IssueSeverity;
  confidence: number; // 0-1
  location_description?: string;
}

export interface QCChecklistItem {
  category: string;
  item: string;
  inspection_method: string;
  pass_criteria: string;
}

export interface CommonDefect {
  defect_name: string;
  severity: IssueSeverity;
  visual_indicators: string;
}

export interface QCChecklist {
  id: string;
  demo_id?: string;
  job_type: JobType;
  service_type?: string;
  industry: string;
  checklist_name: string;
  checklist_items: QCChecklistItem[];
  common_defects?: CommonDefect[];
  is_system_template: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PunchListItem {
  issue: string;
  severity: IssueSeverity;
  photo_ref?: string; // photo_id or filename
  location?: string; // Where in the job
  remediation: string; // How to fix
  confidence: number; // 0-1
  estimated_time?: string; // "15 minutes", "1 hour"
}

export interface SafetyFlag {
  issue: string;
  photo_ref?: string;
  severity: IssueSeverity;
  immediate_action_required: boolean;
}

export interface QCAnalysisResult {
  overall_assessment: QCAssessment;
  confidence_score: number; // 0-1
  punch_list_items: PunchListItem[];
  critical_issues_count: number;
  minor_issues_count: number;
  safety_flags?: SafetyFlag[];
  customer_message_template: string;
  analysis_notes: string;
  photos_analyzed: number;
  ai_model: string;
}

export interface QCAnalysis {
  id: string;
  demo_id: string;
  job_id: string;
  analyzed_at: string;
  analyzed_by?: string;
  photo_ids: string[];
  photo_count: number;
  overall_assessment: QCAssessment;
  confidence_score: number;
  punch_list_items: PunchListItem[];
  critical_issues_count: number;
  minor_issues_count: number;
  safety_flags?: SafetyFlag[];
  customer_message_template: string;
  analysis_notes: string;
  ai_model: string;
  metadata?: Record<string, any>;
}

// QC Agent input/output
export interface QCAgentInput {
  job_type: JobType;
  service_type?: string;
  industry: string;
  photos: Array<{
    url: string;
    type: PhotoType;
    description?: string;
  }>;
  checklist?: QCChecklistItem[];
  common_defects?: CommonDefect[];
}

export interface QCAgentOutput {
  analysis: QCAnalysisResult;
  next_steps: string[];
  recommended_actions: Array<{
    action: string;
    priority: number;
    reasoning: string;
  }>;
}

// Photo analysis (individual photo)
export interface PhotoAnalysis {
  photo_id: string;
  photo_url: string;
  detected_issues: DetectedDefect[];
  quality_indicators: {
    focus: 'good' | 'fair' | 'poor';
    lighting: 'good' | 'fair' | 'poor';
    angle: 'good' | 'fair' | 'poor';
    completeness: 'complete' | 'partial' | 'insufficient';
  };
  notes: string;
}

// Batch QC results
export interface BatchQCResult {
  job_id: string;
  total_photos: number;
  photos_analyzed: number;
  overall_pass_rate: number; // 0-1
  defects_by_severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  estimated_rework_hours: number;
}
