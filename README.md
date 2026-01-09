# Coursera Clone

A full-stack learning platform built with Next.js 14, Express.js, and MongoDB.

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- CSS Modules with Design Tokens

### Backend
- Express.js
- MongoDB (Atlas)
- JWT Authentication
- bcrypt for password hashing

## Project Structure

```
CourseEra_Clone/
├── frontend/             # Next.js frontend
│   └── src/
│       ├── app/          # Pages (homepage, login, courses, course player)
│       ├── components/   # Reusable UI components
│       ├── data/         # Static course data
│       ├── lib/          # API client
│       └── styles/       # Global styles and design tokens
│
└── backend/              # Express.js backend
    └── src/
        ├── controllers/  # Route handlers
        ├── models/       # Mongoose models
        ├── routes/       # API routes
        ├── utils/        # Utilities (ApiError, asyncHandler)
        └── db/           # Database connection
```

## Getting Started

### Backend
```bash
cd backend
npm install
npm run dev
```
Runs on http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:3000

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with auto-scrolling course sections |
| `/login` | Login/Register with backend authentication |
| `/courses` | Course catalog |
| `/course/[id]` | Course player with video and sidebar |

## Features

- **Homepage**: Coursera-style UI with hero banner, category cards, and auto-scrolling course rows
- **Authentication**: User registration and login with JWT tokens
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/register` | Register new user |
| POST | `/api/v1/users/login` | Login user |

## Environment Variables

Create `.env` in backend folder:
```
MONGODB_URI=your_mongodb_uri
PORT=5000
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=30d
```