# White-Label Implementation Plan

## Overview

This document outlines how to add white-label branding to Local.AI, allowing agencies to export reports with their own branding instead of "We Build Apps."

**Goal:** Agencies can add their logo, colors, and company name to all PDF/PowerPoint/Excel exports.

**Timeline:** 1 week of development

---

## Database Schema Changes

### 1. Create `agencies` table

```sql
-- Add to Supabase SQL Editor
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT, -- URL to uploaded logo (stored in Supabase Storage)
  primary_color TEXT DEFAULT '#10b981', -- Hex color for branding
  secondary_color TEXT DEFAULT '#6366f1',
  footer_text TEXT DEFAULT 'Strategic Analysis Report',
  website_url TEXT,

  -- Billing
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT CHECK (plan IN ('solo', 'starter', 'pro', 'enterprise')) DEFAULT 'solo',
  monthly_report_limit INTEGER DEFAULT 10,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for fast lookups
CREATE INDEX idx_agencies_stripe_customer ON agencies(stripe_customer_id);
```

### 2. Add agency relationship to `demos` table

```sql
-- Link demos to agencies
ALTER TABLE demos ADD COLUMN agency_id UUID REFERENCES agencies(id);
ALTER TABLE demos ADD COLUMN created_by_email TEXT; -- Track which team member created

-- Add index for filtering by agency
CREATE INDEX idx_demos_agency ON demos(agency_id);
```

### 3. Create `team_members` table

```sql
-- Allow agencies to have multiple users
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',

  -- Invitation tracking
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by_email TEXT,
  accepted_at TIMESTAMPTZ,

  -- Permissions (for future use)
  can_export BOOLEAN DEFAULT true,
  can_invite BOOLEAN DEFAULT false,

  UNIQUE(agency_id, email)
);

CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_team_members_agency ON team_members(agency_id);
```

### 4. Create `activity_log` table (optional - for analytics)

```sql
-- Track usage for billing and analytics
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  demo_id VARCHAR(15) REFERENCES demos(id),
  user_email TEXT NOT NULL,
  action TEXT NOT NULL, -- 'created', 'analyzed', 'exported_pdf', 'exported_excel', etc.
  metadata JSONB, -- Store additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_agency ON activity_log(agency_id, created_at);
CREATE INDEX idx_activity_log_demo ON activity_log(demo_id);
```

---

## TypeScript Types

Create `types/agency.ts`:

```typescript
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
```

---

## Server-Side Utilities

### 1. Agency Branding Service

Create `lib/branding/agency-branding-service.ts`:

```typescript
import { supabaseAdmin } from '@/server/supabaseAdmin';
import { AgencyBranding } from '@/types/agency';

export class AgencyBrandingService {
  /**
   * Get agency branding by ID
   */
  static async getBranding(agencyId: string): Promise<AgencyBranding | null> {
    const { data, error } = await supabaseAdmin
      .from('agencies')
      .select('id, name, logo_url, primary_color, secondary_color, footer_text, website_url')
      .eq('id', agencyId)
      .single();

    if (error || !data) {
      console.error('Error fetching agency branding:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      logoUrl: data.logo_url,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      footerText: data.footer_text,
      websiteUrl: data.website_url,
    };
  }

  /**
   * Get branding for a demo (via agency_id)
   */
  static async getBrandingForDemo(demoId: string): Promise<AgencyBranding | null> {
    const { data, error } = await supabaseAdmin
      .from('demos')
      .select('agency_id')
      .eq('id', demoId)
      .single();

    if (error || !data || !data.agency_id) {
      // Return default branding if no agency
      return {
        id: 'default',
        name: 'We Build Apps',
        primaryColor: '#10b981',
        secondaryColor: '#6366f1',
        footerText: 'Strategic Analysis Report',
      };
    }

    return this.getBranding(data.agency_id);
  }

  /**
   * Update agency branding
   */
  static async updateBranding(
    agencyId: string,
    updates: Partial<AgencyBranding>
  ): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('agencies')
      .update({
        name: updates.name,
        logo_url: updates.logoUrl,
        primary_color: updates.primaryColor,
        secondary_color: updates.secondaryColor,
        footer_text: updates.footerText,
        website_url: updates.websiteUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agencyId);

    if (error) {
      console.error('Error updating agency branding:', error);
      return false;
    }

    return true;
  }
}
```

