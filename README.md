# TravelBiz - MERN Stack Travel Agency Management

A full-stack web application for travel agencies to manage clients, travel files, company vehicles, and live vehicle tracking.

---

## Features
- **User Authentication** (JWT, bcrypt, roles: admin, agent, driver)
- **Client Management** (CRUD, assign agents, link files/vehicles)
- **File Management** (Upload, group, filter, download, preview)
- **Vehicle Management** (CRUD, assign driver/client, status, photo upload)
- **Live Vehicle Tracking** (Simulated GPS, Google Maps integration)
- **Responsive Dashboard** (React, Tailwind CSS)

---

## Folder Structure

```
TravelBiz/
  backend/      # Node.js + Express + MongoDB API
  client/       # React + Tailwind CSS frontend
```

### Backend
- `/controllers` - Route logic
- `/models` - Mongoose schemas
- `/routes` - Express routers
- `/middlewares` - Auth, error handling, etc.
- `/utils` - Helpers (file upload, GCS, etc.)
- `server.js` - Entry point

### Frontend
- `/src/components` - Reusable UI
- `/src/pages` - App pages
- `/src/services` - API calls
- `/src/contexts` - Auth, global state
- `App.js`, `index.js` - Entry points

---

## Setup

### 1. Clone the repo
```bash
git clone <repo-url>
cd TravelBiz
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env # Fill in your secrets
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
cp .env.example .env # Fill in your API and Google Maps keys
npm install
npm start
```

---

## Usage
- Access the frontend at `http://localhost:3000`
- Backend API runs at `http://localhost:5000`

---

## Tech Stack
- **Frontend:** React, Tailwind CSS, Google Maps API
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Auth:** JWT, bcrypt
- **File Upload:** Multer, Google Cloud Storage (or local)

---

## Future Guidance
- See backend and client `README.md` for module-specific details
- Add new features in modular folders (controllers, models, routes, components, pages)
- Use `.env` for all secrets and config
- For production, deploy backend (Render/Heroku) and frontend (Vercel)
- For Google Maps, get an API key from Google Cloud Console
- For GCS, set up a bucket and service account, update `.env`

---

## Contribution
PRs and issues welcome! Follow best practices and keep code modular. 