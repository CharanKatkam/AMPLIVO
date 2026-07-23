from fastapi import APIRouter

from app.api.v1.auth.password_reset_routes import router as password_reset_router
from app.api.v1.auth.routes import router as auth_router
from app.api.v1.auth.session_routes import router as session_router
from app.api.v1.auth.verification_routes import router as verification_router

# Core modules
from app.modules.activity_timeline.routes import router as activity_timeline_router
from app.modules.analytics.routes import router as analytics_router
from app.modules.approval_system.routes import router as approval_system_router
from app.modules.campaigns.routes import router as campaigns_router
from app.modules.careers.routes import router as careers_router
from app.modules.case_studies.routes import router as case_studies_router
from app.modules.client_portal.routes import router as client_portal_router
from app.modules.cms.routes import router as cms_router
from app.modules.companies.routes import router as companies_router
from app.modules.consultation_requests.routes import router as consultation_requests_router
from app.modules.content_calendar.routes import router as content_calendar_router
from app.modules.contact_forms.routes import router as contact_forms_router
from app.modules.creative.routes import router as creative_router
from app.modules.crm.routes import router as crm_router
from app.modules.faqs.routes import router as faqs_router
from app.modules.finance.routes import router as finance_router
from app.modules.file_manager.routes import router as file_manager_router
from app.modules.influencers.routes import router as influencers_router
from app.modules.leads.routes import router as leads_router
from app.modules.marketing_automation.routes import router as marketing_automation_router
from app.modules.messaging.routes import router as messaging_router
from app.modules.notifications.routes import router as notifications_router
from app.modules.paidads.routes import router as paidads_router
from app.modules.portfolio.routes import router as portfolio_router
from app.modules.seo.routes import router as seo_router
from app.modules.settings.routes import router as settings_router
from app.modules.social.routes import router as social_router
from app.modules.support_tickets.routes import router as support_tickets_router
from app.modules.tasks.routes import router as tasks_router
from app.modules.testimonials.routes import router as testimonials_router
from app.modules.timesheets.routes import router as timesheets_router
from app.modules.users.routes import router as users_router
from app.modules.websites.routes import router as websites_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(verification_router)
api_router.include_router(password_reset_router)
api_router.include_router(session_router)

# Include core modules
api_router.include_router(analytics_router)
api_router.include_router(activity_timeline_router)
api_router.include_router(approval_system_router)
api_router.include_router(campaigns_router)
api_router.include_router(careers_router)
api_router.include_router(case_studies_router)
api_router.include_router(client_portal_router)
api_router.include_router(cms_router)
api_router.include_router(companies_router)
api_router.include_router(consultation_requests_router)
api_router.include_router(content_calendar_router)
api_router.include_router(contact_forms_router)
api_router.include_router(creative_router)
api_router.include_router(crm_router)
api_router.include_router(faqs_router)
api_router.include_router(finance_router)
api_router.include_router(file_manager_router)
api_router.include_router(influencers_router)
api_router.include_router(leads_router)
api_router.include_router(marketing_automation_router)
api_router.include_router(messaging_router)
api_router.include_router(notifications_router)
api_router.include_router(paidads_router)
api_router.include_router(portfolio_router)
api_router.include_router(seo_router)
api_router.include_router(settings_router)
api_router.include_router(social_router)
api_router.include_router(support_tickets_router)
api_router.include_router(tasks_router)
api_router.include_router(testimonials_router)
api_router.include_router(timesheets_router)
api_router.include_router(users_router)
api_router.include_router(websites_router)

