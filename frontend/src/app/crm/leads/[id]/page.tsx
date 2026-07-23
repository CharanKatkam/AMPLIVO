'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle, XCircle, Mail, Key, Briefcase,
  FileText, Clock, AlertCircle, RefreshCw, UserCheck, Phone,
  Building2, Globe, MapPin, Tag
} from 'lucide-react';
import { useCrmStore } from '@/store/crmStore';

export default function CrmLeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { 
    getLeadById, updateLeadStatus, reviewLead, sendInvoiceEmail, 
    generateCredentials, sendWelcomeEmail, convertLeadToClient 
  } = useCrmStore();
  
  const lead = getLeadById(params.id as string);
  const [reviewNotes, setReviewNotes] = useState(lead?.reviewNotes || '');
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  if (!lead) {
    return (
      <div className="p-6 text-center text-slate-400">
        <p>Lead not found.</p>
        <button onClick={() => router.push('/crm/leads')} className="mt-4 text-violet-400 hover:underline">
          Back to Leads
        </button>
      </div>
    );
  }

  const sl = lead.salesLead;

  // Handlers
  const handleReview = (status: 'Approved' | 'Rejected') => {
    reviewLead(lead.id, status, reviewNotes, status === 'Rejected' ? rejectReason : undefined);
    setShowReject(false);
  };

  const handleSendInvoice = () => {
    sendInvoiceEmail(lead.id);
  };

  const handleGenerateCreds = () => {
    generateCredentials(lead.id);
  };

  const handleConvert = () => {
    const client = convertLeadToClient(lead.id);
    if (client) {
      router.push(`/crm/clients/${client.id}`);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/crm/leads" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{sl.firstName} {sl.lastName}</h1>
              <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium bg-white/5 border-white/10 text-white`}>
                {lead.crmStatus}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{sl.company} · Received from Sales on {lead.receivedAt}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Handover Notes */}
          <div className="bg-[#12141f] border border-white/5 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-violet-400" />
              Sales Handover Details
            </h2>
            <div className="bg-violet-500/5 border border-violet-500/10 rounded-lg p-4 mb-5">
              <p className="text-sm text-slate-300 italic">&quot;{lead.salesLead.notes}&quot;</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white">
                  {lead.salesLead.assignedTo.charAt(0)}
                </span>
                <span>{lead.salesLead.assignedTo} (Sales Executive)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Company Size</p>
                <p className="text-sm font-medium text-white">{sl.companySize}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Industry</p>
                <p className="text-sm font-medium text-white">{sl.industry}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Approved Budget</p>
                <p className="text-sm font-medium text-emerald-400">₹{(sl.budget ?? 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Requested Services */}
          <div className="bg-[#12141f] border border-white/5 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-violet-400" />
              Required Services
            </h2>
            <div className="flex flex-wrap gap-2">
              {sl.interestedServices.map(s => (
                <span key={s} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-[#12141f] border border-white/5 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm text-white">{sl.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm text-white">{sl.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <Globe className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Website</p>
                  <p className="text-sm text-white">{sl.website}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Location</p>
                  <p className="text-sm text-white">{sl.city}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: CRM Actions & Workflow */}
        <div className="space-y-6">
          {/* CRM Workflow Engine */}
          <div className="bg-[#12141f] border border-white/5 rounded-xl p-5 shadow-xl shadow-black/20 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
            <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-violet-400" />
              Onboarding Workflow
            </h2>
            
            <div className="space-y-6">
              {/* STEP 1: Review */}
              <div className="relative pl-6 border-l border-white/10 pb-2">
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-[#12141f] ${lead.crmStatus === 'Pending Review' ? 'bg-violet-500' : 'bg-emerald-500'}`} />
                <h3 className="text-sm font-semibold text-white">1. Lead Review</h3>
                <p className="text-xs text-slate-500 mt-1">Review handover and verify scope.</p>
                
                {lead.crmStatus === 'Pending Review' && !showReject && (
                  <div className="mt-4 space-y-3">
                    <textarea
                      placeholder="Add CRM review notes..."
                      value={reviewNotes}
                      onChange={e => setReviewNotes(e.target.value)}
                      className="w-full h-20 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-violet-500/50 resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleReview('Approved')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => setShowReject(true)} className="px-4 bg-red-600/20 text-red-400 hover:bg-red-600/30 text-sm font-medium py-2 rounded-lg transition-colors">
                        Reject
                      </button>
                    </div>
                  </div>
                )}
                
                {showReject && (
                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Reason for rejection..."
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      className="w-full bg-white/5 border border-red-500/30 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleReview('Rejected')} className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                        Confirm Reject
                      </button>
                      <button onClick={() => setShowReject(false)} className="px-4 bg-white/5 text-slate-400 hover:bg-white/10 text-sm font-medium py-2 rounded-lg transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                {lead.crmStatus === 'Rejected' && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
                    <span className="font-semibold">Rejected:</span> {lead.rejectionReason}
                  </div>
                )}
              </div>

              {/* STEP 2: Invoice */}
              <div className="relative pl-6 border-l border-white/10 pb-2">
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-[#12141f] ${
                  lead.crmStatus === 'Approved' ? 'bg-violet-500' :
                  ['Pending Review', 'Rejected'].includes(lead.crmStatus) ? 'bg-slate-700' : 'bg-emerald-500'
                }`} />
                <h3 className="text-sm font-semibold text-white">2. Send Invoice</h3>
                <p className="text-xs text-slate-500 mt-1">Send 25% advance invoice generated by Sales.</p>
                
                {lead.crmStatus === 'Approved' && (
                  <button onClick={handleSendInvoice} className="mt-4 w-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" /> Email Invoice to Client
                  </button>
                )}
                
                {lead.salesInvoice && (
                  <div className="mt-3 flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">{lead.salesInvoice.invoiceNumber}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">₹{lead.salesInvoice.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* STEP 3: Payment Tracking (Mocked external action) */}
              <div className="relative pl-6 border-l border-white/10 pb-2">
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-[#12141f] ${
                  lead.crmStatus === 'Invoice Sent' || lead.crmStatus === 'Payment Pending' ? 'bg-violet-500' :
                  ['Payment Verified', 'Credentials Sent', 'Client Created'].includes(lead.crmStatus) ? 'bg-emerald-500' : 'bg-slate-700'
                }`} />
                <h3 className="text-sm font-semibold text-white">3. Payment Verification</h3>
                <p className="text-xs text-slate-500 mt-1">Wait for client payment or verify manually.</p>
                
                {(lead.crmStatus === 'Invoice Sent' || lead.crmStatus === 'Payment Pending') && (
                  <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-300">
                      Awaiting payment. Check <Link href="/crm/payments" className="underline font-semibold">Payments tab</Link> to verify when received.
                    </p>
                  </div>
                )}
              </div>

              {/* STEP 4: Credentials */}
              <div className="relative pl-6 border-l border-white/10 pb-2">
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-[#12141f] ${
                  lead.crmStatus === 'Payment Verified' ? 'bg-violet-500' :
                  ['Credentials Sent', 'Client Created'].includes(lead.crmStatus) ? 'bg-emerald-500' : 'bg-slate-700'
                }`} />
                <h3 className="text-sm font-semibold text-white">4. Client Credentials</h3>
                <p className="text-xs text-slate-500 mt-1">Generate and send Client Portal access.</p>
                
                {lead.crmStatus === 'Payment Verified' && (
                  <button onClick={handleGenerateCreds} className="mt-4 w-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Key className="w-4 h-4" /> Generate & Send Login
                  </button>
                )}

                {lead.credentials && (
                  <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Username</span>
                      <span className="text-white font-medium">{lead.credentials.username}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Temp Password</span>
                      <span className="text-white font-mono">{lead.credentials.tempPassword}</span>
                    </div>
                    <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Credentials emailed to client
                    </p>
                  </div>
                )}
              </div>

              {/* STEP 5: Convert */}
              <div className="relative pl-6">
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-[#12141f] ${
                  lead.crmStatus === 'Credentials Sent' ? 'bg-violet-500' :
                  lead.crmStatus === 'Client Created' ? 'bg-emerald-500' : 'bg-slate-700'
                }`} />
                <h3 className="text-sm font-semibold text-white">5. Convert to Client</h3>
                <p className="text-xs text-slate-500 mt-1">Onboarding complete. Move to Clients database.</p>
                
                {lead.crmStatus === 'Credentials Sent' && (
                  <button onClick={handleConvert} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <UserCheck className="w-4 h-4" /> Finalize & Convert
                  </button>
                )}
                
                {lead.crmStatus === 'Client Created' && (
                  <div className="mt-4 text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-emerald-400">Successfully Onboarded</p>
                    <Link href={`/crm/clients/${lead.convertedToClientId}`} className="text-xs text-white hover:underline mt-1 block">
                      View Client Profile →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
