"""HR recruitment dashboard rollup + reports.

Composes across careers/interviews/offers/activity_timeline/notifications via
combined SQL aggregates. Designed with query *count* in mind from the start —
the Sales module's equivalent endpoint originally shipped with a per-month
Python loop (24 extra round-trips) that took 27s against the remote DB before
being fixed; this one uses FILTER/GROUP BY throughout instead.
"""
from __future__ import annotations

import uuid
from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.activity_timeline.models import ActivityLog
from app.modules.careers.models import Interview, JobApplication, JobOpening, Offer
from app.modules.notifications.models import Notification
from app.modules.users.models import Department

# Job/Application status strings are whatever the frontend sends verbatim
# (e.g. "Published"/"New") — every comparison here goes through func.lower()
# so these tuples just need to be lowercase, not a separate translation layer.
ACTIVE_JOB_STATUSES = ("published", "open")
NEW_APPLICATION_STATUSES = ("new", "submitted")
SHORTLISTED_STATUSES = ("shortlisted", "interviewing", "offered", "hired")


class CareersAnalyticsService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_dashboard_stats(self, *, current_user_id: uuid.UUID | None = None) -> dict:
        db = self._db
        today = date.today()

        job_row = (
            await db.execute(
                select(
                    func.count().filter(func.lower(JobOpening.status).in_(ACTIVE_JOB_STATUSES)),
                    func.count(),
                ).select_from(JobOpening)
            )
        ).one()
        active_jobs, total_jobs = job_row

        app_row = (
            await db.execute(
                select(
                    func.count(),
                    func.count().filter(func.lower(JobApplication.status).in_(NEW_APPLICATION_STATUSES)),
                    func.count().filter(func.lower(JobApplication.status).in_(SHORTLISTED_STATUSES)),
                    func.count().filter(func.lower(JobApplication.status) == "hired"),
                    func.count().filter(func.lower(JobApplication.status) == "rejected"),
                ).select_from(JobApplication)
            )
        ).one()
        total_applications, new_applications, shortlisted, hired, rejected = app_row

        interview_row = (
            await db.execute(
                select(
                    func.count().filter(func.date(Interview.scheduled_at) == today),
                    func.count().filter(func.lower(Interview.status) == "scheduled"),
                ).select_from(Interview)
            )
        ).one()
        interviews_today, pending_interviews = interview_row

        offers_sent = await db.scalar(
            select(func.count()).select_from(Offer).where(func.lower(Offer.status).in_(("sent", "accepted")))
        )

        avg_time_to_hire = await db.scalar(
            select(func.avg(func.extract("epoch", Offer.updated_at - JobApplication.created_at) / 86400.0))
            .select_from(Offer)
            .join(JobApplication, Offer.application_id == JobApplication.id)
            .where(func.lower(Offer.status) == "accepted")
        )

        recent_activity_rows = (
            await db.execute(
                select(ActivityLog)
                .where(ActivityLog.entity_type == "job_application")
                .order_by(ActivityLog.created_at.desc())
                .limit(10)
            )
        ).scalars().all()

        unread_notifications = 0
        if current_user_id is not None:
            unread_notifications = await db.scalar(
                select(func.count()).select_from(Notification)
                .where(Notification.user_id == current_user_id, Notification.is_read.is_(False))
            )

        trend = await self._monthly_trend()

        return {
            "active_jobs": active_jobs or 0,
            "total_jobs": total_jobs or 0,
            "total_applications": total_applications or 0,
            "new_applications": new_applications or 0,
            "shortlisted": shortlisted or 0,
            "hired": hired or 0,
            "rejected": rejected or 0,
            "interviews_today": interviews_today or 0,
            "pending_interviews": pending_interviews or 0,
            "offers_sent": offers_sent or 0,
            "avg_time_to_hire_days": round(float(avg_time_to_hire), 1) if avg_time_to_hire is not None else None,
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

    async def _monthly_trend(self) -> list[dict]:
        db = self._db
        today = date.today()
        months = []
        cursor = today.replace(day=1)
        for _ in range(12):
            months.append(cursor)
            cursor = (cursor - timedelta(days=1)).replace(day=1)
        months.reverse()
        window_start = months[0]

        month_expr = func.date_trunc("month", JobApplication.created_at)
        rows = (
            await db.execute(
                select(
                    month_expr,
                    func.count(),
                    func.count().filter(func.lower(JobApplication.status) == "hired"),
                )
                .where(JobApplication.created_at >= window_start)
                .group_by(month_expr)
            )
        ).all()
        by_month = {row[0].strftime("%Y-%m"): {"applications": row[1], "hired": row[2]} for row in rows}

        return [
            {"month": m.strftime("%Y-%m"), **by_month.get(m.strftime("%Y-%m"), {"applications": 0, "hired": 0})}
            for m in months
        ]

    async def get_report(self, report_type: str) -> dict:
        db = self._db

        if report_type == "hiring_funnel":
            rows = (await db.execute(select(JobApplication.status, func.count()).group_by(JobApplication.status))).all()
            return {"funnel": [{"status": r[0], "count": r[1]} for r in rows]}

        if report_type == "department_breakdown":
            rows = (
                await db.execute(
                    select(func.coalesce(Department.name, "Unassigned"), func.count())
                    .select_from(JobApplication)
                    .join(JobOpening, JobApplication.job_opening_id == JobOpening.id)
                    .outerjoin(Department, JobOpening.department_id == Department.id)
                    .group_by(Department.name)
                )
            ).all()
            return {"by_department": [{"department": r[0], "count": r[1]} for r in rows]}

        if report_type == "time_to_hire":
            return {"monthly_trend": await self._monthly_trend()}

        if report_type == "offer_acceptance":
            rows = (await db.execute(select(Offer.status, func.count()).group_by(Offer.status))).all()
            by_status = {r[0]: r[1] for r in rows}
            total = sum(by_status.values())
            accepted = by_status.get("accepted", 0)
            return {
                "by_status": [{"status": k, "count": v} for k, v in by_status.items()],
                "acceptance_rate": round(accepted / total * 100, 1) if total else 0.0,
            }

        return {}
