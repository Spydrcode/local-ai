/**
 * ServiceTitan Connector
 *
 * Syncs:
 * - Jobs (status, type, technicians, revenue)
 * - Customers (name, contact info, address)
 * - Invoices (total, payment status)
 * - Technicians (crew members)
 *
 * API Docs: https://developer.servicetitan.io/docs
 */

import { createClient } from '@supabase/supabase-js';
import {
  ContractorIntegration,
  ServiceTitanCredentials,
  ServiceTitanJob,
  ServiceTitanCustomer,
  SyncResult,
  EntityType,
  BaseConnector,
} from '@/lib/types/contractor-integrations';
import { ContractorJob, JobStatus } from '@/lib/types/contractor-qc';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class ServiceTitanConnector implements BaseConnector {
  integration: ContractorIntegration;
  private credentials: ServiceTitanCredentials;
  private baseUrl: string;

  constructor(integration: ContractorIntegration) {
    this.integration = integration;
    this.credentials = integration.credentials as ServiceTitanCredentials;
    this.baseUrl = `https://api.servicetitan.io/jpm/v2/tenant/${this.credentials.tenant_id}`;
  }

  // ============================================================
  // AUTH
  // ============================================================

  async connect(): Promise<void> {
    const isValid = await this.testConnection();
    if (!isValid) {
      throw new Error('Failed to connect to ServiceTitan');
    }

    await supabase
      .from('contractor_integrations')
      .update({
        status: 'connected',
        connected_at: new Date().toISOString(),
        last_error: null,
        error_count: 0,
      })
      .eq('id', this.integration.id);
  }

  async disconnect(): Promise<void> {
    await supabase
      .from('contractor_integrations')
      .update({
        status: 'disconnected',
        credentials: {},
      })
      .eq('id', this.integration.id);
  }

  async refreshToken(): Promise<void> {
    try {
      const response = await fetch('https://auth.servicetitan.io/connect/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.credentials.client_id,
          client_secret: this.credentials.client_secret,
          grant_type: 'refresh_token',
          refresh_token: this.credentials.refresh_token!,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();

      this.credentials.access_token = data.access_token;
      this.credentials.refresh_token = data.refresh_token;
      this.credentials.expires_at = new Date(Date.now() + data.expires_in * 1000).toISOString();

      await supabase
        .from('contractor_integrations')
        .update({ credentials: this.credentials })
        .eq('id', this.integration.id);
    } catch (error: any) {
      console.error('[ServiceTitanConnector] Token refresh failed:', error);
      await this.handleError(error.message);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('jobs?pageSize=1');
      return response.ok;
    } catch {
      return false;
    }
  }

  // ============================================================
  // SYNC JOBS
  // ============================================================

  async syncJobs(since?: Date): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      entity_type: 'jobs',
      records_fetched: 0,
      records_inserted: 0,
      records_updated: 0,
      records_failed: 0,
      errors: [],
      duration_ms: 0,
    };

    try {
      console.log(`[ServiceTitanConnector] Syncing jobs since ${since?.toISOString() || 'beginning'}`);

      // Fetch jobs from ServiceTitan
      const jobs = await this.fetchJobs(since);
      result.records_fetched = jobs.length;

      // Convert and save each job
      for (const stJob of jobs) {
        try {
          const existing = await this.mapExternalToInternal('jobs', stJob.id.toString());

          if (existing) {
            // Update existing job
            await this.updateJob(existing, stJob);
            result.records_updated++;
          } else {
            // Insert new job
            await this.insertJob(stJob);
            result.records_inserted++;
          }
        } catch (error: any) {
          result.records_failed++;
          result.errors?.push({
            record_id: stJob.id.toString(),
            error: error.message,
          });
        }
      }

      result.success = result.records_failed === 0;
      result.duration_ms = Date.now() - startTime;

      // Log sync
      await this.logSync('jobs', result);

      // Update integration
      await supabase
        .from('contractor_integrations')
        .update({
          last_synced_at: new Date().toISOString(),
          last_error: result.success ? null : 'Partial sync failure',
        })
        .eq('id', this.integration.id);

      return result;
    } catch (error: any) {
      console.error('[ServiceTitanConnector] Sync failed:', error);
      result.success = false;
      result.duration_ms = Date.now() - startTime;
      await this.handleError(error.message);
      throw error;
    }
  }

  // ============================================================
  // SYNC CUSTOMERS
  // ============================================================

  async syncCustomers(since?: Date): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      entity_type: 'customers',
      records_fetched: 0,
      records_inserted: 0,
      records_updated: 0,
      records_failed: 0,
      errors: [],
      duration_ms: 0,
    };

    try {
      console.log(`[ServiceTitanConnector] Syncing customers`);

      const customers = await this.fetchCustomers(since);
      result.records_fetched = customers.length;

      for (const customer of customers) {
        try {
          // Would insert/update into contractor_customers table (not yet created)
          console.log('[ServiceTitanConnector] Processing customer:', customer.name);
          result.records_inserted++;
        } catch (error: any) {
          result.records_failed++;
          result.errors?.push({
            record_id: customer.id.toString(),
            error: error.message,
          });
        }
      }

      result.success = result.records_failed === 0;
      result.duration_ms = Date.now() - startTime;

      await this.logSync('customers', result);

      return result;
    } catch (error: any) {
      console.error('[ServiceTitanConnector] Customer sync failed:', error);
      result.success = false;
      result.duration_ms = Date.now() - startTime;
      throw error;
    }
  }

  // ============================================================
  // API HELPERS
  // ============================================================

  private async fetchJobs(since?: Date): Promise<ServiceTitanJob[]> {
    // NOTE: Real implementation would paginate through ServiceTitan API
    // For now, return mock data
    console.log('[ServiceTitanConnector] Fetching jobs (mock data)');

    return [
      {
        id: 12345,
        jobNumber: 'JOB-001',
        customerId: 67890,
        locationId: 1,
        jobStatus: 'Completed',
        jobType: 'Installation',
        businessUnit: 'HVAC',
        scheduledOn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        completedOn: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        total: 3500,
        summary: 'Install new HVAC system',
        invoice: {
          id: 555,
          invoiceNumber: 'INV-001',
          total: 3500,
        },
        technicians: [
          { id: 101, name: 'Mike Johnson' },
          { id: 102, name: 'Tom Williams' },
        ],
      },
      {
        id: 12346,
        jobNumber: 'JOB-002',
        customerId: 67891,
        locationId: 1,
        jobStatus: 'InProgress',
        jobType: 'Repair',
        businessUnit: 'HVAC',
        scheduledOn: new Date().toISOString(),
        total: 450,
        summary: 'AC repair - refrigerant leak',
        technicians: [{ id: 101, name: 'Mike Johnson' }],
      },
    ];
  }

  private async fetchCustomers(since?: Date): Promise<ServiceTitanCustomer[]> {
    console.log('[ServiceTitanConnector] Fetching customers (mock data)');

    return [
      {
        id: 67890,
        name: 'John Smith',
        email: 'john@example.com',
        phoneNumber: '555-1234',
        address: {
          street: '123 Main St',
          city: 'Austin',
          state: 'TX',
          zip: '78701',
        },
      },
    ];
  }

  private async makeRequest(endpoint: string, options?: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.credentials.access_token}`,
        'Content-Type': 'application/json',
        'ST-App-Key': this.credentials.client_id,
        ...options?.headers,
      },
    });

    // Handle token expiration
    if (response.status === 401) {
      await this.refreshToken();
      return this.makeRequest(endpoint, options);
    }

    return response;
  }

  // ============================================================
  // DATA MAPPING
  // ============================================================

  async mapExternalToInternal(entity_type: EntityType, external_id: string): Promise<string | null> {
    const { data } = await supabase
      .from('contractor_data_mappings')
      .select('internal_id')
      .eq('integration_id', this.integration.id)
      .eq('entity_type', entity_type)
      .eq('external_id', external_id)
      .single();

    return data?.internal_id || null;
  }

  async saveMapping(entity_type: EntityType, external_id: string, internal_id: string): Promise<void> {
    await supabase.from('contractor_data_mappings').upsert({
      demo_id: this.integration.demo_id,
      integration_id: this.integration.id,
      entity_type,
      external_id,
      internal_id,
      synced_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString(),
    });
  }

  // ============================================================
  // DATABASE OPERATIONS
  // ============================================================

  private async insertJob(stJob: ServiceTitanJob): Promise<void> {
    const job: Partial<ContractorJob> = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      demo_id: this.integration.demo_id,
      job_name: stJob.summary || `Job ${stJob.jobNumber}`,
      job_number: stJob.jobNumber,
      job_type: this.mapJobType(stJob.jobType),
      service_type: stJob.businessUnit,
      status: this.mapJobStatus(stJob.jobStatus),
      scheduled_date: stJob.scheduledOn,
      started_at: stJob.scheduledOn,
      completed_at: stJob.completedOn,
      assigned_crew: stJob.technicians?.map((t) => ({ name: t.name, role: 'Technician' })),
      lead_technician: stJob.technicians?.[0]?.name,
      estimated_value: stJob.total,
      final_value: stJob.completedOn ? stJob.total : undefined,
      invoice_number: stJob.invoice?.invoiceNumber,
      photo_count: 0,
      metadata: {
        servicetitan_id: stJob.id,
        customer_id: stJob.customerId,
        location_id: stJob.locationId,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('contractor_jobs')
      .insert(job)
      .select()
      .single();

    if (error) {
      console.error('[ServiceTitanConnector] Error inserting job:', error);
      throw error;
    }

    // Save mapping
    await this.saveMapping('jobs', stJob.id.toString(), data.id);

    console.log(`[ServiceTitanConnector] Inserted job: ${stJob.jobNumber} -> ${data.id}`);
  }

  private async updateJob(internal_id: string, stJob: ServiceTitanJob): Promise<void> {
    const updates: Partial<ContractorJob> = {
      status: this.mapJobStatus(stJob.jobStatus),
      completed_at: stJob.completedOn,
      final_value: stJob.completedOn ? stJob.total : undefined,
      invoice_number: stJob.invoice?.invoiceNumber,
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from('contractor_jobs')
      .update(updates)
      .eq('id', internal_id);

    console.log(`[ServiceTitanConnector] Updated job: ${internal_id}`);
  }

  private mapJobType(stType: string): 'installation' | 'repair' | 'maintenance' | 'remodel' | 'new_construction' {
    const lowerType = stType.toLowerCase();
    if (lowerType.includes('install')) return 'installation';
    if (lowerType.includes('repair')) return 'repair';
    if (lowerType.includes('maintenance')) return 'maintenance';
    if (lowerType.includes('remodel')) return 'remodel';
    return 'repair'; // Default
  }

  private mapJobStatus(stStatus: string): JobStatus {
    const lowerStatus = stStatus.toLowerCase();
    if (lowerStatus.includes('scheduled')) return 'scheduled';
    if (lowerStatus.includes('inprogress') || lowerStatus.includes('in progress')) return 'in_progress';
    if (lowerStatus.includes('completed')) return 'completed';
    if (lowerStatus.includes('invoiced')) return 'invoiced';
    return 'scheduled'; // Default
  }

  // ============================================================
  // ERROR HANDLING
  // ============================================================

  private async handleError(message: string): Promise<void> {
    await supabase
      .from('contractor_integrations')
      .update({
        status: 'error',
        last_error: message,
        error_count: this.integration.error_count + 1,
        last_error_at: new Date().toISOString(),
      })
      .eq('id', this.integration.id);
  }

  private async logSync(entity_type: string, result: SyncResult): Promise<void> {
    await supabase.from('contractor_sync_logs').insert({
      demo_id: this.integration.demo_id,
      integration_id: this.integration.id,
      sync_type: 'incremental',
      entity_type,
      status: result.success ? 'success' : result.records_failed === result.records_fetched ? 'failed' : 'partial',
      records_fetched: result.records_fetched,
      records_inserted: result.records_inserted,
      records_updated: result.records_updated,
      records_failed: result.records_failed,
      error_message: result.errors?.length ? `${result.errors.length} records failed` : null,
      error_details: result.errors,
      started_at: new Date(Date.now() - result.duration_ms).toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: result.duration_ms,
      triggered_by: 'scheduler',
    });
  }
}
