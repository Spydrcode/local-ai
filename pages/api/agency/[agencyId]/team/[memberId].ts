import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/server/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { agencyId, memberId } = req.query;

  if (!agencyId || typeof agencyId !== 'string' || !memberId || typeof memberId !== 'string') {
    return res.status(400).json({ error: 'Invalid agency ID or member ID' });
  }

  if (req.method === 'DELETE') {
    try {
      // Check if member is owner
      const { data: member } = await supabaseAdmin!
        .from('team_members')
        .select('role')
        .eq('id', memberId)
        .eq('agency_id', agencyId)
        .single();

      if (member?.role === 'owner') {
        return res.status(403).json({ error: 'Cannot remove agency owner' });
      }

      const { error } = await supabaseAdmin!
        .from('team_members')
        .delete()
        .eq('id', memberId)
        .eq('agency_id', agencyId);

      if (error) {
        console.error('Delete team member error:', error);
        return res.status(500).json({ error: 'Failed to remove team member' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete team member error:', error);
      return res.status(500).json({
        error: 'Failed to remove team member',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { role, can_export, can_invite } = req.body;

      // Check if trying to change owner role
      const { data: member } = await supabaseAdmin!
        .from('team_members')
        .select('role')
        .eq('id', memberId)
        .eq('agency_id', agencyId)
        .single();

      if (member?.role === 'owner') {
        return res.status(403).json({ error: 'Cannot change owner role' });
      }

      const updates: Record<string, any> = {};
      if (role !== undefined) {
        if (!['admin', 'member'].includes(role)) {
          return res.status(400).json({ error: 'Invalid role' });
        }
        updates.role = role;
        // Automatically set permissions based on role
        updates.can_invite = role === 'admin';
      }
      if (can_export !== undefined) updates.can_export = can_export;
      if (can_invite !== undefined) updates.can_invite = can_invite;

      const { data, error } = await supabaseAdmin!
        .from('team_members')
        .update(updates)
        .eq('id', memberId)
        .eq('agency_id', agencyId)
        .select()
        .single();

      if (error) {
        console.error('Update team member error:', error);
        return res.status(500).json({ error: 'Failed to update team member' });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('Update team member error:', error);
      return res.status(500).json({
        error: 'Failed to update team member',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
