# Coursera Clone

A learning platform frontend built with Next.js 14 and TypeScript.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- CSS Modules

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Project Structure

```
src/
├── app/                  # Pages (login, courses, course details)
├── components/           # Reusable UI components
├── data/                 # Static course data
└── styles/               # Global styles and design tokens
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Login |
| `/courses` | Course catalog |
| `/course/[id]` | Course player with video and sidebar |

## Notes

This is a frontend-only prototype. Authentication and video playback are mocked.