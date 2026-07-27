"""Minimal PDF rendering for proposals and invoices.

No PDF generation existed anywhere in the codebase before this - uses
fpdf2 (pure Python, no system binary/library dependency) so the existing
deployment doesn't need a new system package.
"""
from __future__ import annotations

from fpdf import FPDF


def _line(pdf: FPDF, text: str, height: float = 7) -> None:
    """multi_cell(0, ...) ("use remaining page width") occasionally throws
    "Not enough horizontal space" on the second+ call in a chain in fpdf2 -
    passing the actual effective page width instead avoids that entirely."""
    pdf.set_x(pdf.l_margin)
    pdf.multi_cell(pdf.epw, height, text)


def _base_pdf(title: str) -> FPDF:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, "Amplivo", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)
    pdf.set_font("Helvetica", "", 11)
    return pdf


def render_proposal_pdf(proposal) -> bytes:
    pdf = _base_pdf(f"Proposal: {proposal.title}")
    _line(pdf, f"Status: {proposal.status}")
    if proposal.amount is not None:
        _line(pdf, f"Amount: {proposal.amount:,.2f}")
    if proposal.description:
        pdf.ln(4)
        _line(pdf, proposal.description)
    return bytes(pdf.output())


def render_invoice_pdf(invoice) -> bytes:
    pdf = _base_pdf(f"Invoice {invoice.invoice_number}")
    _line(pdf, f"Type: {invoice.invoice_type}    Status: {invoice.status}")
    _line(pdf, f"Issue date: {invoice.issue_date}    Due date: {invoice.due_date}")
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 11)
    pdf.set_x(pdf.l_margin)
    pdf.cell(120, 8, "Description", border=1)
    pdf.cell(20, 8, "Qty", border=1, align="R")
    pdf.cell(25, 8, "Unit", border=1, align="R")
    pdf.cell(25, 8, "Total", border=1, align="R", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    for item in invoice.items:
        pdf.set_x(pdf.l_margin)
        pdf.cell(120, 8, item.description[:60], border=1)
        pdf.cell(20, 8, f"{item.quantity:g}", border=1, align="R")
        pdf.cell(25, 8, f"{item.unit_price:,.2f}", border=1, align="R")
        pdf.cell(25, 8, f"{item.total:,.2f}", border=1, align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(4)
    _line(pdf, f"Subtotal: {invoice.currency} {invoice.subtotal:,.2f}")
    _line(pdf, f"Tax: {invoice.currency} {invoice.tax_total:,.2f}")
    pdf.set_font("Helvetica", "B", 12)
    _line(pdf, f"Total: {invoice.currency} {invoice.total_amount:,.2f}", height=8)
    if invoice.notes:
        pdf.set_font("Helvetica", "", 11)
        pdf.ln(4)
        _line(pdf, invoice.notes)
    return bytes(pdf.output())
