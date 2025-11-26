/**
 * Integration types for external system connections
 */

export type IntegrationType =
  | 'servicetitan'
  | 'jobber'
  | 'quickbooks'
  | 'google_business_profile'
  | 'indeed'
  | 'facebook_jobs'
  | 'yelp'
  | 'serp_api';

export type IntegrationStatus = 'pending' | 'connected' | 'error' | 'disconnected' | 'expired';
export type SyncFrequency = 'realtime' | 'hourly' | 'daily' | 'manual';
export type SyncType = 'full' | 'incremental' | 'manual';
export type SyncStatus = 'success' | 'partial' | 'failed';
export type EntityType = 'jobs' | 'customers' | 'reviews' | 'rankings' | 'leads' | 'employees' | 'invoices' | 'estimates';
export type AuthType = 'oauth2' | 'api_key' | 'basic_auth' | 'custom';

// Integration connection
export interface ContractorIntegration {
  id: string;
  demo_id: string;
  integration_type: IntegrationType;
  status: IntegrationStatus;
  credentials: ServiceTitanCredentials | JobberCredentials | QuickBooksCredentials | GoogleBusinessCredentials | APIKeyCredentials;
  config: IntegrationConfig;
  auto_sync: boolean;
  sync_frequency: SyncFrequency;
  last_synced_at?: string;
  next_sync_at?: string;
  last_error?: string;
  error_count: number;
  last_error_at?: string;
  connected_at?: string;
  connected_by?: string;
  created_at: string;
  updated_at: string;
}

// Credentials types
export interface ServiceTitanCredentials {
  tenant_id: string;
  client_id: string;
  client_secret: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
}

export interface JobberCredentials {
  client_id: string;
  client_secret: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
}

export interface QuickBooksCredentials {
  realm_id: string; // Company ID
  client_id: string;
  client_secret: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
}

export interface GoogleBusinessCredentials {
  location_id: string; // GBP location ID
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
}

export interface APIKeyCredentials {
  api_key: string;
  api_secret?: string;
}

// Integration config
export interface IntegrationConfig {
  // ServiceTitan
  sync_jobs?: boolean;
  sync_customers?: boolean;
  sync_estimates?: boolean;
  sync_invoices?: boolean;
  sync_technicians?: boolean;

  // Google Business Profile
  sync_reviews?: boolean;
  sync_posts?: boolean;
  sync_insights?: boolean;

  // Jobber
  sync_clients?: boolean;
  sync_quotes?: boolean;
  sync_team?: boolean;
  sync_schedule?: boolean;

  // QuickBooks
  sync_payments?: boolean;
  sync_revenue?: boolean;

  // SerpAPI
  tracked_keywords?: string[];
  location?: string;
}

// Sync log
export interface ContractorSyncLog {
  id: string;
  demo_id: string;
  integration_id: string;
  sync_type: SyncType;
  entity_type: EntityType;
  status: SyncStatus;
  records_fetched: number;
  records_inserted: number;
  records_updated: number;
  records_failed: number;
  error_message?: string;
  error_details?: any;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  triggered_by: 'scheduler' | 'user' | 'webhook';
  metadata?: Record<string, any>;
}

// Data mapping (external ID -> internal ID)
export interface ContractorDataMapping {
  id: string;
  demo_id: string;
  integration_id: string;
  entity_type: EntityType;
  external_id: string; // ServiceTitan job ID, etc.
  internal_id: string; // contractor_jobs.id, etc.
  synced_at: string;
  last_updated_at: string;
  metadata?: Record<string, any>;
}

// Integration template (pre-configured settings)
export interface ContractorIntegrationTemplate {
  id: string;
  integration_type: IntegrationType;
  display_name: string;
  description: string;
  logo_url?: string;
  auth_type: AuthType;
  auth_url?: string;
  token_url?: string;
  scopes?: string[];
  capabilities: Record<string, boolean>;
  default_config: IntegrationConfig;
  setup_instructions?: string;
  help_url?: string;
  is_active: boolean;
  created_at: string;
}

// Integration summary
export interface IntegrationSummary {
  demo_id: string;
  total_integrations: number;
  connected_integrations: number;
  error_integrations: number;
  latest_sync_at?: string;
  integrations_by_type: Record<string, { status: IntegrationStatus; last_synced?: string }>;
}

// OAuth flow
export interface OAuthFlowState {
  demo_id: string;
  integration_type: IntegrationType;
  redirect_uri: string;
  state: string; // CSRF token
  code_verifier?: string; // For PKCE
}

// Sync result
export interface SyncResult {
  success: boolean;
  entity_type: EntityType;
  records_fetched: number;
  records_inserted: number;
  records_updated: number;
  records_failed: number;
  errors?: Array<{ record_id: string; error: string }>;
  duration_ms: number;
}

// Base connector interface
export interface BaseConnector {
  integration: ContractorIntegration;

  // Auth
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  refreshToken(): Promise<void>;
  testConnection(): Promise<boolean>;

  // Sync
  syncJobs?(since?: Date): Promise<SyncResult>;
  syncCustomers?(since?: Date): Promise<SyncResult>;
  syncReviews?(since?: Date): Promise<SyncResult>;
  syncInvoices?(since?: Date): Promise<SyncResult>;

  // Utilities
  mapExternalToInternal(entity_type: EntityType, external_id: string): Promise<string | null>;
  saveMapping(entity_type: EntityType, external_id: string, internal_id: string): Promise<void>;
}

// ServiceTitan-specific types
export interface ServiceTitanJob {
  id: number;
  jobNumber: string;
  customerId: number;
  locationId: number;
  jobStatus: string;
  jobType: string;
  businessUnit: string;
  scheduledOn?: string;
  completedOn?: string;
  total?: number;
  summary?: string;
  invoice?: {
    id: number;
    invoiceNumber: string;
    total: number;
  };
  technicians?: Array<{
    id: number;
    name: string;
  }>;
}

export interface ServiceTitanCustomer {
  id: number;
  name: string;
  email?: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

// Jobber-specific types
export interface JobberJob {
  id: string;
  title: string;
  clientId: string;
  propertyId: string;
  status: string;
  jobNumber: string;
  startAt?: string;
  completedAt?: string;
  totalAmount?: number;
  description?: string;
  lineItems?: Array<{
    name: string;
    quantity: number;
    unitCost: number;
  }>;
  assignedUsers?: Array<{
    id: string;
    name: string;
  }>;
}

export interface JobberClient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  companyName?: string;
  billingAddress?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
}

// QuickBooks-specific types
export interface QuickBooksInvoice {
  Id: string;
  DocNumber: string;
  CustomerId: string;
  TxnDate: string;
  DueDate: string;
  TotalAmt: number;
  Balance: number;
  EmailStatus: string;
  Line: Array<{
    Description: string;
    Amount: number;
    DetailType: string;
  }>;
}

// Google Business Profile types
export interface GoogleBusinessReview {
  reviewId: string;
  reviewer: {
    profilePhotoUrl?: string;
    displayName: string;
    isAnonymous: boolean;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

// SerpAPI types
export interface SerpAPIRanking {
  position: number;
  title: string;
  place_id: string;
  rating?: number;
  reviews?: number;
  type?: string;
  address?: string;
  phone?: string;
  website?: string;
}

export interface SerpAPIResult {
  search_metadata: {
    created_at: string;
    total_time_taken: number;
  };
  local_results: SerpAPIRanking[];
}
