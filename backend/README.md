# Nilsan Educare — Backend API

Node.js + Express + TypeScript + Prisma backend for student auth, enrollments, payments, and course videos.

## Folder structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Database models
│   └── seed.ts             # Default course seed data
├── src/
│   ├── index.ts            # Server entry point
│   ├── app.ts              # Express app setup
│   ├── config/             # Environment & app config
│   │   ├── env.ts
│   │   ├── cors.ts
│   │   └── constants.ts
│   ├── lib/                # Shared integrations
│   │   ├── prisma.ts
│   │   ├── jwt.ts
│   │   └── razorpay.ts
│   ├── middleware/         # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── error.middleware.ts
│   ├── modules/            # Feature modules (domain-driven)
│   │   ├── auth/           # Signup, login, admin login
│   │   ├── users/          # Student profile & admin list
│   │   ├── courses/        # Public course catalog
│   │   ├── enrollments/    # Paid course access
│   │   ├── payments/       # Razorpay orders & verify
│   │   ├── lessons/        # Video lessons (admin + student)
│   │   └── admin/          # Admin dashboard stats
│   ├── routes/
│   │   └── index.ts        # Route aggregator
│   ├── types/
│   │   └── express.d.ts
│   └── utils/
│       ├── api-response.ts
│       ├── password.ts
│       └── user-mapper.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## Setup

```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, Razorpay keys

npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Server runs at **http://localhost:4000**  
API base: **http://localhost:4000/api/v1**

## API routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/v1/health` | — | Health check |
| POST | `/api/v1/auth/signup` | — | Student signup |
| POST | `/api/v1/auth/login` | — | Student login |
| POST | `/api/v1/auth/admin/login` | — | Admin login |
| POST | `/api/v1/auth/logout` | — | Logout |
| GET | `/api/v1/auth/me` | User | Current user |
| GET | `/api/v1/users/profile` | User | User profile |
| GET | `/api/v1/users` | Admin | List students |
| GET | `/api/v1/courses` | — | List courses |
| GET | `/api/v1/courses/:slug` | — | Course details |
| GET | `/api/v1/enrollments/my` | User | My paid courses |
| GET | `/api/v1/enrollments/check/:slug` | User | Check enrollment |
| POST | `/api/v1/payments/create-order` | User | Create Razorpay order |
| POST | `/api/v1/payments/verify` | User | Verify payment |
| GET | `/api/v1/lessons/video-config` | Admin | Bunny Stream config status |
| POST | `/api/v1/lessons/videos` | Admin | Create Bunny video entry |
| POST | `/api/v1/lessons/videos/:videoId/upload` | Admin | Upload video file to Bunny |
| GET | `/api/v1/lessons/course/:slug` | User / Admin | Lessons (enrolled students or admin) |
| POST | `/api/v1/lessons` | Admin | Add lesson (+ videoId / embed URL) |
| DELETE | `/api/v1/lessons/:id` | Admin | Delete lesson (+ Bunny video) |
| GET | `/api/v1/admin/dashboard` | Admin | Admin stats |

See root [`SETUP.md`](../SETUP.md) for Neon + Bunny Stream configuration steps.

## Signup body example

```json
{
  "fullName": "Aman Patel",
  "institution": "Pune University",
  "academicYear": "2nd Year",
  "classGrade": "B.Tech",
  "email": "aman@email.com",
  "password": "secure123",
  "confirmPassword": "secure123",
  "city": "Pune",
  "state": "Maharashtra",
  "latitude": 18.52,
  "longitude": 73.85
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run production build |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed default course |
