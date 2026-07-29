"""Free-text vocabulary additions for the finance module's advance/final
invoice workflow and the two-step (Finance, then CRM) payment verification.

`Invoice.status` and `Payment.status` remain plain Text columns (see
migration 0020/0021 docstrings) - existing values (draft/sent/paid/overdue/
cancelled for a standard invoice; pending/completed/failed for a legacy
payment row) are untouched and still valid for `invoice_type=STANDARD`.
These constants are only used for the new advance/final pipeline.
"""

INVOICE_TYPE_STANDARD = "standard"
INVOICE_TYPE_ADVANCE = "advance"
INVOICE_TYPE_FINAL = "final"

# Invoice.status values used once invoice_type is ADVANCE or FINAL.
INVOICE_STATUS_CRM_PENDING = "CRM_PENDING"
INVOICE_STATUS_CRM_APPROVED = "CRM_APPROVED"
INVOICE_STATUS_EMAIL_SENT = "EMAIL_SENT"
INVOICE_STATUS_ADVANCE_PAID = "ADVANCE_PAID"
INVOICE_STATUS_FINAL_PAID = "FINAL_PAID"

# Payment.status values for the manual two-step verification flow.
PAYMENT_STATUS_SUBMITTED = "submitted"
PAYMENT_STATUS_FINANCE_VERIFIED = "finance_verified"
PAYMENT_STATUS_CRM_VERIFIED = "crm_verified"
PAYMENT_STATUS_REJECTED = "rejected"