### 2. Team Member Service

Create `lib/team/team-member-service.ts`:

```typescript
import { supabaseAdmin } from '@/server/supabaseAdmin';
import { TeamMember } from '@/types/agency';

export class TeamMemberService {
  /**
   * Get team member by email
   */
  static async getByEmail(email: string): Promise<TeamMember[]> {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Error fetching team members:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get agency for authenticated user
   */
  static async getAgencyForUser(email: string): Promise<string | null> {
    const members = await this.getByEmail(email);
    return members.length > 0 ? members[0].agencyId : null;
  }

  /**
   * Invite team member
   */
  static async inviteMember(
    agencyId: string,
    email: string,
    invitedBy: string,
    role: 'admin' | 'member' = 'member'
  ): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('team_members')
      .insert({
        agency_id: agencyId,
        email: email.toLowerCase(),
        role,
        invited_by_email: invitedBy,
      });

    if (error) {
      console.error('Error inviting team member:', error);
      return false;
    }

    // TODO: Send invitation email
    return true;
  }

  /**
   * Accept invitation
   */
  static async acceptInvitation(email: string, agencyId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('team_members')
      .update({ accepted_at: new Date().toISOString() })
      .eq('email', email.toLowerCase())
      .eq('agency_id', agencyId)
      .is('accepted_at', null);

    if (error) {
      console.error('Error accepting invitation:', error);
      return false;
    }

    return true;
  }
}
```

---

## Update Export Functions

### 1. Modify PDF Generator

Update `pages/api/export/[demoId].ts`:

```typescript
import { AgencyBrandingService } from '@/lib/branding/agency-branding-service';

// Inside generatePDF function
async function generatePDF(demo: any, analysis: any, branding: AgencyBranding): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header with agency branding
      if (branding.logoUrl) {
        // TODO: Fetch and embed logo
        // doc.image(logoBuffer, x, y, { width: 100 });
      }

      doc
        .fontSize(24)
        .fillColor(branding.primaryColor)
        .text(branding.name, { align: 'center' });

      doc
        .fontSize(14)
        .fillColor('#666')
        .text(branding.footerText, { align: 'center' });

      doc.moveDown();

      // ... rest of PDF generation ...

      // Footer with agency branding
      const pageCount = (doc as any).bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);

        const footerText = branding.websiteUrl
          ? `Page ${i + 1} of ${pageCount} | ${branding.name} | ${branding.websiteUrl}`
          : `Page ${i + 1} of ${pageCount} | ${branding.name} | Generated ${new Date().toLocaleDateString()}`;

        doc
          .fontSize(8)
          .fillColor('#999')
          .text(footerText, 50, doc.page.height - 50, { align: 'center' });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Update handler to fetch branding
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ... existing code ...

  // Fetch agency branding
  const branding = await AgencyBrandingService.getBrandingForDemo(demoId);

  if (!branding) {
    return res.status(500).json({ error: 'Failed to load agency branding' });
  }

  if (format === 'pdf') {
    buffer = await generatePDF(demo, analysis, branding);
    // ... rest of PDF export ...
  }

  // ... rest of handler ...
}
```

### 2. Modify PowerPoint Generator

```typescript
// Inside generatePowerPoint function
async function generatePowerPoint(demo: any, analysis: any, branding: AgencyBranding): Promise<Buffer> {
  const pres = new pptxgen();

  // Set presentation properties with agency branding
  pres.author = branding.name;
  pres.company = branding.name;
  pres.title = `${demo.business_name} - Strategic Analysis`;

  // Slide 1: Title Slide with agency branding
  const slide1 = pres.addSlide();
  slide1.background = { color: branding.primaryColor.replace('#', '') };

  slide1.addText(branding.name, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });

  slide1.addText(branding.footerText, {
    x: 0.5,
    y: 2.2,
    w: 9,
    h: 0.4,
    fontSize: 18,
    color: 'FFFFFF',
    align: 'center',
  });

  // ... rest of PowerPoint generation ...

  return pres.write({ outputType: 'nodebuffer' }) as Promise<Buffer>;
}
```

### 3. Modify Excel Generator

