# Backend Setup - Node.js + Prisma + MySQL

## Install Dependencies
```bash
cd backend
npm install
```

## Setup MySQL Database
1. Install MySQL
2. Create database:
```sql
CREATE DATABASE stackforge_db;
```

## Configure .env
```
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/stackforge_db"
GEMINI_API_KEY=AIzaSyAxUPh7pWUITS2eMLp9VQhAYI45F1DlX9M
JWT_SECRET=stackforge_secret_key_2026
PORT=8000
```

## Run Prisma Migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

## Start Server
```bash
npm run dev
```

Backend runs on: http://localhost:8000

## Tech Stack
- Node.js + Express
- Prisma ORM
- MySQL Database
- Google Gemini AI
- JWT Authentication
- bcryptjs
