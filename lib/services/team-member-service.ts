import { supabaseAdmin } from "@/server/supabaseAdmin";
import { TeamMember } from "@/types/agency";

export class TeamMemberService {
  /**
   * Ensure supabaseAdmin is available
   */
  private static ensureSupabase() {
    if (!supabaseAdmin) {
      throw new Error(
        "Supabase admin client not initialized. Check environment variables."
      );
    }
    return supabaseAdmin;
  }

  /**
   * Get team member by email
   */
  static async getByEmail(email: string): Promise<TeamMember[]> {
    const { data, error } = await this.ensureSupabase()
      .from("team_members")
      .select("*")
      .eq("email", email.toLowerCase());

    if (error) {
      console.error("Error fetching team members:", error);
      return [];
    }

    if (!data) return [];

    return data.map((member) => ({
      id: member.id,
      agencyId: member.agency_id,
      email: member.email,
      role: member.role,
      invitedAt: member.invited_at,
      invitedByEmail: member.invited_by_email,
      acceptedAt: member.accepted_at,
      canExport: member.can_export,
      canInvite: member.can_invite,
    }));
  }

  /**
   * Get agency for authenticated user
   */
  static async getAgencyForUser(email: string): Promise<string | null> {
    const members = await this.getByEmail(email);
    return members.length > 0 ? members[0].agencyId : null;
  }

  /**
   * Get all team members for an agency
   */
  static async getTeamMembers(agencyId: string): Promise<TeamMember[]> {
    const { data, error } = await this.ensureSupabase()
      .from("team_members")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching team members:", error);
      return [];
    }

    if (!data) return [];

    return data.map((member) => ({
      id: member.id,
      agencyId: member.agency_id,
      email: member.email,
      role: member.role,
      invitedAt: member.invited_at,
      invitedByEmail: member.invited_by_email,
      acceptedAt: member.accepted_at,
      canExport: member.can_export,
      canInvite: member.can_invite,
    }));
  }

  /**
   * Invite team member
   */
  static async inviteMember(
    agencyId: string,
    email: string,
    invitedBy: string,
    role: "admin" | "member" = "member"
  ): Promise<boolean> {
    const { error } = await this.ensureSupabase()
      .from("team_members")
      .insert({
        agency_id: agencyId,
        email: email.toLowerCase(),
        role,
        invited_by_email: invitedBy,
        can_invite: role === "admin",
      });

    if (error) {
      console.error("Error inviting team member:", error);
      return false;
    }

    // TODO: Send invitation email
    return true;
  }

  /**
   * Accept invitation
   */
  static async acceptInvitation(
    email: string,
    agencyId: string
  ): Promise<boolean> {
    const { error } = await this.ensureSupabase()
      .from("team_members")
      .update({ accepted_at: new Date().toISOString() })
      .eq("email", email.toLowerCase())
      .eq("agency_id", agencyId)
      .is("accepted_at", null);

    if (error) {
      console.error("Error accepting invitation:", error);
      return false;
    }

    return true;
  }

  /**
   * Remove team member
   */
  static async removeMember(agencyId: string, email: string): Promise<boolean> {
    // Don't allow removing the owner
    const { data: member } = await this.ensureSupabase()
      .from("team_members")
      .select("role")
      .eq("agency_id", agencyId)
      .eq("email", email.toLowerCase())
      .single();

    if (member?.role === "owner") {
      console.error("Cannot remove agency owner");
      return false;
    }

    const { error } = await this.ensureSupabase()
      .from("team_members")
      .delete()
      .eq("agency_id", agencyId)
      .eq("email", email.toLowerCase());

    if (error) {
      console.error("Error removing team member:", error);
      return false;
    }

    return true;
  }

  /**
   * Update team member role
   */
  static async updateRole(
    agencyId: string,
    email: string,
    role: "admin" | "member"
  ): Promise<boolean> {
    const { error } = await this.ensureSupabase()
      .from("team_members")
      .update({
        role,
        can_invite: role === "admin",
      })
      .eq("agency_id", agencyId)
      .eq("email", email.toLowerCase());

    if (error) {
      console.error("Error updating team member role:", error);
      return false;
    }

    return true;
  }

  /**
   * Check if user has permission
   */
  static async hasPermission(
    email: string,
    agencyId: string,
    permission: "export" | "invite" | "admin"
  ): Promise<boolean> {
    const { data, error } = await this.ensureSupabase()
      .from("team_members")
      .select("role, can_export, can_invite")
      .eq("email", email.toLowerCase())
      .eq("agency_id", agencyId)
      .single();

    if (error || !data) return false;

    switch (permission) {
      case "export":
        return data.can_export;
      case "invite":
        return (
          data.can_invite || data.role === "owner" || data.role === "admin"
        );
      case "admin":
        return data.role === "owner" || data.role === "admin";
      default:
        return false;
    }
  }
}
