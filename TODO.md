# API Error Fixes TODO

## Current Status: Planning Complete ✅

## Step 1: Verify Additional Files [IN PROGRESS]
- [x] Read PatientDashboard.tsx (doctors call location)
- [x] Read doctorController.js (endpoint implementation)
- [ ] Analyze doctor call mismatch

## Step 2: Backend Fixes
- [ ] Update backend/middleware/auth.js: Add patient_id validation & logging
- [ ] Update backend/controllers/appointmentController.js: Add query param fallback for getPatientAppointments
- [ ] Test /api/appointments/my-appointments locally

## Step 3: Frontend Fixes  
- [ ] Fix doctors endpoint in PatientDashboard.tsx (/doctors → /api/doctors)
- [ ] Test frontend calls

## Step 4: Database Verification
- [ ] Check patient record for user_id=37
- [ ] Create missing patient if needed

## Step 5: Deploy & Test
- [ ] Push to Render
- [ ] Full e2e test (login → dashboard → appointments)

**Next Action:** Implement backend auth/controller fixes after file analysis.

