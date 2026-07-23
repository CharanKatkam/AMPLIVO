'use client';
import { useHrStore } from '@/store/hrStore';
import { StatusChip } from '@/components/hr/StatusChip';
import { Search, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function OffersPage() {
  const offers = useHrStore(state => state.offers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOffers = offers.filter(offer => 
    offer.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>Offers</h1>
        <p className="text-slate-500">Manage candidate offers and negotiations.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex items-center bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate or position..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-semibold">Candidate</th>
                <th className="px-6 py-4 font-semibold">Position</th>
                <th className="px-6 py-4 font-semibold">Salary Details</th>
                <th className="px-6 py-4 font-semibold">Joining Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredOffers.map(offer => (
                <tr key={offer.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800">{offer.candidateName}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700">{offer.jobTitle}</div>
                    <div className="text-slate-500 text-xs">{offer.department}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-emerald-600">{offer.salary}</td>
                  <td className="px-6 py-4 text-slate-600">{new Date(offer.joiningDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <StatusChip status={offer.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors" title="View Offer Letter">
                        <FileText size={14} /> View
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-semibold transition-colors" title="Mark Accepted">
                        <CheckCircle size={14} /> Accept
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg text-xs font-semibold transition-colors" title="Mark Declined">
                        <XCircle size={14} /> Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOffers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No offers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
