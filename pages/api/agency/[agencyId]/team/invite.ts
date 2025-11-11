import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/server/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { agencyId } = req.query;

  if (!agencyId || typeof agencyId !== 'string') {
    return res.status(400).json({ error: 'Invalid agency ID' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, role, invitedBy } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or member' });
    }

    // Check if user is already a team member
    const { data: existing } = await supabaseAdmin!
      .from('team_members')
      .select('id')
      .eq('agency_id', agencyId)
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'User is already a team member' });
    }

    // Get agency team member limit
    const { data: agency } = await supabaseAdmin!
      .from('agencies')
      .select('plan')
      .eq('id', agencyId)
      .single();

    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    // Check team member count against limit
    const { count } = await supabaseAdmin!
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyId);

    const limits: Record<string, number> = {
      solo: 1,
      starter: 3,
      pro: 10,
      enterprise: -1, // unlimited
    };

    const limit = limits[agency.plan] || 1;
    if (limit !== -1 && (count || 0) >= limit) {
      return res.status(429).json({
        error: `Team member limit reached for ${agency.plan} plan. Upgrade to add more members.`,
      });
    }

    // Create team member invitation
    const { data: newMember, error: insertError } = await supabaseAdmin!
      .from('team_members')
      .insert({
        agency_id: agencyId,
        email,
        role,
        invited_by_email: invitedBy,
        can_export: true,
        can_invite: role === 'admin',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert team member error:', insertError);
      return res.status(500).json({ error: 'Failed to create invitation' });
    }

    // TODO: Send invitation email to the user
    // await sendInvitationEmail(email, agencyId, invitedBy);

    return res.status(201).json(newMember);
  } catch (error) {
    console.error('Invite team member error:', error);
    return res.status(500).json({
      error: 'Failed to send invitation',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
