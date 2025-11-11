"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState, useEffect } from "react"

interface TeamMember {
  id: string
  email: string
  role: 'owner' | 'admin' | 'member'
  invited_at: string
  invited_by_email: string | null
  accepted_at: string | null
  can_export: boolean
  can_invite: boolean
}

export default function TeamManagementPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [isInviting, setIsInviting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // TODO: Replace with actual agency ID and user email from auth/context
  const agencyId = 'YOUR_AGENCY_ID'
  const currentUserEmail = 'YOUR_EMAIL'

  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = async () => {
    try {
      const response = await fetch(`/api/agency/${agencyId}/team`)
      if (!response.ok) throw new Error('Failed to load team members')
      const data = await response.json()
      setTeamMembers(data)
    } catch (error) {
      console.error('Failed to load team:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }

    setIsInviting(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/agency/${agencyId}/team/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          invitedBy: currentUserEmail,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send invitation')
      }

      setMessage({ type: 'success', text: 'Invitation sent successfully!' })
      setInviteEmail('')
      setInviteRole('member')
      setShowInviteModal(false)
      loadTeamMembers()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to send invitation',
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return

    try {
      const response = await fetch(`/api/agency/${agencyId}/team/${memberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove member')

      setMessage({ type: 'success', text: 'Team member removed' })
      loadTeamMembers()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove team member' })
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/agency/${agencyId}/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) throw new Error('Failed to update role')

      setMessage({ type: 'success', text: 'Role updated successfully' })
      loadTeamMembers()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update role' })
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Pending'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'admin':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading team members...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
            <p className="text-slate-400">Manage who has access to your agency account</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/agency/dashboard">
              <Button className="bg-slate-700 hover:bg-slate-600">
                ← Back to Dashboard
              </Button>
            </Link>
            <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              + Invite Team Member
            </Button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <div className="text-sm text-slate-400">Total Members</div>
            <div className="text-3xl font-bold text-white mt-1">{teamMembers.length}</div>
          </Card>
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <div className="text-sm text-slate-400">Active</div>
            <div className="text-3xl font-bold text-emerald-400 mt-1">
              {teamMembers.filter(m => m.accepted_at).length}
            </div>
          </Card>
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <div className="text-sm text-slate-400">Pending Invites</div>
            <div className="text-3xl font-bold text-amber-400 mt-1">
              {teamMembers.filter(m => !m.accepted_at).length}
            </div>
          </Card>
        </div>

        {/* Team Members List */}
        <Card className="p-6 bg-slate-900/50 border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Team Members</h2>

          {teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-2">No team members yet</h3>
              <p className="text-slate-400 mb-6">Invite your first team member to get started</p>
              <Button
                onClick={() => setShowInviteModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                + Invite Team Member
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="text-white font-medium">{member.email}</div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded border ${getRoleBadgeColor(
                          member.role
                        )}`}
                      >
                        {member.role}
                      </span>
                      {!member.accepted_at && (
                        <span className="px-2 py-1 text-xs font-medium rounded border bg-amber-500/10 text-amber-400 border-amber-500/20">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Invited {formatDate(member.invited_at)}</span>
                      {member.accepted_at && (
                        <>
                          <span>•</span>
                          <span>Joined {formatDate(member.accepted_at)}</span>
                        </>
                      )}
                      {member.invited_by_email && (
                        <>
                          <span>•</span>
                          <span>By {member.invited_by_email}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      {member.can_export && <span>✓ Can export</span>}
                      {member.can_invite && <span>✓ Can invite</span>}
                    </div>
                  </div>

                  {member.role !== 'owner' && (
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        className="px-3 py-1 rounded bg-slate-700 text-white text-sm border border-slate-600 focus:border-emerald-500 outline-none"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                      <Button
                        onClick={() => handleRemoveMember(member.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-8 bg-slate-900 border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Invite Team Member</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@agency.com"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                  className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-700 focus:border-emerald-500 outline-none"
                >
                  <option value="member">Member - Can view and export reports</option>
                  <option value="admin">Admin - Can manage team and settings</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowInviteModal(false)}
                disabled={isInviting}
                className="bg-slate-700 hover:bg-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={isInviting}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
