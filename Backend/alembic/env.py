import asyncio
from logging.config import fileConfig

from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from alembic import context

from app.core.config import settings
from app.db.base import Base
from app.models.audit_log import AuditLog  # noqa: F401  (registers mapper)
from app.models.email_verification_token import EmailVerificationToken  # noqa: F401
from app.models.login_history import LoginHistory  # noqa: F401  (registers mapper)
from app.models.password_reset_token import PasswordResetToken  # noqa: F401
from app.models.refresh_token import RefreshToken  # noqa: F401  (registers mapper)
from app.models.user import User  # noqa: F401  (registers mapper)
from app.models.user_session import UserSession  # noqa: F401  (registers mapper)

from app.modules.analytics import models as analytics_models # noqa: F401
from app.modules.campaigns import models as campaigns_models # noqa: F401
from app.modules.client_portal import models as client_portal_models # noqa: F401
from app.modules.cms import models as cms_models # noqa: F401
from app.modules.creative import models as creative_models # noqa: F401
from app.modules.crm import models as crm_models # noqa: F401
from app.modules.finance import models as finance_models # noqa: F401
from app.modules.influencers import models as influencers_models # noqa: F401
from app.modules.leads import models as leads_models # noqa: F401
from app.modules.notifications import models as notifications_models # noqa: F401
from app.modules.paidads import models as paidads_models # noqa: F401
from app.modules.seo import models as seo_models # noqa: F401
from app.modules.settings import models as settings_models # noqa: F401
from app.modules.social import models as social_models # noqa: F401
from app.modules.tasks import models as tasks_models # noqa: F401
from app.modules.users import models as users_models # noqa: F401
from app.modules.websites import models as websites_models # noqa: F401

# New modules
from app.modules.activity_timeline import models as activity_timeline_models # noqa: F401
from app.modules.approval_system import models as approval_system_models # noqa: F401
from app.modules.careers import models as careers_models # noqa: F401
from app.modules.case_studies import models as case_studies_models # noqa: F401
from app.modules.companies import models as companies_models # noqa: F401
from app.modules.consultation_requests import models as consultation_requests_models # noqa: F401
from app.modules.content_calendar import models as content_calendar_models # noqa: F401
from app.modules.contact_forms import models as contact_forms_models # noqa: F401
from app.modules.faqs import models as faqs_models # noqa: F401
from app.modules.file_manager import models as file_manager_models # noqa: F401
from app.modules.marketing_automation import models as marketing_automation_models # noqa: F401
from app.modules.messaging import models as messaging_models # noqa: F401
from app.modules.portfolio import models as portfolio_models # noqa: F401
from app.modules.support_tickets import models as support_tickets_models # noqa: F401
from app.modules.testimonials import models as testimonials_models # noqa: F401
from app.modules.timesheets import models as timesheets_models # noqa: F401


config = context.config
# configparser (which alembic.config.Config wraps) treats "%" as the start
# of an interpolation directive, so a percent-encoded character in the URL
# (e.g. a password containing "%40") raises "invalid interpolation syntax"
# unless doubled to "%%" first - this only affects how alembic's Config
# stores/displays the URL, not the actual connection below.
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL.replace("%", "%%"))

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def _do_run_migrations(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    import ssl as _ssl
    # Mirrors app.db.session's SSL handling: build a real SSLContext with
    # verification disabled to match Supabase's sslmode=require (encrypt but
    # don't verify). The bare string ssl="require" can hang on Windows.
    if settings.DB_SSL_MODE == "require":
        _ssl_ctx = _ssl.create_default_context()
        _ssl_ctx.check_hostname = False
        _ssl_ctx.verify_mode = _ssl.CERT_NONE
        connect_args: dict = {"ssl": _ssl_ctx}
    else:
        connect_args: dict = {}
    connectable: AsyncEngine = create_async_engine(settings.DATABASE_URL, connect_args=connect_args)
    async with connectable.connect() as connection:
        await connection.run_sync(_do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
