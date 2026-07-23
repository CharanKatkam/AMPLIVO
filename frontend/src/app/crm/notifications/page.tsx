'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bell, CheckCircle, Check, Users, IndianRupee,
  FolderKanban, FileText, ArrowRight
} from 'lucide-react';
import { useCrmStore } from '@/store/crmStore';
import { CrmNotification } from '@/types/crm';

const TYPE_ICONS: Record<string, { icon: React.ElementType, color: string, bg: string }> = {
  'lead_approved': { icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/20' },
  'lead_rejected': { icon: Users, color: 'text-red-400', bg: 'bg-red-500/20' },
  'client_created': { icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  'project_assigned': { icon: FolderKanban, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  'project_update': { icon: FolderKanban, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  'invoice_sent': { icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  'payment_received': { icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  'credentials_generated': { icon: CheckCircle, color: 'text-teal-400', bg: 'bg-teal-500/20' },
  'reminder': { icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/20' },
};

export default function CrmNotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useCrmStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  const getLink = (n: CrmNotification) => {
    switch (n.linkedType) {
      case 'lead': return `/crm/leads/${n.linkedId}`;
      case 'client': return `/crm/clients/${n.linkedId}`;
      case 'project': return `/crm/projects/${n.linkedId}`;
      case 'invoice': return '/crm/invoices';
      case 'payment': return '/crm/payments';
      default: return '#';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bell className="w-6 h-6 text-violet-500" /> Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllNotificationsRead}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <Check className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-[#12141f] border border-white/5 rounded-xl shadow-xl overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Bell className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p>You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map(n => {
              const { icon: Icon, color, bg } = TYPE_ICONS[n.type] || { icon: Bell, color: 'text-slate-400', bg: 'bg-white/5' };
              
              return (
                <div key={n.id} className={`flex gap-4 p-4 transition-colors ${n.read ? 'opacity-70 hover:bg-white/5' : 'bg-violet-500/5 hover:bg-violet-500/10'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className={`text-sm ${n.read ? 'text-slate-300' : 'text-white font-medium'}`}>
                        {n.title}
                      </p>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-500">{n.time}</p>
                        <p className="text-[10px] text-slate-600">{n.date}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-400 mt-1 pr-12">{n.message}</p>
                    
                    <div className="mt-3 flex items-center gap-4">
                      {n.linkedId && (
                        <Link 
                          href={getLink(n)}
                          className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1"
                        >
                          View Details <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                      
                      {!n.read && (
                        <button 
                          onClick={() => markNotificationRead(n.id)}
                          className="text-xs font-medium text-slate-500 hover:text-white transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
