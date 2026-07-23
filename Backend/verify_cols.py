import asyncio, os
os.environ['DB_SSL_MODE'] = 'disable'
from app.db.session import engine
from sqlalchemy import text

async def check():
    async with engine.connect() as conn:
        for tbl in ['users', 'audit_logs', 'roles', 'leads', 'campaigns', 'tasks', 'clients']:
            result = await conn.execute(text(
                f"SELECT column_name FROM information_schema.columns WHERE table_name='{tbl}' ORDER BY ordinal_position"
            ))
            cols = [r[0] for r in result.fetchall()]
            print(f"{tbl} ({len(cols)}): {cols}")

asyncio.run(check())
