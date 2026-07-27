"""Canonical status vocabulary for the deal-closing half of the business
workflow (visitor -> lead -> sales -> CRM -> advance payment -> client
account -> project).

`Lead.status` is a free-text column (no DB enum/CheckConstraint - see the
0019 migration for why), so nothing enforces these values at the database
level. Every write to `Lead.status` should use one of these constants
instead of a hardcoded string, so the vocabulary can't drift again the way
it already had (compare `"New"` in consultation_requests/service.py vs
`"new"` as the model's own prior default).

Once a lead reaches PROJECT_CREATED its status freezes, except for one
final write to PROJECT_COMPLETED when the project is closed out - the
delivery-phase states (TASKS_ASSIGNED/IN_PROGRESS/SUBMITTED/UNDER_REVIEW/
APPROVED/FINAL_INVOICE_CREATED/FINAL_PAID) are intentionally not tracked
here; they live on Task/TaskSubmission/Invoice, which already model
per-task and per-invoice granularity that a single Lead column cannot.
"""

NEW_LEAD = "NEW_LEAD"
MEETING_SCHEDULED = "MEETING_SCHEDULED"
MEETING_COMPLETED = "MEETING_COMPLETED"
REJECTED = "REJECTED"
LOST = "LOST"
PROPOSAL_CREATED = "PROPOSAL_CREATED"
ADVANCE_INVOICE_CREATED = "ADVANCE_INVOICE_CREATED"
CRM_PENDING = "CRM_PENDING"
CRM_APPROVED = "CRM_APPROVED"
EMAIL_SENT = "EMAIL_SENT"
ADVANCE_PAID = "ADVANCE_PAID"
CLIENT_ACCOUNT_CREATED = "CLIENT_ACCOUNT_CREATED"
PROJECT_CREATED = "PROJECT_CREATED"
PROJECT_COMPLETED = "PROJECT_COMPLETED"

# Terminal states - no further transition is expected once one of these is set.
TERMINAL_LEAD_STATUSES = frozenset({REJECTED, LOST, PROJECT_COMPLETED})

LEAD_PIPELINE_ORDER = (
    NEW_LEAD,
    MEETING_SCHEDULED,
    MEETING_COMPLETED,
    PROPOSAL_CREATED,
    ADVANCE_INVOICE_CREATED,
    CRM_PENDING,
    CRM_APPROVED,
    EMAIL_SENT,
    ADVANCE_PAID,
    CLIENT_ACCOUNT_CREATED,
    PROJECT_CREATED,
    PROJECT_COMPLETED,
)
