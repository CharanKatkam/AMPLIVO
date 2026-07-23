'use client';

import { use, useState, useEffect } from 'react';
import { useCrmStore } from '@/store/crmStore';
import { EmployeeHeader } from '@/components/employee/EmployeeHeader';
import { UploadCloud, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeSubmitWork({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = use(searchParams);
  const taskId = resolvedParams.taskId as string | undefined;
  const projectId = resolvedParams.projectId as string | undefined;
  const subId = resolvedParams.id as string | undefined;
  
  const { activeEmployeeId, getTasksByEmployee, getProjectsByEmployee, submissions, submitToCRM, resubmitToCRM } = useCrmStore();
  
  const existingSub = subId ? submissions.find(s => s.id === subId) : undefined;
  const isRevision = !!existingSub;
  
  const tasks = getTasksByEmployee(activeEmployeeId || '');
  const [selectedTaskId, setSelectedTaskId] = useState(taskId || (existingSub?.taskId) || '');
  
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const project = getProjectsByEmployee(activeEmployeeId || '').find(p => p.id === selectedTask?.projectId);

  const [title, setTitle] = useState(existingSub?.title || '');
  const [workSummary, setWorkSummary] = useState(existingSub?.workSummary || '');
  const [deliverableType, setDeliverableType] = useState(existingSub?.deliverableType || 'Document');
  const [url, setUrl] = useState('');
  const [employeeComment, setEmployeeComment] = useState('');
  
  const [submitted, setSubmitted] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (existingSub) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(existingSub.title);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWorkSummary(existingSub.workSummary);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDeliverableType(existingSub.deliverableType);
    }
  }, [existingSub]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !project) return;
    
    if (isRevision && existingSub) {
      resubmitToCRM(existingSub.id, {
        externalUrl: url,
        employeeComment,
        revisionNotes: employeeComment
      });
    } else {
      submitToCRM({
        employeeId: activeEmployeeId!,
        projectId: project.id,
        taskId: selectedTask.id,
        clientId: project.clientId,
        service: selectedTask.service,
        assignedRole: selectedTask.assignedRole,
        title,
        workSummary,
        deliverableType,
        versions: [{
          versionId: '', versionNumber: 1, submissionDate: '', files: [], status: 'PENDING_CRM_REVIEW', completionPercentage: 100,
          externalUrl: url, employeeComment
        }]
      });
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col min-h-full">
        <EmployeeHeader title={isRevision ? "Revision Submitted" : "Work Submitted"} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Success!</h2>
          <p className="text-slate-500 mb-6 max-w-md">
            Your {isRevision ? 'revision' : 'work'} has been submitted to the CRM. The account manager will review it shortly.
          </p>
          <div className="flex gap-4">
            <Link href="/employee" className="px-6 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200">
              Back to Dashboard
            </Link>
            <Link href="/employee/projects" className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">
              View My Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latestVersion = existingSub?.versions[0];

  return (
    <div className="flex flex-col min-h-full">
      <EmployeeHeader title={isRevision ? "Resubmit Revision" : "Submit Work"} subtitle="Send your deliverables for CRM review" />
      
      <div className="p-6 max-w-3xl mx-auto w-full">
        <Link href="/employee/tasks" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Tasks
        </Link>
        
        {existingSub && existingSub.currentStatus === 'CRM_CHANGES_REQUESTED' && (
          <div className="mb-6 bg-red-50 p-5 rounded-xl border border-red-200">
            <h3 className="text-red-800 font-bold mb-2 flex items-center gap-2">
              <AlertCircle size={18} /> CRM Feedback
            </h3>
            <p className="text-red-700 text-sm whitespace-pre-wrap">{latestVersion?.crmFeedback || 'Changes requested by CRM.'}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Task</label>
            <select 
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={isRevision}
            >
              <option value="">-- Select a task --</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.projectName})</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Submission Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={isRevision}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deliverable Type</label>
            <select 
              value={deliverableType}
              onChange={(e) => setDeliverableType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isRevision}
            >
              <option>Document</option>
              <option>Spreadsheet</option>
              <option>Design Asset</option>
              <option>Code / PR</option>
              <option>External Link</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">External URL (Optional)</label>
            <input 
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://docs.google.com/..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">File Upload</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
              <UploadCloud size={24} className="mb-2" />
              <div className="text-sm">Click to upload or drag and drop</div>
              <div className="text-xs mt-1">PDF, DOCX, ZIP up to 50MB (Mock UI)</div>
            </div>
          </div>

          {!isRevision && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Work Summary</label>
              <textarea 
                value={workSummary}
                onChange={(e) => setWorkSummary(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{isRevision ? "Revision Notes" : "Comments for CRM"}</label>
            <textarea 
              value={employeeComment}
              onChange={(e) => setEmployeeComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={isRevision ? "Explain what was changed..." : "Any additional notes..."}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Link href="/employee/tasks" className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
              Cancel
            </Link>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
              <UploadCloud size={16} /> {isRevision ? "Resubmit to CRM" : "Submit to CRM"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
