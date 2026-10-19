# Webpage Defense System

A defensive web-security dashboard starter project built with React, Vite, Node.js, Express, and MongoDB.

## Features
- Dashboard with request and threat metrics
- Signup/login with bcrypt password hashing and JWT authentication
- Helmet security headers and API rate limiting
- Basic request inspection for common suspicious URL patterns
- Security event log stored in MongoDB
- Protected dashboard API
- Demo alert generation for testing the UI

> This is a learning/demo project, not a substitute for a production WAF, managed DDoS protection, secure hosting, or a professional security review. Detection rules are intentionally basic and can produce false positives.

## Requirements
- Node.js 20+ recommended
- MongoDB Community Server or a MongoDB Atlas connection string
- npm

## 1. Configure the backend
Open a terminal:
```bash
cd server
copy .env.example .env
npm install
```
On macOS/Linux, use `cp .env.example .env` instead of `copy`.

Edit `server/.env` and set:
- `MONGO_URI` to your MongoDB connection string
- `JWT_SECRET` to a long random secret (at least 32 characters)
- `CLIENT_ORIGIN=http://localhost:5173`

Start the API:
```bash
npm run dev
```
The API runs at `http://localhost:5000`.

## 2. Configure the frontend
In a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the URL Vite prints, usually `http://localhost:5173`.

## 3. Use the app
1. Create an account on the signup page.
2. Sign in.
3. Open the dashboard.
4. Click **Generate demo alert** to create a clearly labeled test event.
5. The dashboard refreshes metrics and recent events from the API.

## API endpoints
- `GET /api/health` — health check
- `POST /api/auth/signup` — create account
- `POST /api/auth/login` — sign in
- `GET /api/dashboard/summary` — protected metrics
- `GET /api/events` — protected recent security events
- `POST /api/demo-alert` — protected demo event

## Important production steps
- Use HTTPS and secure deployment secrets.
- Add email verification, password reset, MFA, and account lockout policy.
- Store JWTs in secure, HttpOnly cookies rather than localStorage for production apps.
- Add input validation, CSRF defenses if using cookies, and centralized monitoring.
- Put the app behind a maintained WAF/CDN and configure backups, least-privilege DB access, and alerting.
- Do not use the demo detector as your only security control.
