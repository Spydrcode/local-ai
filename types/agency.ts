// Agency and White-Label Types

export interface AgencyBranding {
  id: string;
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
  websiteUrl?: string;
}

export interface Agency extends AgencyBranding {
  // Free tool - no billing
  monthlyReportLimit: number; // For future tiering if needed
  reportsUsedThisMonth: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  agencyId: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  invitedAt: string;
  invitedByEmail?: string;
  acceptedAt?: string;
  canExport: boolean;
  canInvite: boolean;
}

export interface ActivityLogEntry {
  id: string;
  agencyId: string;
  demoId?: string;
  userEmail: string;
  action: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
