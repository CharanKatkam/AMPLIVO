'use client';
import { useEffect, useRef, useState } from 'react';
import { Send, Paperclip, Loader2, MessageSquare } from 'lucide-react';
import { messagingService, ConversationRead, MessageRead } from '@/services/portalServices';
import { fileManagerService } from '@/services/moduleServices';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';

export default function MessagesPage() {
  const [conversation, setConversation] = useState<ConversationRead | null>(null);
  const [messages, setMessages] = useState<MessageRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const showToast = useToastStore((s) => s.showToast);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const conv = await messagingService.getOrCreateConversation();
      setConversation(conv);
      const msgs = await messagingService.getMessages(conv.id);
      setMessages(msgs);
      await messagingService.markRead(conv.id);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!msgText.trim() || !conversation) return;
    setSending(true);
    try {
      const sent = await messagingService.sendMessage(conversation.id, msgText.trim());
      setMessages((prev) => [...prev, sent]);
      setMsgText('');
    } catch {
      showToast('Failed to send message.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleAttach = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !conversation) return;
    setAttaching(true);
    try {
      const file = fileList[0];
      const uploaded = await fileManagerService.uploadBinary(file);
      const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '');
      const url = uploaded.url.startsWith('http') ? uploaded.url : `${apiOrigin}${uploaded.url}`;
      const sent = await messagingService.sendMessage(conversation.id, `📎 ${uploaded.original_name} - ${url}`);
      setMessages((prev) => [...prev, sent]);
      showToast('File attached and sent.', 'success');
    } catch {
      showToast('Failed to attach file.', 'error');
    } finally {
      setAttaching(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] p-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm h-full flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="h-[calc(100vh-4rem)] p-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm h-full flex flex-col items-center justify-center gap-3 text-slate-400">
          <MessageSquare size={32} />
          <p className="text-sm">Couldn&apos;t load your conversation.</p>
          <button onClick={load} className="text-sm text-[#4C1D95] font-medium hover:underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm h-full flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">{conversation.subject}</h2>
          <p className="text-xs text-slate-500">Direct line to your Amplivo account team</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <MessageSquare size={48} className="mb-4" />
              <p className="text-sm">No messages yet — say hello!</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[70%]">
                    <div className={`flex items-baseline gap-2 mb-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs font-semibold text-slate-700">{isMine ? 'You' : 'Amplivo Team'}</span>
                      <span className="text-[10px] text-slate-400">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${isMine ? 'bg-[#4C1D95] text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-[#4C1D95]/20 focus-within:border-[#4C1D95] transition-all">
            <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleAttach(e.target.files)} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={attaching}
              className="p-2 text-slate-400 hover:text-[#4C1D95] rounded-full hover:bg-white transition-colors disabled:opacity-50"
            >
              {attaching ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
            </button>
            <textarea
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none focus:outline-none resize-none max-h-32 min-h-[44px] py-3 text-sm text-slate-700"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!msgText.trim() || sending}
              className={`p-3 rounded-xl flex items-center justify-center transition-colors shrink-0 mb-0.5 ${
                msgText.trim() && !sending ? 'bg-[#4C1D95] text-white hover:bg-[#3b1574]' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
