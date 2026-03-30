# Task Progress: Fix CORS/Doctors API Issue on Render Deployment

## Approved Plan Breakdown:
**User confirmed production focus. Frontend uses Vite env VITE_API_URL → https://autellia-clinic.onrender.com/api**
**Issue: /api/doctors requires JWT auth → fails unauthenticated fetches for doctor lists (booking dropdowns). Also CORS likely missing prod frontend origin.**

### Steps:
- [x] **Step 1**: Add public endpoint GET /api/doctors/public (no auth) → calls existing getAllDoctors().
- [ ] **Step 2**: Update frontend services to use /doctors/public for anonymous lists (e.g., BookAppointment.tsx).
- [ ] **Step 3**: Document Render.com env setup: CORS_ORIGIN="https://autellia-clinic.onrender.com,http://localhost:5173".
- [ ] **Step 4**: Create test script backend/test_doctors_public.js.
- [ ] **Step 5**: Test & deploy → attempt_completion.

**Current: Step 1 done. Run `node backend/test_doctors_public.js` to test locally, then:**\n- Update Render CORS_ORIGIN env.\n- Frontend: use /doctors/public for anonymous lists.

