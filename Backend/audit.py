import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text
import os

DATABASE_URL = "postgresql+asyncpg://postgres.fhxkiprlcdwbgtaxlffk:Shivanivpd123@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?prepared_statement_cache_size=0"

async def main():
    engine = create_async_engine(DATABASE_URL)
    async_session = async_sessionmaker(engine)
    
    async with async_session() as session:
        result_cr = await session.execute(text("SELECT count(*) FROM consultation_requests"))
        count_cr = result_cr.scalar()
        
        result_leads = await session.execute(text("SELECT count(*) FROM leads"))
        count_leads = result_leads.scalar()
        
        result_leads_new = await session.execute(text("SELECT count(*) FROM leads WHERE status = 'New'"))
        count_leads_new = result_leads_new.scalar()
        
        result_leads_new_lower = await session.execute(text("SELECT count(*) FROM leads WHERE status = 'new'"))
        count_leads_new_lower = result_leads_new_lower.scalar()
        
        result_contact = await session.execute(text("SELECT count(*) FROM contact_submissions"))
        count_contact = result_contact.scalar()
        
        print(f"Consultation Requests: {count_cr}")
        print(f"Contact Submissions: {count_contact}")
        print(f"Leads Total: {count_leads}")
        print(f"Leads (status='New'): {count_leads_new}")
        print(f"Leads (status='new'): {count_leads_new_lower}")

asyncio.run(main())
