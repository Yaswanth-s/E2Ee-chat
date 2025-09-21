# Django E2EE Chat (Full Repo)

This repository is a demonstration E2EE one-to-one chat app:
- Backend: Django + Django REST Framework + Channels (Daphne) — stores only public keys & ciphertexts.
- Frontend: Vite + React — client-side key generation & encryption using libsodium-wrappers.
- Realtime: WebSockets via Daphne + Channels, Redis channel layer.
- Deployment: Dockerfiles for backend, frontend, nginx + docker-compose for production (nginx as TLS / reverse proxy to Daphne).

## What's included
- `backend/` : Django project with `users` and `chat` apps
- `frontend/`: Vite + React frontend using `libsodium-wrappers`
- `docker/` : nginx configuration for production, Dockerfiles and docker-compose files
- `README-prod.md` : production deployment guide (nginx + daphne + redis)

## Quick local dev (simplified)
1. Start Redis locally (e.g. `redis-server`).
2. Backend:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```
3. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

For production deployment instructions, see `README-prod.md` (includes docker-compose and nginx + daphne guidance).
