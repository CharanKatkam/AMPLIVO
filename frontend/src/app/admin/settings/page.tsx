'use client';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { settingsService } from '@/services/moduleServices';
import { useAuthStore } from '@/store/authStore';
import { Settings, Building2, Bell, Shield, Palette, Globe, Check, Loader2 } from 'lucide-react';

export default function AdminSettings() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    agency_name: '',
    registration_number: '',
    support_email: '',
    support_phone: '',
    hq_address: '',
    base_currency: 'INR',
    timezone: 'Asia/Kolkata',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await settingsService.getSystemSettings();
        const settings: Record<string, string> = {};
        (Array.isArray(res) ? res : res.items || []).forEach((s: Record<string, unknown>) => {
          if (typeof s.key === 'string' && typeof s.value === 'string') {
            settings[s.key] = s.value;
          }
        });
        setForm((prev) => ({
          ...prev,
          agency_name: settings.agency_name || settings.company_name || '',
          registration_number: settings.registration_number || '',
          support_email: settings.support_email || '',
          support_phone: settings.support_phone || '',
          hq_address: settings.hq_address || '',
          base_currency: settings.base_currency || 'INR',
          timezone: settings.timezone || 'Asia/Kolkata',
        }));
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(form).map(([key, value]) =>
          settingsService.createSystemSetting({ key, value, category: 'agency', description: `Agency setting: ${key}` })
        )
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminHeader title="Agency Settings" subtitle="Configure system preferences, branding, and integrations." />
        <div className="p-6 flex items-center justify-center h-96">
          <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Agency Settings" subtitle="Configure system preferences, branding, and integrations." />

      <div className="p-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#4C1D95]/10 text-[#4C1D95] rounded-xl font-semibold text-sm transition-colors">
              <Building2 size={18} /> Agency Profile
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium text-sm transition-colors">
              <Palette size={18} /> Branding
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium text-sm transition-colors">
              <Globe size={18} /> Domain &amp; SEO
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium text-sm transition-colors">
              <Settings size={18} /> Integrations
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium text-sm transition-colors">
              <Bell size={18} /> Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium text-sm transition-colors">
              <Shield size={18} /> Security
            </button>
          </div>

          <div className="md:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>Agency Profile</h2>

              <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-sm text-slate-500">Logged in as <span className="font-semibold text-slate-700">{user?.name || 'Admin'}</span> ({user?.email || ''})</p>
              </div>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <span className="font-bold text-2xl text-slate-300">{form.agency_name?.charAt(0) || 'A'}</span>
                  </div>
                  <div>
                    <button type="button" className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors mb-2">
                      Upload Logo
                    </button>
                    <p className="text-xs text-slate-500">Recommended size: 512x512px (PNG or SVG).</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Agency Name</label>
                    <input type="text" value={form.agency_name} onChange={(e) => updateField('agency_name', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Registration Number</label>
                    <input type="text" value={form.registration_number} onChange={(e) => updateField('registration_number', e.target.value)} placeholder="e.g. U74999TG2024PTC..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Support Email</label>
                    <input type="email" value={form.support_email} onChange={(e) => updateField('support_email', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Support Phone</label>
                    <input type="tel" value={form.support_phone} onChange={(e) => updateField('support_phone', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">HQ Address</label>
                  <textarea rows={3} value={form.hq_address} onChange={(e) => updateField('hq_address', e.target.value)} placeholder="Full address for invoices..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Base Currency</label>
                    <select value={form.base_currency} onChange={(e) => updateField('base_currency', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95] bg-white">
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Timezone</label>
                    <select value={form.timezone} onChange={(e) => updateField('timezone', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95] bg-white">
                      <option>Asia/Kolkata (IST)</option>
                      <option>America/New_York (EST)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
                  <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#4C1D95] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors disabled:opacity-50">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Check size={16} />}
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
