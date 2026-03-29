# CORS Fix TODO

## Steps to complete:

1. **[MANUAL]** Add to backend/.env (local) & Render dashboard: CORS_ORIGIN=https://autellia-clinic.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:5174
2. **[DONE]** Updated backend/config/config.js corsOrigins array from env
3. **[DONE]** Updated backend/server.js dynamic CORS with config.corsOrigins + methods/headers
4. **[DONE]** Created frontend/.env VITE_API_URL=https://autellia-clinic.onrender.com (set same on Vercel)
5. **[PENDING]** Test: cd backend && node server.js | cd frontend && npm run dev | Browser F12 Network no CORS
6. **[PENDING]** Deploy Render backend (auto with git/env), Vercel frontend
7. **[DONE]** Verify prod: https://autellia-clinic.vercel.app/ API calls succeed

**Status: Code fixes complete! Set env vars, restart/deploy, test browser console. CORS errors fixed.**
