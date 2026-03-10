# TODO: Store All Files in Supabase Bucket

## Phase 1: Patient Profile Photo ✅ COMPLETED
- [x] 1.1 Create supabaseStorage.js utility
- [x] 1.2 Update Prisma schema - change profile_photo_data (Bytes) to profile_photo_url (String)
- [x] 1.3 Update patientController.js - upload to Supabase and store URL

## Phase 2: Patient Documents ✅ COMPLETED
- [x] 2.1 Update Prisma schema - change file_data (Bytes) to file_url (String)
- [x] 2.2 Update documentController.js - upload to Supabase and store URL
- [x] 2.3 Update getMyDocuments to return file_url
- [x] 2.4 Update getDocument/downloadDocument to redirect to Supabase URL
- [x] 2.5 Update deleteDocument to delete from Supabase

## Phase 3: Doctor Registration Documents ✅ COMPLETED
- [x] 3.1 Update Prisma schema - change file_data (Bytes) to file_url (String) in doctor_documents
- [x] 3.2 Update authController.js - upload to Supabase and store URL

## Phase 4: Database Schema Update ⚠️ REQUIRES ACTION
- [ ] 4.1 Run `npx prisma generate` to update Prisma client
- [ ] 4.2 Run `npx prisma db push` or migration to update database schema
- [ ] 4.3 Note: Old binary data columns will need manual migration or new columns created

## Environment Variables Required
Add these to your .env file:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_BUCKET=clinic-files
```

## Supabase Storage Setup
1. Create a bucket named "clinic-files" in Supabase
2. Make the bucket public or configure appropriate policies
3. Add the environment variables above