```typescript
// Inside generateExcel function
async function generateExcel(
  demo: any,
  roiData: any,
  roadmapData: any,
  branding: AgencyBranding
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  // Set workbook properties with agency branding
  workbook.creator = branding.name;
  workbook.company = branding.name;

  // Financial Projections Sheet
  const financeSheet = workbook.addWorksheet('Financial Projections');

  // Style header with agency colors
  financeSheet.getRow(1).font = { bold: true, size: 12 };
  financeSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF' + branding.primaryColor.replace('#', '') },
  };

  // ... rest of Excel generation ...

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
```

---

## API Endpoints

### 1. Get Agency Branding

Create `pages/api/agency/branding.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { AgencyBrandingService } from '@/lib/branding/agency-branding-service';
import { TeamMemberService } from '@/lib/team/team-member-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user email from session (TODO: implement auth)
    const userEmail = req.headers['x-user-email'] as string;

    if (!userEmail) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get agency for user
    const agencyId = await TeamMemberService.getAgencyForUser(userEmail);

    if (!agencyId) {
      return res.status(404).json({ error: 'No agency found for user' });
    }

    // Get branding
    const branding = await AgencyBrandingService.getBranding(agencyId);

    if (!branding) {
      return res.status(404).json({ error: 'Agency branding not found' });
    }

    return res.status(200).json(branding);
  } catch (error) {
    console.error('Error fetching agency branding:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 2. Update Agency Branding

Create `pages/api/agency/update-branding.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { AgencyBrandingService } from '@/lib/branding/agency-branding-service';
import { TeamMemberService } from '@/lib/team/team-member-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userEmail = req.headers['x-user-email'] as string;

    if (!userEmail) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is owner/admin
    const members = await TeamMemberService.getByEmail(userEmail);
    const member = members[0];

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({ error: 'Only owners and admins can update branding' });
    }

    // Update branding
    const updates = req.body;
    const success = await AgencyBrandingService.updateBranding(member.agencyId, updates);

    if (!success) {
      return res.status(500).json({ error: 'Failed to update branding' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating agency branding:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 3. Upload Logo

Create `pages/api/agency/upload-logo.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/server/supabaseAdmin';
import { TeamMemberService } from '@/lib/team/team-member-service';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userEmail = req.headers['x-user-email'] as string;

    if (!userEmail) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const agencyId = await TeamMemberService.getAgencyForUser(userEmail);

    if (!agencyId) {
      return res.status(404).json({ error: 'No agency found' });
    }

    // Get base64 image from request
    const { imageBase64, filename } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('agency-logos')
      .upload(`${agencyId}/${filename || 'logo.png'}`, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.error('Error uploading logo:', error);
      return res.status(500).json({ error: 'Failed to upload logo' });
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('agency-logos')
      .getPublicUrl(data.path);

    // Update agency record with logo URL
    await supabaseAdmin
      .from('agencies')
      .update({ logo_url: publicUrlData.publicUrl })
      .eq('id', agencyId);

    return res.status(200).json({
      success: true,
      logoUrl: publicUrlData.publicUrl
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## UI Components

### 1. Agency Branding Settings Page

Create `app/agency/settings/branding/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { AgencyBranding } from '@/types/agency';

export default function BrandingSettingsPage() {
  const [branding, setBranding] = useState<AgencyBranding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const response = await fetch('/api/agency/branding');
      if (response.ok) {
        const data = await response.json();
        setBranding(data);
      }
    } catch (error) {
      console.error('Error fetching branding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!branding) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/agency/update-branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });

      if (response.ok) {
        alert('Branding updated successfully!');
      } else {
        alert('Failed to update branding');
      }
    } catch (error) {
      console.error('Error saving branding:', error);
      alert('Failed to update branding');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageBase64 = event.target?.result as string;

      try {
        const response = await fetch('/api/agency/upload-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64, filename: file.name }),
        });

        if (response.ok) {
          const data = await response.json();
          setBranding((prev) => prev ? { ...prev, logoUrl: data.logoUrl } : null);
        }
      } catch (error) {
        console.error('Error uploading logo:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return <div className="p-8">Loading branding settings...</div>;
  }

  if (!branding) {
    return <div className="p-8">No agency found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Agency Branding</h1>

      <div className="space-y-6 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
        {/* Agency Name */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Agency Name
          </label>
          <input
            type="text"
            value={branding.name}
            onChange={(e) => setBranding({ ...branding, name: e.target.value })}
            className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white"
          />
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Agency Logo
          </label>
          {branding.logoUrl && (
            <div className="mb-4">
              <img src={branding.logoUrl} alt="Agency Logo" className="h-20 object-contain" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="text-white"
          />
          <p className="text-sm text-slate-400 mt-1">
            Recommended: PNG with transparent background, max 500px width
          </p>
        </div>

        {/* Primary Color */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Primary Color
          </label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={branding.primaryColor}
              onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
              className="h-10 w-20 rounded cursor-pointer"
            />
            <input
              type="text"
              value={branding.primaryColor}
              onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
              className="flex-1 px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white"
            />
          </div>
        </div>

        {/* Footer Text */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Report Footer Text
          </label>
          <input
            type="text"
            value={branding.footerText}
            onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
            className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white"
            placeholder="Strategic Analysis Report"
          />
        </div>

        {/* Website URL */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Website URL
          </label>
          <input
            type="url"
            value={branding.websiteUrl || ''}
            onChange={(e) => setBranding({ ...branding, websiteUrl: e.target.value })}
            className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white"
            placeholder="https://your-agency.com"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Branding'}
        </button>
      </div>

      {/* Preview */}
      <div className="mt-8 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>
        <div className="bg-white p-8 rounded-lg">
          {branding.logoUrl && (
            <img src={branding.logoUrl} alt="Logo" className="h-16 mb-4" />
          )}
          <h3 className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
            {branding.name}
          </h3>
          <p className="text-gray-600 mt-1">{branding.footerText}</p>
          {branding.websiteUrl && (
            <p className="text-sm text-gray-500 mt-2">{branding.websiteUrl}</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Testing Checklist

### Database
- [ ] Run SQL migrations in Supabase
- [ ] Create test agency record
- [ ] Create test team member record
- [ ] Verify foreign key relationships

### Branding Service
- [ ] Test `getBranding()` with valid agency ID
- [ ] Test `getBrandingForDemo()` with demo that has agency
- [ ] Test `getBrandingForDemo()` with demo without agency (should return defaults)
- [ ] Test `updateBranding()` with valid data

### Export Functions
- [ ] Generate PDF with custom branding
- [ ] Generate PowerPoint with custom branding
- [ ] Generate Excel with custom branding
- [ ] Verify logo displays correctly
- [ ] Verify colors render correctly
- [ ] Verify footer text appears on all pages

### API Endpoints
- [ ] `/api/agency/branding` returns correct data
- [ ] `/api/agency/update-branding` saves changes
- [ ] `/api/agency/upload-logo` uploads and returns URL
- [ ] All endpoints handle errors gracefully

### UI
- [ ] Branding settings page loads
- [ ] Form inputs update state correctly
- [ ] Logo upload works
- [ ] Color picker updates preview
- [ ] Save button triggers update
- [ ] Preview shows accurate representation

---

## Deployment Steps

1. **Run database migrations** in Supabase SQL Editor
2. **Create Supabase Storage bucket** for agency logos:
   ```sql
   -- In Supabase Storage, create bucket named "agency-logos"
   -- Set to public access
   ```
3. **Deploy updated code** to Vercel
4. **Test with demo agency** before rolling out to customers
5. **Create onboarding flow** for agencies to set up branding

---

## Next Steps

After white-label branding is complete:

1. **Multi-client dashboard** - Allow agencies to manage 50+ clients
2. **Team collaboration** - Invite team members, track activity
3. **Usage analytics** - Show agencies which reports drive most value
4. **API access** - Allow agencies to embed analysis in their tools

---

## Support & Troubleshooting

### Common Issues

**Logo doesn't display in PDF:**
- Ensure Supabase Storage bucket is public
- Check that logo URL is accessible
- Verify PDFKit image loading (may need to fetch buffer first)

**Colors don't render:**
- Ensure hex color format (#RRGGBB)
- Check for valid color values in database
- Verify color conversion in PowerPoint (remove # prefix)

**Branding not loading:**
- Check foreign key relationships (demos.agency_id)
- Verify team member has accepted invitation
- Ensure agency record exists in database
