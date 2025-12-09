# Auth Feature - Login & Register

## Ringkasan
Implementasi sistem autentikasi lengkap dengan fitur login dan register menggunakan JWT (JSON Web Token).

---

## 1. Backend Changes

### 1.1 Update Prisma Schema
Tambahkan field `password` pada model `User`:
```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String    // NEW: hashed password
  name      String?
  projects  Project[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

### 1.2 Install Dependencies
```bash
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### 1.3 Buat Auth Route (`server/src/routes/auth.ts`)
| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/auth/register` | POST | Register user baru |
| `/api/auth/login` | POST | Login user |
| `/api/auth/me` | GET | Get current user (protected) |

### 1.4 Buat Auth Middleware (`server/src/middleware/auth.ts`)
- Verifikasi JWT token dari header `Authorization: Bearer <token>`
- Attach user info ke `req.user`

---

## 2. Frontend Changes

### 2.1 Halaman Auth
| File | Deskripsi |
|------|-----------|
| `src/pages/LoginPage.tsx` | Form login (email, password) |
| `src/pages/RegisterPage.tsx` | Form register (name, email, password) |

### 2.2 Auth Store (`src/store/useAuthStore.ts`)
- State: `user`, `token`, `isAuthenticated`, `isLoading`
- Actions: `login()`, `register()`, `logout()`, `checkAuth()`

### 2.3 API Service (`src/lib/api.ts`)
Tambahkan fungsi:
- `loginUser(email, password)`
- `registerUser(name, email, password)`
- `getCurrentUser()`

### 2.4 Protected Route
- Redirect ke login jika belum authenticated
- Simpan token di localStorage

---

## 3. Flow Diagram

```
Register Flow:
User → Register Form → POST /api/auth/register → Create User → Return JWT → Store Token → Redirect to App

Login Flow:
User → Login Form → POST /api/auth/login → Verify Password → Return JWT → Store Token → Redirect to App
```

---

## 4. File yang Akan Dibuat/Dimodifikasi

| File | Aksi |
|------|------|
| `server/prisma/schema.prisma` | Modifikasi (tambah password) |
| `server/src/routes/auth.ts` | Buat baru |
| `server/src/middleware/auth.ts` | Buat baru |
| `server/src/index.ts` | Modifikasi (register auth route) |
| `src/pages/LoginPage.tsx` | Buat baru |
| `src/pages/RegisterPage.tsx` | Buat baru |
| `src/store/useAuthStore.ts` | Buat baru |
| `src/lib/api.ts` | Modifikasi (tambah auth functions) |
| `src/App.tsx` | Modifikasi (routing) |

---

## 5. Environment Variables
Tambahkan di `server/.env`:
```
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
```

---

## 6. Security Considerations
- Password di-hash menggunakan bcryptjs (salt rounds: 10)
- JWT token expires dalam 7 hari
- Token disimpan di localStorage (pertimbangkan httpOnly cookie untuk production)
- Validasi input menggunakan Zod

---

## 7. Saran Pengembangan (Recommendations)

> [!NOTE]
> Saran berikut disesuaikan dengan konsep **SkillBridge sebagai SaaS AI Learning Platform**.

### 7.1 🔐 OAuth / Social Login (Highly Recommended)
Untuk meningkatkan UX dan conversion rate user baru:

| Provider | Library | Prioritas |
|----------|---------|-----------|
| Google | `@auth/core` atau `passport-google-oauth20` | ⭐ Tinggi |
| GitHub | `passport-github2` | ⭐ Tinggi (target developer) |
| Discord | `passport-discord` | Optional |

**Alasan:** Target user SkillBridge adalah learner/developer yang sudah familiar dengan Google/GitHub login.

### 7.2 📧 Email Verification
Verifikasi email untuk mencegah akun spam:

```
Register → Send Verification Email → User Click Link → Activate Account
```

**Tambahan schema:**
```prisma
model User {
  // ... existing fields
  isVerified    Boolean   @default(false)
  verifyToken   String?
  verifyExpires DateTime?
}
```

### 7.3 🔄 Password Recovery / Reset
Flow untuk lupa password:

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/auth/forgot-password` | POST | Kirim email reset link |
| `/api/auth/reset-password` | POST | Reset password dengan token |

**Tambahan schema:**
```prisma
model User {
  // ... existing fields
  resetToken    String?
  resetExpires  DateTime?
}
```

### 7.4 🛡️ Rate Limiting (Security)
Mencegah brute force attack:

```typescript
// Rekomendasi: express-rate-limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // 5 percobaan per window
  message: "Too many login attempts, please try again later"
});

app.use('/api/auth/login', authLimiter);
```

### 7.5 🍪 Session Management (Production)
Pertimbangkan untuk production:

| Opsi | Pro | Con |
|------|-----|-----|
| **httpOnly Cookie** | Lebih aman dari XSS | Perlu CORS config |
| **Refresh Token** | Extend session tanpa re-login | Kompleksitas lebih tinggi |
| **Redis Session Store** | Scalable, bisa invalidate | Perlu setup Redis |

**Rekomendasi:** Gunakan **Refresh Token Pattern** untuk SaaS:
- Access Token: 15 menit
- Refresh Token: 30 hari (stored di httpOnly cookie)

### 7.6 ✅ Remember Me Feature
Opsi "Ingat Saya" pada login:

```typescript
// Jika remember me checked:
const tokenExpiry = rememberMe ? '30d' : '24h';
```

### 7.7 👥 Role-Based Access Control (RBAC)
Untuk masa depan (admin panel, moderation):

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  // ... existing fields
  role Role @default(USER)
}
```

### 7.8 💳 Subscription Tier Integration (SaaS-Specific)
Karena SkillBridge adalah SaaS, integrasikan tier membership:

```prisma
enum SubscriptionTier {
  FREE
  PRO
  ENTERPRISE
}

model User {
  // ... existing fields
  tier           SubscriptionTier @default(FREE)
  subscriptionEnd DateTime?
}

// Batasan per tier
// FREE: 3 roadmap, limited AI chat
// PRO: Unlimited roadmap, full AI chat
// ENTERPRISE: Team features, custom branding
```

### 7.9 📱 Device/Session Tracking
Track login dari berbagai device:

```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  device    String   // "Chrome on Windows"
  ip        String
  lastActive DateTime
  createdAt DateTime @default(now())
}
```

**Benefit:** User bisa melihat dan logout dari device lain.

---

## 8. Prioritas Implementasi

| Fase | Fitur | Prioritas |
|------|-------|-----------|
| **MVP** | Login, Register, JWT Auth | 🔴 Wajib |
| **V1.1** | Email Verification, Password Reset | 🟠 Tinggi |
| **V1.2** | Google/GitHub OAuth | 🟡 Medium-Tinggi |
| **V2.0** | Rate Limiting, Refresh Token | 🟡 Medium |
| **V2.1** | Subscription Tier, RBAC | 🟢 Setelah monetisasi |
| **V3.0** | Device Tracking, Session Management | 🔵 Nice to have |

---

## 9. Package Recommendations

```bash
# Core Auth
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken

# OAuth (jika digunakan)
npm install passport passport-google-oauth20 passport-github2

# Email Service (untuk verification & reset)
npm install nodemailer
npm install -D @types/nodemailer

# Rate Limiting
npm install express-rate-limit

# Validation
npm install zod
```
