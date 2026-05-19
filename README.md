# AI-Based Smart Complaint Management System

A production-ready MERN stack application for registering, tracking, searching, filtering, updating, and deleting civic complaints with AI-assisted urgency detection and department routing.

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Tailwind CSS
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Authentication: JWT, bcryptjs
- AI: OpenRouter/OpenAI-compatible chat completions API
- Deployment: Render-ready `render.yaml`

## Project Structure

```text
smart-complaint-system/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
      validators/
  frontend/
    src/
      api/
      components/
      context/
      pages/
      utils/
  render.yaml
```

## Local Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Update `backend/.env` with your MongoDB URI and JWT secret.

4. Run both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## AI Configuration

The backend supports OpenRouter or any OpenAI-compatible endpoint.

```env
OPENAI_API_KEY=your-key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=openai/gpt-4o-mini
```

If no API key is configured, the system still works using a deterministic local fallback for urgency, department, summary, and automatic response.

## Core API Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/complaints`
- `GET /api/complaints`
- `GET /api/complaints/:id`
- `PATCH /api/complaints/:id`
- `PATCH /api/complaints/:id/status`
- `POST /api/complaints/:id/analyze`
- `DELETE /api/complaints/:id`
- `GET /api/complaints/stats/summary`

## Render Deployment

This repository includes `render.yaml` with:

- `smart-complaint-api`: Node web service for the Express API
- `smart-complaint-web`: Static Vite frontend

Set these Render environment variables:

- Backend: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, optional `OPENAI_API_KEY`
- Frontend: `VITE_API_URL` pointing to the deployed backend `/api` URL

## Production Notes

- Passwords are hashed with bcrypt before storage.
- JWT tokens protect all complaint routes.
- Input validation is enforced with `express-validator`.
- Helmet, compression, CORS, rate limiting, and centralized error handling are enabled.
- New public signups are created as citizen users. Elevated roles should be assigned through a trusted admin process or database migration.
