import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text
import os

DATABASE_URL = "postgresql+asyncpg://postgres.fhxkiprlcdwbgtaxlffk:Shivanivpd123@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?prepared_statement_cache_size=0"

async def main():
    engine = create_async_engine(DATABASE_URL)
    async_session = async_sessionmaker(engine)
    
    async with async_session() as session:
        result_cr = await session.execute(text("SELECT * FROM consultation_requests LIMIT 1"))
        cr = result_cr.fetchone()
        print("Consultation Request:", cr)
        
        result_leads = await session.execute(text("SELECT id, title, status, client_id, assigned_to FROM leads LIMIT 3"))
        leads = result_leads.fetchall()
        print("Leads:")
        for l in leads:
            print(l)
        
        result_roles = await session.execute(text("SELECT * FROM roles"))
        roles = result_roles.fetchall()
        print("Roles:", roles)

asyncio.run(main())
