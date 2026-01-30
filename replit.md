# Kursmanager Dev

## Overview
A course management application ("Fit für den Abschluss") for Ernst-Reuter-Schule KGS Pattensen. Built with Next.js 15 and MongoDB/Mongoose.

## Recent Changes
- January 30, 2026: Initial Replit setup and configuration

## Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js
- **Animation**: Framer Motion
- **Icons**: Lucide React

## Project Structure
```
src/
  app/           # Next.js App Router pages and API routes
    api/         # API endpoints (students, teachers, bookings, messages)
  lib/           # Utility functions (db connection, session, seed data)
  models/        # Mongoose models (Student, Teacher, Booking, Message, Settings)
public/          # Static assets
```

## Environment Variables Required
- `MONGODB_URI` - MongoDB connection string (required for database)
- `SESSION_SECRET` - NextAuth session secret

## Development
The app runs on port 5000 with:
```bash
npm run dev -- -p 5000 -H 0.0.0.0
```

## Deployment
Uses `next build` and `next start` for production.
