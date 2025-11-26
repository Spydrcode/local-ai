/**
 * Google Business Profile Connector
 *
 * Syncs:
 * - Reviews (star rating, comment, reviewer)
 * - Review replies
 * - Business insights (views, searches, actions)
 *
 * API Docs: https://developers.google.com/my-business/content/overview
 */

import { createClient } from '@supabase/supabase-js';
import {
  ContractorIntegration,
  GoogleBusinessCredentials,
  GoogleBusinessReview,
  SyncResult,
  EntityType,
  BaseConnector,
} from '@/lib/types/contractor-integrations';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class GoogleBusinessProfileConnector implements BaseConnector {
  integration: ContractorIntegration;
  private credentials: GoogleBusinessCredentials;
  private baseUrl = 'https://mybusiness.googleapis.com/v4';

  constructor(integration: ContractorIntegration) {
    this.integration = integration;
    this.credentials = integration.credentials as GoogleBusinessCredentials;
  }

  // ============================================================
  // AUTH
  // ============================================================

  async connect(): Promise<void> {
    // OAuth flow handled by frontend redirect
    // This method validates the connection
    const isValid = await this.testConnection();
    if (!isValid) {
      throw new Error('Failed to connect to Google Business Profile');
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
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: this.credentials.refresh_token!,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();

      this.credentials.access_token = data.access_token;
      this.credentials.expires_at = new Date(Date.now() + data.expires_in * 1000).toISOString();

      await supabase
        .from('contractor_integrations')
        .update({ credentials: this.credentials })
        .eq('id', this.integration.id);
    } catch (error: any) {
      console.error('[GoogleBusinessProfileConnector] Token refresh failed:', error);
      await this.handleError(error.message);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest(
        `accounts/${this.credentials.location_id}/locations/${this.credentials.location_id}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  // ============================================================
  // SYNC REVIEWS
  // ============================================================

  async syncReviews(since?: Date): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      entity_type: 'reviews',
      records_fetched: 0,
      records_inserted: 0,
      records_updated: 0,
      records_failed: 0,
      errors: [],
      duration_ms: 0,
    };

    try {
      console.log(`[GoogleBusinessProfileConnector] Syncing reviews for location ${this.credentials.location_id}`);

      // Fetch reviews from Google
      const reviews = await this.fetchReviews();
      result.records_fetched = reviews.length;

      // Filter by date if provided
      const filteredReviews = since
        ? reviews.filter((r) => new Date(r.createTime) >= since)
        : reviews;

      // Convert to internal format and save
      for (const review of filteredReviews) {
        try {
          const existing = await this.findExistingReview(review.reviewId);

          if (existing) {
            // Update existing review
            await this.updateReview(existing.id, review);
            result.records_updated++;
          } else {
            // Insert new review
            await this.insertReview(review);
            result.records_inserted++;
          }
        } catch (error: any) {
          result.records_failed++;
          result.errors?.push({
            record_id: review.reviewId,
            error: error.message,
          });
        }
      }

      result.success = result.records_failed === 0;
      result.duration_ms = Date.now() - startTime;

      // Log sync
      await this.logSync('reviews', result);

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
      console.error('[GoogleBusinessProfileConnector] Sync failed:', error);
      result.success = false;
      result.duration_ms = Date.now() - startTime;
      await this.handleError(error.message);
      throw error;
    }
  }

  // ============================================================
  // API HELPERS
  // ============================================================

  private async fetchReviews(): Promise<GoogleBusinessReview[]> {
    // NOTE: Real implementation would use Google My Business API
    // For now, return mock data
    console.log('[GoogleBusinessProfileConnector] Fetching reviews (mock data)');

    return [
      {
        reviewId: 'review-1',
        reviewer: {
          displayName: 'John Smith',
          isAnonymous: false,
        },
        starRating: 'FIVE',
        comment: 'Excellent service! Technician was on time and very professional.',
        createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        reviewId: 'review-2',
        reviewer: {
          displayName: 'Jane Doe',
          isAnonymous: false,
        },
        starRating: 'FOUR',
        comment: 'Good work, but took longer than expected.',
        createTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
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
        ...options?.headers,
      },
    });

    // Handle token expiration
    if (response.status === 401) {
      await this.refreshToken();
      // Retry request
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

  private async findExistingReview(reviewId: string): Promise<{ id: string } | null> {
    const internal_id = await this.mapExternalToInternal('reviews', reviewId);
    if (!internal_id) return null;

    // Would query contractor_reviews table (not yet created)
    // For now, return null
    return null;
  }

  private async insertReview(review: GoogleBusinessReview): Promise<void> {
    const stars = this.convertStarRating(review.starRating);

    // Would insert into contractor_reviews table
    // For now, just log
    console.log('[GoogleBusinessProfileConnector] Inserting review:', {
      external_id: review.reviewId,
      stars,
      comment: review.comment,
      reviewer: review.reviewer.displayName,
    });

    // Save mapping (mock internal ID)
    const internal_id = `review-${Date.now()}`;
    await this.saveMapping('reviews', review.reviewId, internal_id);
  }

  private async updateReview(internal_id: string, review: GoogleBusinessReview): Promise<void> {
    const stars = this.convertStarRating(review.starRating);

    // Would update contractor_reviews table
    console.log('[GoogleBusinessProfileConnector] Updating review:', {
      internal_id,
      stars,
      comment: review.comment,
    });
  }

  private convertStarRating(rating: string): number {
    const map: Record<string, number> = {
      ONE: 1,
      TWO: 2,
      THREE: 3,
      FOUR: 4,
      FIVE: 5,
    };
    return map[rating] || 0;
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
