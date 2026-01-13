# Coursera Clone

A full-stack learning platform built with Next.js 14, Express.js, and MongoDB.

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- CSS Modules with Design Tokens
- Context API for state management

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
│       ├── app/          # Pages (homepage, login, courses, cart)
│       ├── components/   # Reusable UI components
│       ├── context/      # Auth and Cart context providers
│       ├── data/         # Static course data
│       ├── lib/          # API client
│       └── styles/       # Global styles and design tokens
│
└── backend/              # Express.js backend
    └── src/
        ├── controllers/  # Route handlers
        ├── models/       # Mongoose models (User, Course, Cart, Order, Enrollment)
        ├── routes/       # API routes
        ├── services/     # Business logic (cart service, enrollment service)
        ├── middlewares/  # JWT verification
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
| `/` | Homepage with course grid and auto-scrolling carousels |
| `/login` | Login/Register with backend authentication |
| `/courses` | My Learning - enrolled courses |
| `/cart` | Shopping cart with checkout |
| `/course/[id]` | Course player with video and sidebar |

## Features

- **Homepage**: Coursera-style UI with hero banner, category cards, course grid, and animated auto-scrolling course carousels with navigation arrows
- **Authentication**: User registration and login with JWT tokens, AuthContext for global state
- **Shopping Cart**: Add/remove courses, checkout flow, CartContext for global state
- **My Learning**: View enrolled courses after purchase
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile
- **Course Images**: Dynamic course images from Unsplash

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/register` | Register new user |
| POST | `/api/v1/users/login` | Login user |
| POST | `/api/v1/users/logout` | Logout user |

### Courses
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/courses/all-courses` | No | Get all available courses |
| GET | `/api/v1/courses/my-courses` | Yes | Get user's enrolled courses |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/cart` | Yes | Get user's cart |
| POST | `/api/v1/cart/add` | Yes | Add course to cart |
| DELETE | `/api/v1/cart/remove/:courseId` | Yes | Remove course from cart |
| POST | `/api/v1/cart/pay` | Yes | Checkout (mock payment) |
| DELETE | `/api/v1/cart/clear` | Yes | Clear cart |

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