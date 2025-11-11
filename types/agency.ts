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
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan: 'solo' | 'starter' | 'pro' | 'enterprise';
  monthlyReportLimit: number;
  reportsUsedThisMonth: number;
  billingCycleStart?: string;
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

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number; // in cents
  annualPrice?: number; // in cents
  reportLimit: number; // -1 for unlimited
  teamMemberLimit: number; // -1 for unlimited
  features: {
    exports: string[];
    white_label: 'logo_only' | 'full' | 'full_plus_templates' | 'custom_domain';
    api_access: boolean | 'limited' | 'unlimited';
    priority_support: boolean;
    custom_templates: boolean;
    dedicated_manager?: boolean;
    sla?: boolean;
    reseller_rights?: boolean;
  };
  isActive: boolean;
  createdAt: string;
}

export const PRICING_TIERS: PricingPlan[] = [
  {
    id: 'solo',
    name: 'Solo Consultant',
    monthlyPrice: 9900,
    annualPrice: 99000,
    reportLimit: 10,
    teamMemberLimit: 1,
    features: {
      exports: ['pdf'],
      white_label: 'logo_only',
      api_access: false,
      priority_support: false,
      custom_templates: false,
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'starter',
    name: 'Agency Starter',
    monthlyPrice: 29900,
    annualPrice: 299000,
    reportLimit: 50,
    teamMemberLimit: 3,
    features: {
      exports: ['pdf', 'pptx', 'excel'],
      white_label: 'full',
      api_access: 'limited',
      priority_support: true,
      custom_templates: false,
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pro',
    name: 'Agency Pro',
    monthlyPrice: 69900,
    annualPrice: 699000,
    reportLimit: -1,
    teamMemberLimit: 10,
    features: {
      exports: ['pdf', 'pptx', 'excel'],
      white_label: 'full_plus_templates',
      api_access: 'unlimited',
      priority_support: true,
      custom_templates: true,
      dedicated_manager: true,
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 0, // Custom pricing
    reportLimit: -1,
    teamMemberLimit: -1,
    features: {
      exports: ['pdf', 'pptx', 'excel'],
      white_label: 'custom_domain',
      api_access: 'unlimited',
      priority_support: true,
      custom_templates: true,
      dedicated_manager: true,
      sla: true,
      reseller_rights: true,
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export function getPlanFeatures(planId: string): string[] {
  const plan = PRICING_TIERS.find(p => p.id === planId);
  if (!plan) return [];

  const features: string[] = [];

  if (plan.reportLimit === -1) {
    features.push('Unlimited client analyses');
  } else {
    features.push(`${plan.reportLimit} client analyses/month`);
  }

  if (plan.teamMemberLimit === -1) {
    features.push('Unlimited team members');
  } else {
    features.push(`${plan.teamMemberLimit} team member${plan.teamMemberLimit > 1 ? 's' : ''}`);
  }

  if (plan.features.exports.includes('pdf')) {
    features.push('PDF exports');
  }
  if (plan.features.exports.includes('pptx')) {
    features.push('PowerPoint exports');
  }
  if (plan.features.exports.includes('excel')) {
    features.push('Excel tracker exports');
  }

  if (plan.features.white_label === 'logo_only') {
    features.push('Add your logo');
  } else if (plan.features.white_label === 'full') {
    features.push('Full white-label branding');
  } else if (plan.features.white_label === 'full_plus_templates') {
    features.push('White-label + custom templates');
  } else if (plan.features.white_label === 'custom_domain') {
    features.push('Custom domain hosting');
  }

  if (plan.features.api_access === 'limited') {
    features.push('API access (100 calls/day)');
  } else if (plan.features.api_access === 'unlimited') {
    features.push('Unlimited API access');
  }

  if (plan.features.priority_support) {
    features.push('Priority support');
  }

  if (plan.features.custom_templates) {
    features.push('Custom report templates');
  }

  if (plan.features.dedicated_manager) {
    features.push('Dedicated account manager');
  }

  if (plan.features.sla) {
    features.push('SLA guarantee (99.9% uptime)');
  }

  if (plan.features.reseller_rights) {
    features.push('White-label resale rights');
  }

  return features;
}
