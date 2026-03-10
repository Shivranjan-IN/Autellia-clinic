@echo off
set DATABASE_URL=postgresql://postgres.gnejurfesecmwovuhowy:2tSLiPfB3ytaG4FD@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?schema=public&sslmode=require
npx prisma generate
