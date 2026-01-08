# GenZaic Creator Hub - Backend API

Node.js + Express + TypeScript authentication backend for GenZaic Creator Hub.

## 🚀 Features

- ✅ User registration with email verification (6-digit OTP)
- ✅ Secure login with JWT tokens in httpOnly cookies
- ✅ Password reset via email
- ✅ Refresh token rotation
- ✅ Role-based authentication (buyer/seller/admin)
- ✅ Rate limiting on auth endpoints
- ✅ Comprehensive input validation with Zod
- ✅ Database-backed sessions
- ✅ Email service (Ethereal for dev, SendGrid/SMTP for production)
- ✅ Automatic storefront creation for sellers

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL 14+
- Database schema already created (from `schema.sql`)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd BE
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required environment variables:**

- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Minimum 32 characters
- `JWT_REFRESH_SECRET` - Minimum 32 characters
- `FRONTEND_URL` - Your React frontend URL
- `CORS_ORIGIN` - Same as frontend URL

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

Optional: Use Prisma Studio to view your database:

```bash
npm run prisma:studio
```

### 4. Start Development Server

````bash
npm run dev
```808180818081

The server will start on `http://localhost:8081`

## 📡 API Endpoints

### Authentication

| Method | Endpoint                    | Description             | Rate Limit |
| ------ | --------------------------- | ----------------------- | ---------- |
| POST   | `/api/auth/signup`          | Register new user       | 5/15min    |
| POST   | `/api/auth/verify-email`    | Verify email with OTP   | 5/15min    |
| POST   | `/api/auth/login`           | Login user              | 5/15min    |
| POST   | `/api/auth/logout`          | Logout user             | -          |
| GET    | `/api/auth/me`              | Get current user        | -          |
| POST   | `/api/auth/refresh`         | Refresh access token    | -          |
| POST   | `/api/auth/forgot-password` | Request password reset  | 3/hour     |
| POST   | `/api/auth/reset-password`  | Reset password          | 5/15min    |
| POST   | `/api/auth/resend-otp`      | Resend verification OTP | 3/5min     |

### Health Check

| Method | Endpoint  | Description          |
| ------ | --------- | -------------------- |
| GET    | `/health` | Server health status |
| GET    | `/`       | API information      |

## 🧪 Testing

### Manual Testing with Postman/Thunder Client

1. **Signup**

````

POST http://localhost:8081/api/auth/signup
Content-Type: application/json

{
"name": "Test User",
"email": "test@example.com",
"password": "Test123456",
"role": "seller"
}

```

2. **Check Email** (Ethereal)
- Look for the preview URL in server logs
- Open the URL to see the verification email
- Copy the 6-digit OTP

3. **Verify Email**

```

POST http://localhost:8081/api/auth/verify-email
Content-Type: application/json

{
"email": "test@example.com",
"otp": "123456"
}

```

4. **Get Current User** (with cookies from verify/login)

```

GET http://localhost:8081/api/auth/me

```

5. **Logout**
```

POST http://localhost:8081/api/auth/logout

```

## 📁 Project Structure

```

BE/
├── src/
│ ├── config/ # Configuration files
│ │ ├── database.ts # Prisma client
│ │ ├── environment.ts # Env validation
│ │ └── email.ts # Email config
│ ├── controllers/ # Route handlers
│ │ └── auth.controller.ts
│ ├── middleware/ # Express middleware
│ │ ├── auth.middleware.ts
│ │ ├── validation.middleware.ts
│ │ ├── error.middleware.ts
│ │ └── rateLimiter.middleware.ts
│ ├── routes/ # API routes
│ │ └── auth.routes.ts
│ ├── services/ # Business logic
│ │ ├── auth.service.ts
│ │ ├── email.service.ts
│ │ ├── token.service.ts
│ │ └── otp.service.ts
│ ├── utils/ # Utilities
│ │ ├── errors.ts
│ │ └── logger.ts
│ ├── validators/ # Zod schemas
│ │ └── auth.validators.ts
│ ├── templates/ # Email templates
│ │ └── email/
│ │ ├── verification.hbs
│ │ ├── reset-password.hbs
│ │ └── welcome.hbs
│ ├── types/ # TypeScript types
│ │ └── express.d.ts
│ ├── app.ts # Express app setup
│ └── server.ts # Server entry point
├── prisma/
│ └── schema.prisma # Database schema
├── .env.example # Environment template
├── package.json
├── tsconfig.json
└── README.md

````

## 🔐 Security Features

- ✅ **Passwords:** bcrypt with 10 salt rounds
- ✅ **Tokens:** JWT in httpOnly cookies (XSS-proof)
- ✅ **Sessions:** Database-backed with IP tracking
- ✅ **Rate Limiting:** 5 auth attempts per 15 min
- ✅ **Input Validation:** Zod schemas on all endpoints
- ✅ **CORS:** Whitelisted origin with credentials
- ✅ **SQL Injection:** Prevented by Prisma ORM
- ✅ **Error Handling:** No sensitive data in responses

## 🔧 Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:pull      # Pull schema from database
npm run prisma:push      # Push schema to database
````

## 📝 Environment Variables

See `.env.example` for all available environment variables.

### Critical Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Access token secret (32+ chars)
- `JWT_REFRESH_SECRET` - Refresh token secret (32+ chars)
- `FRONTEND_URL` - React app URL for CORS
- `EMAIL_SERVICE` - ethereal | smtp | sendgrid

## 🐛 Troubleshooting

### Port already in use

```bash
# Kill process on port 8081 (Windows)
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Or change PORT in .env
PORT=5001
```

### Prisma errors

```bash
# Regenerate Prisma Client
npm run prisma:generate

# Reset and recreate database (⚠️ deletes all data)
npm run prisma:migrate reset
```

### Email not sending

- Check Ethereal logs in console for preview URL
- Verify EMAIL_SERVICE in .env

### Cookie not set

- Ensure CORS_ORIGIN matches frontend URL exactly
- Check CORS_CREDENTIALS=true
- Verify frontend sends `credentials: 'include'`

## 📚 Next Steps

1. ✅ **Test all endpoints** using Postman/Thunder Client
2. ✅ **Integrate with frontend** - Update AuthContext.tsx
3. ⬜ **Add user profile endpoints**
4. ⬜ **Add product management endpoints**
5. ⬜ **Add order processing endpoints**
6. ⬜ **Add payment integration (Razorpay)**

## 📞 Support

For issues or questions, check the logs in `logs/` directory or contact the development team.

---

**Built with ❤️ for GenZaic Creator Hub**
