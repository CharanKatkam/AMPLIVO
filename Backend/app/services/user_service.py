import uuid

from app.core.constants import RESERVED_USERNAMES
from app.core.exceptions import (
    EmailAlreadyExistsException,
    ReservedUsernameException,
    UserNotFoundException,
    UsernameAlreadyExistsException,
)
from app.models.audit_log import AuditAction, AuditStatus
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.services.audit_service import AuditService
from app.services.email_verification_service import EmailVerificationService
from app.utils.password import hash_password
from app.utils.request_context import ClientContext


class UserService:
    def __init__(
        self,
        user_repository: UserRepository,
        audit_service: AuditService,
        email_verification_service: EmailVerificationService,
    ) -> None:
        self._user_repository = user_repository
        self._audit_service = audit_service
        self._email_verification_service = email_verification_service

    async def register_user(
        self,
        *,
        email: str,
        username: str,
        full_name: str,
        password: str,
        endpoint: str,
        request_method: str,
        client_context: ClientContext,
    ) -> User:
        if username.lower() in RESERVED_USERNAMES:
            raise ReservedUsernameException()
        if await self._user_repository.exists_by_email(email):
            raise EmailAlreadyExistsException()
        if await self._user_repository.exists_by_username(username):
            raise UsernameAlreadyExistsException()

        hashed_password = hash_password(password)
        user = await self._user_repository.create(
            email=email,
            username=username,
            full_name=full_name,
            hashed_password=hashed_password,
        )

        await self._audit_service.log(
            user_id=user.id,
            action=AuditAction.REGISTER,
            endpoint=endpoint,
            request_method=request_method,
            client_context=client_context,
            status=AuditStatus.SUCCESS,
            message="User registered successfully.",
        )

        await self._email_verification_service.send_verification_email(
            user, endpoint=endpoint, request_method=request_method, client_context=client_context
        )

        return user

    async def check_email_exists(self, email: str) -> bool:
        return await self._user_repository.exists_by_email(email)

    async def check_username_exists(self, username: str) -> bool:
        return await self._user_repository.exists_by_username(username)

    async def soft_delete_user(self, user_id: uuid.UUID, *, deleted_by: uuid.UUID | None) -> User:
        user = await self._user_repository.get_by_id(user_id)
        if user is None:
            raise UserNotFoundException()
        await self._user_repository.soft_delete(user, deleted_by=deleted_by)
        return user
