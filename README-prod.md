# Production Deployment Guide: nginx + daphne + redis (Docker)

This guide explains how to run the app in production using Docker Compose with three services:
- nginx (TLS termination and reverse proxy)
- web (Django served by Daphne + Channels)
- frontend (built static site served by nginx)
- redis (channels backend)
- db (Postgres) optional (we provide sqlite for quick demo; change DB in settings for production)

## High level
1. Build the frontend into static assets.
2. Build the Django container (Daphne as ASGI server).
3. Use nginx to route `/ws/` traffic to Daphne (upstream) and serve static files for the frontend.

## Using provided docker-compose.prod.yml
1. Copy `.env.prod.example` to `.env.prod` and update secrets.
2. Build and run:
   ```bash
   docker compose -f docker/docker-compose.prod.yml up --build -d
   ```
3. Check logs:
   ```bash
   docker compose -f docker/docker-compose.prod.yml logs -f
   ```

## TLS
- The provided nginx config expects TLS termination. For production, use Let's Encrypt or a managed cert and mount the certs into `/etc/nginx/ssl/` inside the nginx container.
- Alternatively, use a load balancer / CDN for certificates and let nginx run behind it.

## Notes
- Configure `ALLOWED_HOSTS` and `DJANGO_SECRET` in env.
- Use a production database (Postgres) instead of sqlite.
- Use secure cookie settings and HTTP-only headers.
- This repo includes a minimal production setup as a starting point. Perform security review before public use.
