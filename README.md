# Inventory Management System

This is the beginnings of a web-based Inventory Management System built with modern web technologies. The project is intended to provide a simple interface to manage chemicals and other inventory items, with full database interaction and type-safe validation.

## Features (so far)
- Basic frontend table displaying inventory items
- Inline updates to database records
- Type validation using Zod
- Database management and queries via Prisma

## Stack
Next.js & React – frontend framework and UI components
Prisma – database ORM for TypeScript
Zod – runtime type validation and schema enforcement
SQLite – supported database (adjust in Prisma config)


## Getting Started

## Prerequisites
- Node.js (v22 used)
- npm
- SQLite installed

## Installation
```
git clone https://github.com/thomasstokes33/inventory-management.git
cd inventory-management
npm ci
```
Then create the `.env` file at the root level and add your database URL:
```
DATABASE_URL="<url>"
```
Apply Prisma migrations:
```
npx prisma migrate dev --name init
```
(Note: you can access the DB with prisma, using `npx prisma studio`).
Finally, run the server with `npm run dev`.
