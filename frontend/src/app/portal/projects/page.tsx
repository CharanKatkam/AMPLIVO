'use client';
import { useEffect, useState } from 'react';
import { PortalHeader } from '@/components/portal/PortalSidebar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { projectService, taskService } from '@/services/crmService';
import { useToastStore } from '@/store/toastStore';
import { ChevronDown, ChevronRight, FolderKanban, Loader2 } from 'lucide-react';

interface ProjectItem { id: string; name: string; description: string | null; status: string; start_date: string | null; end_date: string | null }
interface TaskItem { id: string; title: string; status: string; priority: string; due_date: string | null; project_id: string | null }

const TASK_STATUSES = ['todo', 'in_progress', 'done'];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [tasksByProject, setTasksByProject] = useState<Record<string, TaskItem[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  const load = () => {
    setLoading(true);
    setError(false);
    projectService
      .getAll({ page_size: 100 })
      .then(async (res) => {
        const items: ProjectItem[] = res?.items ?? [];
        setProjects(items);
        const entries = await Promise.all(
          items.map(async (p) => {
            try {
              const t = await taskService.getAll({ project_id: p.id, page_size: 100 });
              return [p.id, t?.items ?? []] as const;
            } catch {
              return [p.id, []] as const;
            }
          })
        );
        setTasksByProject(Object.fromEntries(entries));
        setExpanded(new Set(items.slice(0, 1).map((p) => p.id)));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateTaskStatus = async (task: TaskItem, status: string) => {
    try {
      await taskService.update(task.id, { status });
      setTasksByProject((prev) => ({
        ...prev,
        [task.project_id ?? '']: (prev[task.project_id ?? ''] ?? []).map((t) => (t.id === task.id ? { ...t, status } : t)),
      }));
      showToast('Task status updated.', 'success');
    } catch {
      showToast('Failed to update task status.', 'error');
    }
  };

  if (loading) {
    return (
      <div>
        <PortalHeader title="Projects & Tasks" subtitle="Track delivery progress" />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PortalHeader title="Projects & Tasks" subtitle="Track delivery progress" />
      <div className="p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
            Couldn&apos;t load projects. <button onClick={load} className="underline font-medium">Retry</button>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 text-center py-16">
            <FolderKanban size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-400">No projects yet</p>
          </div>
        ) : (
          projects.map((project) => {
            const tasks = tasksByProject[project.id] ?? [];
            const done = tasks.filter((t) => t.status === 'done').length;
            const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
            const isOpen = expanded.has(project.id);
            return (
              <div key={project.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <button onClick={() => toggleExpand(project.id)} className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50">
                  {isOpen ? <ChevronDown size={18} className="text-slate-400 flex-shrink-0" /> : <ChevronRight size={18} className="text-slate-400 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">{project.name}</span>
                      <StatusBadge status={project.status} />
                    </div>
                    {project.description && <p className="text-xs text-slate-500">{project.description}</p>}
                  </div>
                  <div className="w-40 flex-shrink-0">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{done}/{tasks.length} tasks</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#4C1D95] rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {tasks.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No tasks in this project yet</p>
                    ) : (
                      tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-4 px-5 py-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-800">{task.title}</p>
                            <p className="text-xs text-slate-400 capitalize">
                              {task.priority} priority{task.due_date ? ` · Due ${new Date(task.due_date).toLocaleDateString()}` : ''}
                            </p>
                          </div>
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task, e.target.value)}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 capitalize bg-slate-50"
                          >
                            {TASK_STATUSES.map((s) => (
                              <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
                            ))}
                          </select>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
