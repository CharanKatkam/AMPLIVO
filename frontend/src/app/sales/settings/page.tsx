'use client';
import { useEffect, useState } from 'react';
import { SalesHeader } from '@/components/sales/SalesSidebar';
import { userManagementService } from '@/services/crmService';
import { settingsService } from '@/services/moduleServices';
import { Bell, IndianRupee, Users, Package, Shield, ChevronRight, Save, Loader2 } from 'lucide-react';

const tabs = [
  { id: 'team', label: 'Sales Team', icon: Users },
  { id: 'services', label: 'Service Catalog', icon: Package },
  { id: 'tax', label: 'Tax & Billing', icon: IndianRupee },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function SalesSettingsPage() {
  const [activeTab, setActiveTab] = useState('team');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; role: string; email: string }>>([]);
  const [services, setServices] = useState<Array<{ id: string; name: string; category: string; monthlyPrice: number; setupFee: number }>>([]);

  const [taxRate, setTaxRate] = useState(18);
  const [advancePercent, setAdvancePercent] = useState(25);
  const [gstin, setGstin] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('7');

  const [notifications, setNotifications] = useState([
    { label: 'New Lead Submitted', desc: 'Get notified when a visitor submits the contact form', default: true, enabled: true },
    { label: 'Meeting Reminders', desc: '30-minute reminder before scheduled meetings', default: true, enabled: true },
    { label: 'Lead Status Changed', desc: 'Notify when a lead status is updated', default: true, enabled: true },
    { label: 'Invoice Generated', desc: 'Notify team when a 25% invoice is created', default: true, enabled: true },
    { label: 'Weekly Pipeline Report', desc: 'Monday morning summary of pipeline health', default: false, enabled: false },
    { label: 'Lead Overdue Follow-up', desc: 'Alert when follow-up date is past due', default: true, enabled: true },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const [usersRes, rolesRes, prefsRes] = await Promise.all([
          userManagementService.getUsers({ page_size: 100 }),
          userManagementService.getRoles(),
          settingsService.getMyPreferences().catch(() => null),
        ]);

        const users = Array.isArray(usersRes) ? usersRes : usersRes?.items || [];
        const roles = Array.isArray(rolesRes) ? rolesRes : rolesRes?.items || [];

        setTeamMembers(
          users.map((u: Record<string, unknown>) => ({
            id: String(u.id || ''),
            name: String(u.name || u.full_name || ''),
            role: String(u.role || ''),
            email: String(u.email || ''),
          }))
        );

        if (prefsRes) {
          const p = prefsRes as Record<string, unknown>;
          if (typeof p.tax_rate === 'number') setTaxRate(p.tax_rate);
          if (typeof p.advance_percent === 'number') setAdvancePercent(p.advance_percent);
          if (typeof p.gstin === 'string') setGstin(p.gstin);
          if (typeof p.payment_terms === 'string') setPaymentTerms(p.payment_terms);
          if (Array.isArray(p.notification_preferences)) {
            setNotifications((prev) =>
              prev.map((n, i) => {
                const saved = (p.notification_preferences as Record<string, unknown>[])[i];
                return saved ? { ...n, enabled: Boolean(saved.enabled) } : n;
              })
            );
          }
        }

        const svcRes = await settingsService.getSystemSettings({ category: 'services' }).catch(() => null);
        if (svcRes) {
          const items = Array.isArray(svcRes) ? svcRes : svcRes?.items || [];
          setServices(
            items.map((s: Record<string, unknown>) => ({
              id: String(s.id || s.key || ''),
              name: String(s.name || s.key || ''),
              category: String(s.category || s.value || ''),
              monthlyPrice: Number(s.monthly_price || s.monthlyPrice || 0),
              setupFee: Number(s.setup_fee || s.setupFee || 0),
            }))
          );
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateMyPreferences({
        tax_rate: taxRate,
        advance_percent: advancePercent,
        gstin,
        payment_terms: paymentTerms,
        notification_preferences: notifications.map((n) => ({ label: n.label, enabled: n.enabled })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (index: number) => {
    setNotifications((prev) =>
      prev.map((n, i) => (i === index ? { ...n, enabled: !n.enabled } : n))
    );
  };

  if (loading) {
    return (
      <div>
        <SalesHeader title="Settings" subtitle="Sales portal configuration" />
        <div className="p-6 flex items-center justify-center h-96">
          <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SalesHeader title="Settings" subtitle="Sales portal configuration" />

      <div className="p-6">
        <div className="flex gap-6">
          <div className="w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-all border-b border-slate-100 last:border-0 ${
                    activeTab === tab.id
                      ? 'bg-violet-50 text-[#4C1D95] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <tab.icon size={16} />
                    {tab.label}
                  </div>
                  <ChevronRight size={14} className={activeTab === tab.id ? 'text-[#4C1D95]' : 'text-slate-300'} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            {activeTab === 'team' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-slate-900 mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>Sales Team Members</h2>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#4C1D95] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {member.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{member.name}</div>
                          <div className="text-xs text-slate-400">{member.role || member.email}</div>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 bg-violet-50 text-[#4C1D95] rounded-lg text-xs font-semibold hover:bg-violet-100 transition-colors">
                        Edit
                      </button>
                    </div>
                  ))}
                  {teamMembers.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-8">No team members found</p>
                  )}
                </div>
                <button className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 rounded-xl text-sm font-medium hover:border-[#4C1D95]/30 hover:text-[#4C1D95] transition-colors">
                  + Add Team Member
                </button>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-slate-900 mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>Service Catalog</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {['Service', 'Category', 'Monthly Price', 'Setup Fee'].map((h) => (
                          <th key={h} className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {services.map((svc) => (
                        <tr key={svc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium text-slate-800">{svc.name}</td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded font-semibold">
                              {svc.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-slate-700">
                            {svc.monthlyPrice > 0 ? `₹${svc.monthlyPrice.toLocaleString('en-IN')}/mo` : '—'}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500">
                            {svc.setupFee > 0 ? `₹${svc.setupFee.toLocaleString('en-IN')}` : '—'}
                          </td>
                        </tr>
                      ))}
                      {services.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-sm text-slate-400">No services configured</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'tax' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <h2 className="font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Tax & Billing Settings</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Default Tax Rate (%)</label>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
                    />
                    <p className="text-xs text-slate-400 mt-1">Standard Indian GST rate</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Advance Payment (%)</label>
                    <input
                      type="number"
                      value={advancePercent}
                      onChange={(e) => setAdvancePercent(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
                    />
                    <p className="text-xs text-slate-400 mt-1">% of grand total due upfront</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Company GSTIN</label>
                    <input
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      placeholder="e.g. 36AABCA1234B1ZX"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment Terms (days)</label>
                    <input
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      type="number"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                    saved ? 'bg-emerald-500 text-white' : 'bg-[#4C1D95] text-white hover:bg-[#3b1574]'
                  } disabled:opacity-50`}
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <h2 className="font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Notification Preferences</h2>
                {notifications.map((item, idx) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-violet-100 hover:bg-violet-50/20 transition-all">
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{item.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={item.enabled} onChange={() => toggleNotification(idx)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4C1D95]" />
                    </label>
                  </div>
                ))}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                    saved ? 'bg-emerald-500 text-white' : 'bg-[#4C1D95] text-white hover:bg-[#3b1574]'
                  } disabled:opacity-50`}
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <h2 className="font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Security Settings</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-100">
                    <div className="font-semibold text-slate-800 text-sm mb-3">Change Password</div>
                    <div className="space-y-3">
                      {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
                        <div key={label}>
                          <label className="block text-xs text-slate-500 mb-1">{label}</label>
                          <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]" />
                        </div>
                      ))}
                    </div>
                    <button className="mt-4 px-5 py-2.5 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors">
                      Update Password
                    </button>
                  </div>
                  <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={16} className="text-emerald-600" />
                      <div className="font-semibold text-emerald-700 text-sm">Two-Factor Authentication</div>
                    </div>
                    <p className="text-xs text-emerald-600">2FA is enabled for your account.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
