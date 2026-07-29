import { CrmSubmission } from '@/types/crm';

export const crmSubmissions: CrmSubmission[] = [
  {
    id: 'SUB-001',
    employeeId: 'EMP-002',
    projectId: 'PRJ-001',
    taskId: 'TSK-001',
    clientId: 'CLT-001',
    service: 'Search Engine Optimization (SEO)',
    assignmentId: 'PRJ-001_TSK-001',
    assignedRole: 'SEO Specialist',
    title: 'Keyword Research & Audit Report',
    workSummary: 'Completed the initial keyword research and full site audit for Bhatia Pharmaceuticals.',
    deliverableType: 'Document',
    currentStatus: 'CRM_APPROVED',
    createdAt: '2026-05-28T10:00:00Z',
    lastUpdated: '2026-05-29T14:30:00Z',
    versions: [
      {
        versionId: 'VER-001',
        versionNumber: 1,
        submissionDate: '2026-05-28T10:00:00Z',
        files: [{ id: 'FILE-001', name: 'SEO_Audit_Report.pdf', url: '#' }],
        completionPercentage: 100,
        employeeComment: 'Here is the final audit report.',
        crmFeedback: 'Looks good, approved.',
        status: 'CRM_APPROVED',
      }
    ]
  }
];
