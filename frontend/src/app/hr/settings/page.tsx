export default function HRSettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>Settings</h1>
        <p className="text-slate-500">Manage HR Portal preferences and configurations.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Email Templates</h3>
        <p className="text-slate-500 text-sm mb-4">Configure default email templates for offer letters and rejections.</p>
        <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">Manage Templates</button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Integration</h3>
        <p className="text-slate-500 text-sm mb-4">Connect with external job boards and assessment tools.</p>
        <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">Manage Integrations</button>
      </div>
    </div>
  );
}
