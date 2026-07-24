"""Sales Dashboard rollup + reports.

Composes across leads/meetings/finance/campaigns/activity_timeline/notifications
directly via SQL aggregates — there's no purpose-built KPI endpoint anywhere
else in the codebase to reuse, and the frontend previously had to (or simply
didn't) stitch this together client-side from several separate list endpoints.
"""
from __future__ import annotations

import uuid
from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.activity_timeline.models import ActivityLog
from app.modules.campaigns.models import Campaign
from app.modules.crm.models import Client
from app.modules.finance.models import Invoice
from app.modules.leads.models import Lead
from app.modules.meetings.models import Meeting
from app.modules.notifications.models import Notification

WON_STATUSES = ("won", "closed_won")
LOST_STATUSES = ("lost", "closed_lost")
OPEN_EXCLUDED_STATUSES = WON_STATUSES + LOST_STATUSES + ("converted",)


def _is_sales_scoped(role_slug: str | None) -> bool:
    return role_slug == "sales"


class SalesAnalyticsService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_dashboard_stats(self, *, current_user_id: uuid.UUID, role_slug: str | None) -> dict:
        scoped = _is_sales_scoped(role_slug)
        db = self._db
        today = date.today()

        lead_filter = [Lead.assigned_to == current_user_id] if scoped else []

        # One round-trip for all lead-derived counts instead of five separate
        # queries — this endpoint is remote-DB latency bound (each round trip
        # to Supabase runs several hundred ms here), so query *count* matters.
        lead_counts_row = (
            await db.execute(
                select(
                    func.count().filter(func.date(Lead.created_at) == today),
                    func.count(),
                    func.count().filter(func.lower(Lead.status).notin_(OPEN_EXCLUDED_STATUSES)),
                    func.count().filter(func.lower(Lead.status).in_(WON_STATUSES)),
                    func.count().filter(func.lower(Lead.status).in_(LOST_STATUSES)),
                ).select_from(Lead).where(*lead_filter)
            )
        ).one()
        today_leads, total_leads, open_opportunities, closed_won, closed_lost = lead_counts_row

        followup_filter = [Lead.assigned_to == current_user_id] if scoped else []
        from app.modules.leads.models import LeadFollowup
        pending_followups = await db.scalar(
            select(func.count()).select_from(LeadFollowup).join(Lead, LeadFollowup.lead_id == Lead.id)
            .where(func.lower(LeadFollowup.status) == "pending", *followup_filter)
        )

        meeting_filter = [Meeting.assigned_to == current_user_id] if scoped else []
        meetings_today = await db.scalar(
            select(func.count()).select_from(Meeting)
            .where(func.date(Meeting.scheduled_at) == today, *meeting_filter)
        )

        client_filter = [Client.assigned_to == current_user_id] if scoped else []
        revenue_this_month = await db.scalar(
            select(func.coalesce(func.sum(Invoice.total_amount), 0.0))
            .select_from(Invoice).join(Client, Invoice.client_id == Client.id)
            .where(
                func.lower(Invoice.status) == "paid",
                func.extract("year", Invoice.issue_date) == today.year,
                func.extract("month", Invoice.issue_date) == today.month,
                *client_filter,
            )
        )

        campaign_filter = [Campaign.manager_id == current_user_id] if scoped else []
        assigned_campaigns = await db.scalar(select(func.count()).select_from(Campaign).where(*campaign_filter))

        conversion_rate = round((closed_won or 0) / total_leads * 100, 1) if total_leads else 0.0

        activity_filter = []
        if scoped:
            scoped_lead_ids = select(Lead.id).where(Lead.assigned_to == current_user_id)
            activity_filter = [ActivityLog.entity_id.in_(scoped_lead_ids)]
        recent_activity_rows = (
            await db.execute(
                select(ActivityLog)
                .where(ActivityLog.entity_type == "lead", *activity_filter)
                .order_by(ActivityLog.created_at.desc())
                .limit(10)
            )
        ).scalars().all()

        unread_notifications = await db.scalar(
            select(func.count()).select_from(Notification)
            .where(Notification.user_id == current_user_id, Notification.is_read.is_(False))
        )

        trend = await self._monthly_trend(lead_filter)

        return {
            "today_leads": today_leads or 0,
            "open_opportunities": open_opportunities or 0,
            "closed_won": closed_won or 0,
            "closed_lost": closed_lost or 0,
            "pending_followups": pending_followups or 0,
            "meetings_today": meetings_today or 0,
            "revenue_this_month": float(revenue_this_month or 0.0),
            "conversion_rate": conversion_rate,
            "assigned_campaigns": assigned_campaigns or 0,
            "unread_notifications": unread_notifications or 0,
            "recent_activity": [
                {
                    "id": str(a.id), "entity_id": str(a.entity_id) if a.entity_id else None,
                    "action": a.action, "description": a.description, "created_at": a.created_at.isoformat(),
                }
                for a in recent_activity_rows
            ],
            "monthly_trend": trend,
        }

    async def _monthly_trend(self, lead_filter: list) -> list[dict]:
        db = self._db
        today = date.today()
        months = []
        cursor = today.replace(day=1)
        for _ in range(12):
            months.append(cursor)
            cursor = (cursor - timedelta(days=1)).replace(day=1)
        months.reverse()
        window_start = months[0]

        # Single grouped query for the whole 12-month window (was 24 queries,
        # two per month, in a Python loop — the #1 contributor to a ~27s
        # dashboard load against the remote DB).
        month_expr = func.date_trunc("month", Lead.created_at)
        rows = (
            await db.execute(
                select(
                    month_expr,
                    func.count(),
                    func.count().filter(func.lower(Lead.status).in_(WON_STATUSES)),
                    func.count().filter(func.lower(Lead.status).in_(LOST_STATUSES)),
                )
                .where(Lead.created_at >= window_start, *lead_filter)
                .group_by(month_expr)
            )
        ).all()
        by_month = {row[0].strftime("%Y-%m"): {"leads": row[1], "won": row[2], "lost": row[3]} for row in rows}

        return [
            {"month": m.strftime("%Y-%m"), **by_month.get(m.strftime("%Y-%m"), {"leads": 0, "won": 0, "lost": 0})}
            for m in months
        ]

    async def get_report(self, report_type: str, *, current_user_id: uuid.UUID, role_slug: str | None) -> dict:
        scoped = _is_sales_scoped(role_slug)
        db = self._db
        lead_filter = [Lead.assigned_to == current_user_id] if scoped else []
        client_filter = [Client.assigned_to == current_user_id] if scoped else []

        if report_type == "conversion":
            total = await db.scalar(select(func.count()).select_from(Lead).where(*lead_filter))
            won = await db.scalar(select(func.count()).select_from(Lead).where(func.lower(Lead.status).in_(WON_STATUSES), *lead_filter))
            lost = await db.scalar(select(func.count()).select_from(Lead).where(func.lower(Lead.status).in_(LOST_STATUSES), *lead_filter))
            return {"total_leads": total or 0, "won": won or 0, "lost": lost or 0,
                    "conversion_rate": round((won or 0) / total * 100, 1) if total else 0.0}

        if report_type == "won_vs_lost":
            rows = (await db.execute(
                select(Lead.status, func.count()).where(*lead_filter).group_by(Lead.status)
            )).all()
            return {"by_status": [{"status": r[0], "count": r[1]} for r in rows]}

        if report_type == "revenue":
            rows = (await db.execute(
                select(func.extract("year", Invoice.issue_date), func.extract("month", Invoice.issue_date),
                       func.coalesce(func.sum(Invoice.total_amount), 0.0))
                .join(Client, Invoice.client_id == Client.id)
                .where(func.lower(Invoice.status) == "paid", *client_filter)
                .group_by(func.extract("year", Invoice.issue_date), func.extract("month", Invoice.issue_date))
                .order_by(func.extract("year", Invoice.issue_date), func.extract("month", Invoice.issue_date))
            )).all()
            return {"monthly_revenue": [{"year": int(r[0]), "month": int(r[1]), "amount": float(r[2])} for r in rows]}

        if report_type == "monthly_growth":
            return {"monthly_trend": await self._monthly_trend(lead_filter)}

        if report_type == "campaign_performance":
            campaign_filter = [Campaign.manager_id == current_user_id] if scoped else []
            rows = (await db.execute(
                select(Campaign.id, Campaign.name, Campaign.budget, Campaign.spent_amount, Campaign.status)
                .where(*campaign_filter)
            )).all()
            return {"campaigns": [
                {"id": str(r[0]), "name": r[1], "budget": r[2], "spent": r[3], "status": r[4]} for r in rows
            ]}

        if report_type in ("performance", "team_performance"):
            all_rows = (await db.execute(select(Lead.assigned_to, Lead.status))).all()
            by_rep: dict[str, dict] = {}
            for assigned_to, status in all_rows:
                key = str(assigned_to) if assigned_to else "unassigned"
                bucket = by_rep.setdefault(key, {"assigned_to": key, "total_leads": 0, "won": 0, "lost": 0})
                bucket["total_leads"] += 1
                if status and status.lower() in WON_STATUSES:
                    bucket["won"] += 1
                elif status and status.lower() in LOST_STATUSES:
                    bucket["lost"] += 1
            return {"team_performance": list(by_rep.values())}

        return {}
