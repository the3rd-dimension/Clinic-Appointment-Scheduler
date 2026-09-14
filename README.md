# Northstar Health Scheduler

A production-shaped clinic appointment scheduler built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and Zod.

Tech Stack
Frontend & Backend: Next.js (TypeScript, React, Tailwind CSS)

Database & ORM: PostgreSQL with Prisma

Validation: Zod

Features
Patient Portal: Browse doctors by specialization, view real-time open time slots, and book appointments instantly.

Concurrency Control: Robust database-level transaction management to completely eliminate overlapping schedules and double-bookings.

Responsive GUI: Mobile-friendly, accessible interface built for cross-platform usage.

## Getting started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to a PostgreSQL database.
3. Generate the client and run the overlap-protection migration: `npm run db:generate` then `npm run db:migrate -- --name init`.
4. Optionally seed the sample doctors with `npm run db:seed`.
5. Start the app with `npm run dev`.

## API surface

- `GET /api/doctors?specialization=Cardiology` filters doctors.
- `GET /api/doctors/:doctorId/availability?date=2026-09-14` calculates open 45-minute slots.
- `POST /api/appointments` validates and creates a patient appointment in a serializable transaction.

PostgreSQL's `btree_gist` exclusion constraint prevents overlapping `SCHEDULED` appointments for the same doctor even under concurrent requests.
fjekdi