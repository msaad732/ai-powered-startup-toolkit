# TODO

## Private Equity Readiness (VentureCapitalists)

- [ ] Implement backend PE readiness assessment in `backend/venture.py` (LLM call + JSON schema)
- [ ] Mount route in `backend/main.py`: `POST /api/venture/assess`
- [ ] Update `frontend/src/Components/VentureCapitalists.jsx` to call backend endpoint instead of browser Gemini
- [ ] Smoke test: start backend, call endpoint, verify frontend STEP 2 renders
