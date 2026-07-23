'use client';
import { useEffect, useRef, useState } from 'react';
import { User as UserIcon, Building2, Bell, Shield, LogOut, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useRouter } from 'next/navigation';
import { settingsService } from '@/services/moduleServices';
import { userManagementService } from '@/services/crmService';
import { fileManagerService } from '@/services/moduleServices';
import { companyService, ClientRead } from '@/services/portalServices';
import { authService } from '@/services/authService';

type Tab = 'profile' | 'company' | 'notifications' | 'security';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '');
const resolveUrl = (url: string) => (url.startsWith('http') ? url : `${API_ORIGIN}${url}`);

export default function SettingsPage() {
  const { user, logout, token, refreshToken, login } = useAuthStore();
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const [tab, setTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);

  // Profile state
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.image ?? null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Company state
  const [company, setCompany] = useState<ClientRead | null>(null);
  const [companyForm, setCompanyForm] = useState({ display_name: '', website: '', phone: '' });
  const [savingCompany, setSavingCompany] = useState(false);

  // Notifications preferences
  const [preferences, setPreferences] = useState<{ theme: string; email_notifications: boolean; in_app_notifications: boolean } | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      userManagementService.getUser(user.id).catch(() => null),
      userManagementService.getUserProfile(user.id).catch(() => null),
      settingsService.getMyPreferences().catch(() => null),
      companyService.getMine().catch(() => null),
    ]).then(([detail, profile, prefs, myCompany]) => {
      if (detail?.phone) setPhone(detail.phone);
      if (detail?.full_name) setFullName(detail.full_name);
      if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
      if (prefs) setPreferences(prefs);
      else setPreferences({ theme: 'light', email_notifications: true, in_app_notifications: true });
      if (myCompany) {
        setCompany(myCompany);
        setCompanyForm({ display_name: myCompany.display_name ?? '', website: myCompany.website ?? '', phone: myCompany.phone ?? '' });
      }
      setLoading(false);
    });
  }, [user?.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      await userManagementService.updateUser(user.id, { full_name: fullName.trim(), phone: phone.trim() });
      login({ ...user, name: fullName.trim() }, token ?? '', refreshToken ?? undefined);
      showToast('Profile updated successfully.', 'success');
    } catch {
      showToast('Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !user) return;
    setUploadingAvatar(true);
    try {
      const uploaded = await fileManagerService.uploadBinary(fileList[0]);
      const url = resolveUrl(uploaded.url);
      await userManagementService.upsertUserProfile(user.id, { full_name: fullName.trim() || user.name, avatar_url: url });
      setAvatarUrl(url);
      login({ ...user, image: url }, token ?? '', refreshToken ?? undefined);
      showToast('Avatar updated.', 'success');
    } catch {
      showToast('Failed to upload avatar.', 'error');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setSavingCompany(true);
    try {
      const updated = await companyService.update(company.id, companyForm);
      setCompany(updated);
      showToast('Company details updated.', 'success');
    } catch {
      showToast('Failed to update company details.', 'error');
    } finally {
      setSavingCompany(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;
    setSavingPrefs(true);
    try {
      await settingsService.updateMyPreferences(preferences);
      showToast('Notification preferences saved.', 'success');
    } catch {
      showToast('Failed to save preferences.', 'error');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password changed successfully.', 'success');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to change password.';
      setPasswordError(message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // ignore
    } finally {
      logout();
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
        </div>
      </div>
    );
  }

  const navButtons: { key: Tab; label: string; icon: typeof UserIcon }[] = [
    { key: 'profile', label: 'Profile', icon: UserIcon },
    { key: 'company', label: 'Company details', icon: Building2 },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Password & Security', icon: Shield },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Account Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your profile, company details, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-1">
          {navButtons.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                tab === key ? 'bg-[#4C1D95]/10 text-[#4C1D95] font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-slate-200">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium text-sm transition-colors">
              <LogOut size={18} /> Sign out
            </button>
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          {tab === 'profile' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>Profile Information</h2>

              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  {avatarUrl ? <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" /> : <UserIcon size={28} className="text-slate-400" />}
                </div>
                <div>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarChange(e.target.files)} />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors mb-2 disabled:opacity-60 flex items-center gap-2"
                  >
                    {uploadingAvatar && <Loader2 size={14} className="animate-spin" />}
                    {uploadingAvatar ? 'Uploading...' : 'Change avatar'}
                  </button>
                  <p className="text-xs text-slate-500">JPG, GIF or PNG. 20MB max.</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSaveProfile}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input type="text" required minLength={2} value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <input type="email" value={user?.email || ''} disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500" />
                  <p className="text-xs text-slate-500 mt-1.5">Contact your account manager to change your email address.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]" />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button type="submit" disabled={savingProfile} className="flex items-center gap-2 bg-[#4C1D95] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors disabled:opacity-50">
                    {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {tab === 'company' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>Company Details</h2>
              {!company ? (
                <p className="text-sm text-slate-400">No company information linked to this account.</p>
              ) : (
                <form className="space-y-4" onSubmit={handleSaveCompany}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
                      <input type="text" value={company.company_name} disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
                      <input type="text" value={company.industry ?? '-'} disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Display Name</label>
                    <input type="text" value={companyForm.display_name} onChange={(e) => setCompanyForm((p) => ({ ...p, display_name: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
                      <input type="url" value={companyForm.website} onChange={(e) => setCompanyForm((p) => ({ ...p, website: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                      <input type="tel" value={companyForm.phone} onChange={(e) => setCompanyForm((p) => ({ ...p, phone: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">GST Number</label>
                      <input type="text" value={company.gst_number ?? '-'} disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">PAN Number</label>
                      <input type="text" value={company.pan_number ?? '-'} disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Tax/registration details can only be updated by your account manager.</p>
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button type="submit" disabled={savingCompany} className="flex items-center gap-2 bg-[#4C1D95] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors disabled:opacity-50">
                      {savingCompany ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      {savingCompany ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {tab === 'notifications' && preferences && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>Notification Preferences</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Email notifications</p>
                    <p className="text-xs text-slate-500">Receive updates about campaigns, invoices, and messages by email.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.email_notifications}
                    onChange={(e) => setPreferences((p) => (p ? { ...p, email_notifications: e.target.checked } : p))}
                    className="w-5 h-5 accent-[#4C1D95]"
                  />
                </label>
                <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-sm font-medium text-slate-900">In-app notifications</p>
                    <p className="text-xs text-slate-500">Show notifications in the bell icon while you&apos;re using the portal.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.in_app_notifications}
                    onChange={(e) => setPreferences((p) => (p ? { ...p, in_app_notifications: e.target.checked } : p))}
                    className="w-5 h-5 accent-[#4C1D95]"
                  />
                </label>
              </div>
              <div className="pt-6 mt-2 border-t border-slate-100 flex justify-end">
                <button onClick={handleSavePreferences} disabled={savingPrefs} className="flex items-center gap-2 bg-[#4C1D95] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors disabled:opacity-50">
                  {savingPrefs ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {savingPrefs ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>Password & Security</h2>
              <form className="space-y-4 max-w-md" onSubmit={handleChangePassword}>
                {passwordError && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{passwordError}</p>}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                  <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                  <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]" />
                  <p className="text-xs text-slate-500 mt-1.5">At least 8 characters, with an uppercase letter, lowercase letter, number, and symbol.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]" />
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button type="submit" disabled={changingPassword} className="flex items-center gap-2 bg-[#4C1D95] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors disabled:opacity-50">
                    {changingPassword ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    {changingPassword ? 'Updating...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
