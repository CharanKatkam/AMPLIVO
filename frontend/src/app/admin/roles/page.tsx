'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { userManagementService } from '@/services/crmService';
import { ShieldCheck, Plus, X, AlertTriangle, Edit2, Users, Loader2, Trash2 } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description?: string;
  is_system?: boolean;
  created_at?: string;
}

interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description?: string;
}

export default function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [savingPerm, setSavingPerm] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userManagementService.getRoles({ page_size: 100 });
      const items = data.items ?? data ?? [];
      setRoles(Array.isArray(items) ? items : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load roles.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      const data = await userManagementService.getPermissions({ page_size: 100 });
      const items = data.items ?? data ?? [];
      setPermissions(Array.isArray(items) ? items : []);
    } catch {
      // silently fail for permissions list
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  const selectRole = async (roleId: string) => {
    setSelectedRoleId(roleId);
    setLoadingPerms(true);
    try {
      const data = await userManagementService.getRolePermissions(roleId);
      const items = data.items ?? data ?? [];
      setRolePermissions(Array.isArray(items) ? items : []);
    } catch {
      setRolePermissions([]);
    } finally {
      setLoadingPerms(false);
    }
  };

  const togglePermission = async (permId: string) => {
    if (!selectedRoleId || savingPerm) return;
    setSavingPerm(permId);
    try {
      const hasPerm = rolePermissions.some((p) => p.id === permId);
      if (hasPerm) {
        await userManagementService.revokePermission(selectedRoleId, permId);
        setRolePermissions((prev) => prev.filter((p) => p.id !== permId));
      } else {
        await userManagementService.assignPermission(selectedRoleId, permId);
        const perm = permissions.find((p) => p.id === permId);
        if (perm) setRolePermissions((prev) => [...prev, perm]);
      }
    } catch {
      // revert silently
    } finally {
      setSavingPerm(null);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await userManagementService.createRole({ name: newRoleName.trim(), description: newRoleDesc.trim() || undefined });
      setShowCreateForm(false);
      setNewRoleName('');
      setNewRoleDesc('');
      fetchRoles();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create role.';
      setCreateError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await userManagementService.deleteRole(deleteConfirmId);
      setDeleteConfirmId(null);
      if (selectedRoleId === deleteConfirmId) {
        setSelectedRoleId(null);
        setRolePermissions([]);
      }
      fetchRoles();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete role.';
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  const groupedPerms = permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    const mod = perm.module || 'General';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(perm);
    return acc;
  }, {});

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <div>
      <AdminHeader title="Roles & Permissions" subtitle="Manage access control and define custom roles for your team." />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => { setShowCreateForm(true); setCreateError(null); }}
            className="flex items-center gap-2 bg-[#4C1D95] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors"
          >
            <Plus size={16} /> Create Custom Role
          </button>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
            <span className="text-sm text-slate-500">Loading roles...</span>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
            <AlertTriangle size={32} className="text-red-400" />
            <span className="text-sm text-red-600">{error}</span>
            <button onClick={fetchRoles} className="mt-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Roles List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Available Roles</h2>

              {roles.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-sm text-slate-400">No roles found.</div>
              )}

              {roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => selectRole(role.id)}
                  className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedRoleId === role.id
                      ? 'border-[#4C1D95] shadow-sm ring-1 ring-[#4C1D95]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className={role.is_system ? 'text-rose-500' : 'text-[#4C1D95]'} />
                      <h3 className="font-semibold text-slate-900 text-sm">{role.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      {role.is_system && (
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">System</span>
                      )}
                      {!role.is_system && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(role.id); }}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete role"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  {role.description && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{role.description}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Permissions Matrix */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <div>
                    <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                      {selectedRole ? `Editing: ${selectedRole.name}` : 'Select a Role'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedRole ? 'Toggle permissions for this role.' : 'Choose a role from the list to manage its permissions.'}
                    </p>
                  </div>
                  {selectedRole && (
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
                      <Edit2 size={14} /> Edit Role Info
                    </button>
                  )}
                </div>

                {!selectedRoleId && (
                  <div className="flex-1 flex items-center justify-center py-16 text-sm text-slate-400">
                    Select a role to view and edit permissions.
                  </div>
                )}

                {selectedRoleId && loadingPerms && (
                  <div className="flex-1 flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-[#4C1D95]" />
                  </div>
                )}

                {selectedRoleId && !loadingPerms && (
                  <div className="p-0 overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-white">
                          <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/2">Permission</th>
                          <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Module</th>
                          <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Action</th>
                          <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center flex justify-center gap-1 items-center">
                            <AlertTriangle size={14} className="text-rose-500" /> Granted
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {permissions.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-sm text-slate-400">No permissions available.</td>
                          </tr>
                        )}
                        {permissions.map((perm) => {
                          const isGranted = rolePermissions.some((p) => p.id === perm.id);
                          return (
                            <tr key={perm.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-4 px-6 font-medium text-slate-900 text-sm">{perm.name}</td>
                              <td className="py-4 px-6 text-center text-xs text-slate-600">{perm.module}</td>
                              <td className="py-4 px-6 text-center text-xs text-slate-600">{perm.action}</td>
                              <td className="py-4 px-6 text-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isGranted}
                                    onChange={() => togglePermission(perm.id)}
                                    disabled={savingPerm === perm.id}
                                  />
                                  <div className={`w-9 h-5 rounded-full peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                                    savingPerm === perm.id ? 'bg-slate-300' : 'bg-slate-200 peer-checked:bg-rose-500'
                                  }`}></div>
                                </label>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Role Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowCreateForm(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Create Role</h2>
              <button onClick={() => setShowCreateForm(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateRole} className="px-6 py-5 space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{createError}</div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  placeholder="e.g. Content Manager"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] resize-none"
                  placeholder="Brief description of this role..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 pb-1">
                <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="flex items-center gap-2 px-5 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors disabled:opacity-50">
                  {creating && <Loader2 size={14} className="animate-spin" />}
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete Role</h3>
              <p className="text-sm text-slate-500">Are you sure you want to delete this role? This action cannot be undone.</p>
            </div>
            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteRole} disabled={deleting} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
