import asyncio
import uuid
import httpx
from datetime import timedelta
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text
import jwt
from datetime import datetime, timezone

DATABASE_URL = "postgresql+asyncpg://postgres.fhxkiprlcdwbgtaxlffk:Shivanivpd123@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?prepared_statement_cache_size=0"
JWT_SECRET_KEY = "change-this-to-a-long-random-secret-in-production"
JWT_ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def main():
    engine = create_async_engine(DATABASE_URL)
    async_session = async_sessionmaker(engine)
    
    async with async_session() as session:
        # Get admin role
        res = await session.execute(text("SELECT id FROM roles WHERE slug = 'admin'"))
        admin_role_id = res.scalar()
        
        # Get an admin user
        res2 = await session.execute(text("SELECT id FROM users WHERE role_id = :r"), {"r": admin_role_id})
        admin_user_id = res2.scalar()
        print(f"Admin User ID: {admin_user_id}")
        
        token = create_access_token({"sub": str(admin_user_id)})
        
        async with httpx.AsyncClient() as client:
            # We assume backend is running locally. Wait, is it?
            # If backend is not running, we can't test API.
            pass
            
    print("Token created:", token)
            
asyncio.run(main())
