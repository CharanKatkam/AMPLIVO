'use client';
import { useEffect, useRef, useState } from 'react';
import { PortalHeader } from '@/components/portal/PortalSidebar';
import { fileManagerService } from '@/services/moduleServices';
import { useToastStore } from '@/store/toastStore';
import { Download, File as FileIcon, FolderPlus, Loader2, Trash2, Upload } from 'lucide-react';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '');

interface FileFolderItem { id: string; name: string; created_at: string }
interface FileItem { id: string; name: string; original_name: string; mime_type: string | null; size: number | null; url: string; folder_id: string | null; created_at: string }

function formatSize(bytes: number | null) {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveUrl(url: string) {
  return url.startsWith('http') ? url : `${API_ORIGIN}${url}`;
}

export default function DocumentsPage() {
  const [folders, setFolders] = useState<FileFolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showToast = useToastStore((s) => s.showToast);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([fileManagerService.getFolders({ limit: 100 }), fileManagerService.getFiles({ limit: 200 })])
      .then(([f, fl]) => {
        setFolders(f ?? []);
        setFiles(fl ?? []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const visibleFiles = activeFolder ? files.filter((f) => f.folder_id === activeFolder) : files;

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const uploaded = await fileManagerService.uploadBinary(file, activeFolder ?? undefined);
        setFiles((prev) => [uploaded, ...prev]);
      }
      showToast('File uploaded successfully.', 'success');
    } catch {
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateFolder = async () => {
    const name = window.prompt('Folder name');
    if (!name?.trim()) return;
    try {
      const folder = await fileManagerService.createFolder({ name: name.trim() });
      setFolders((prev) => [...prev, folder]);
      showToast('Folder created.', 'success');
    } catch {
      showToast('Failed to create folder.', 'error');
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await fileManagerService.deleteFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      showToast('File deleted.', 'success');
    } catch {
      showToast('Failed to delete file.', 'error');
    }
  };

  if (loading) {
    return (
      <div>
        <PortalHeader title="Documents" subtitle="Shared files and deliverables" />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PortalHeader title="Documents" subtitle="Shared files and deliverables" />
      <div className="p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
            Couldn&apos;t load documents. <button onClick={load} className="underline font-medium">Retry</button>
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveFolder(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeFolder === null ? 'bg-[#4C1D95] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
            >
              All Files
            </button>
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFolder(f.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeFolder === f.id ? 'bg-[#4C1D95] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
              >
                {f.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreateFolder} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium px-3 py-2 rounded-xl hover:bg-slate-50">
              <FolderPlus size={16} /> New Folder
            </button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-[#4C1D95] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#3b1675] disabled:opacity-60"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {visibleFiles.length === 0 ? (
            <div className="text-center py-16">
              <FileIcon size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-400">No files here yet</p>
            </div>
          ) : (
            visibleFiles.map((f) => (
              <div key={f.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <FileIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{f.original_name}</p>
                  <p className="text-xs text-slate-400">{formatSize(f.size)} · {new Date(f.created_at).toLocaleDateString()}</p>
                </div>
                <a
                  href={resolveUrl(f.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={f.original_name}
                  className="p-2 text-slate-400 hover:text-[#4C1D95] hover:bg-[#4C1D95]/10 rounded-lg transition-colors"
                >
                  <Download size={16} />
                </a>
                <button onClick={() => handleDeleteFile(f.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
