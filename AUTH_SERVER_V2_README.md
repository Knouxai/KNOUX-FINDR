# 🚀 KNOUX FINDR Authentication Server v2.0

خادم مصادقة محسن وآمن مبني خصيصاً لتطبيق KNOUX FINDR مع ميزات متقدمة وأمان عالي.

## ✨ المميزات الجديدة

### 🔐 الأمان والحماية

- **JWT Authentication** مع إدارة متقدمة للجلسات
- **Rate Limiting** للحماية من هجمات القوة الغاشمة
- **Helmet Security Headers** لحماية شاملة
- **CORS Protection** مُكوَّن بعناية
- **Input Validation** مع Joi schemas
- **Password Hashing** باستخدام bcrypt (12 rounds)

### 🌐 OAuth المتقدم

- **Google OAuth 2.0** ✅
- **GitHub OAuth 2.0** ✅
- **Facebook OAuth 2.0** ✅
- **Microsoft OAuth 2.0** ✅
- **Apple Sign In** (قادم قريباً)

### 📊 إدارة الجلسات

- **Multi-device Sessions** - تسجيل دخول متعدد الأجهزة
- **Session Tracking** - تتبع الجلسات بـ IP وUser Agent
- **Bulk Logout** - تسجيل خروج من جميع الأجهزة
- **Session Cleanup** - تنظيف تلقائي للجلسات المنتهية

### 🗄️ قاعدة البيانات

- **Prisma ORM** لإدارة قاعدة البيانات
- **SQLite** للتطوير، **PostgreSQL** للإنتاج
- **Migration System** للتحديثات الآمنة
- **Connection Pooling** للأداء المُحسَّن

## 🏗️ هيكل المشروع

```
src/
├── config/
│   ├── index.js          # إدارة متغيرات البيئة مع Joi
│   └── passport.js       # إعدادات OAuth موحدة
├── controllers/
│   └── auth.controller.js # منطق معالجة الطلبات
├── middleware/
│   ├── auth.middleware.js  # التحقق من JWT
│   └── error.middleware.js # معالجة الأخطاء المركزي
├── routes/
│   └── auth.routes.js     # تعريف المسارات
├── services/
│   ├── user.service.js    # خدمات المستخدم
│   └── token.service.js   # خدمات JWT والجلسات
└── app.js                # التطبيق الرئيسي

prisma/
└── schema.prisma         # نموذج قاعدة البيانات

logs/                     # ملفات السجلات
auth-server-v2.js        # نقطة البداية
```

## 🚀 التشغيل السريع

### 1. تثبيت التبعيات

```bash
npm install
```

### 2. إعداد متغيرات البيئة

```bash
cp .env.example .env
# قم بتعديل .env وأضف OAuth credentials الخاصة بك
```

### 3. إعداد قاعدة البيانات

```bash
npx prisma db push
npx prisma generate
```

### 4. تشغيل الخادم

```bash
# للتطوير
npm run dev

# للإنتاج
npm start

# أو مباشرة
node auth-server-v2.js
```

## 📋 متغيرات البيئة المطلوبة

### الأساسية (مطلوبة)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_super_secure_jwt_secret_minimum_64_chars"
SESSION_SECRET="your_super_secure_session_secret_minimum_64_chars"
CLIENT_URL="http://localhost:3000"
```

### OAuth (مطلوبة)

```env
# Google
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# GitHub
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

# Facebook
FACEBOOK_APP_ID="your_facebook_app_id"
FACEBOOK_APP_SECRET="your_facebook_app_secret"
```

### اختيارية

```env
# Microsoft OAuth
MICROSOFT_CLIENT_ID="your_microsoft_client_id"
MICROSOFT_CLIENT_SECRET="your_microsoft_client_secret"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=10
```

## 🌐 API Endpoints

### المصادقة المحلية

```http
POST /auth/register     # تسجيل حساب جديد
POST /auth/login        # تسجيل دخول
```

### OAuth

```http
GET /auth/google        # تسجيل دخول بـ Google
GET /auth/github        # تسجيل دخول بـ GitHub
GET /auth/facebook      # تسجيل دخول بـ Facebook
GET /auth/microsoft     # تسجيل دخول بـ Microsoft
```

### إدارة الجلسات (تتطلب JWT)

```http
GET /auth/me            # بيانات المستخدم الحالي
GET /auth/sessions      # الجلسات النشطة
POST /auth/logout       # تسجيل خروج (الجلسة الحالية)
POST /auth/logout-all   # تسجيل خروج (جميع الأجهزة)
POST /auth/verify-token # التحقق من صحة الـ token
```

### المراقبة

```http
GET /health            # حالة الخادم
GET /                  # معلومات الخادم
GET /auth/providers    # المزودين المتاحين
```

## 🔧 استخدام JWT

### إرسال الـ Token

```javascript
// في Authorization header (الطريقة المُفضلة)
headers: {
  'Authorization': 'Bearer your_jwt_token_here'
}

// أو في request body
{
  "token": "your_jwt_token_here"
}
```

### OAuth Flow

```
1. Frontend يوجه المستخدم إلى GET /auth/google
2. المستخدم يوافق على الأذونات
3. Google يعيد التوجيه إلى /auth/google/callback
4. الخادم ينشئ JWT ويعيد التوجيه إلى CLIENT_URL/auth/callback?token=JWT
5. Frontend يحفظ الـ JWT ويستخدمه في الطلبات
```

## 🛡️ ميزات الأمان

### Rate Limiting

- **10 طلبات** كل **15 دقيقة** لمسارات الحساسة
- حماية من هجمات Brute Force
- استثناء OAuth callbacks

### JWT Security

- **Strong secrets** (minimum 32 characters)
- **7-day expiration** (قابل للتخصيص)
- **Database session tracking**
- **Multi-device management**

### Headers Security (Helmet)

- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (HTTPS)

### Input Validation

```javascript
// مثال: تسجيل مستخدم جديد
{
  "name": "John Doe",           // 2-50 characters
  "email": "john@example.com",  // Valid email
  "password": "SecurePass123"   // Min 8 chars, uppercase, lowercase, number
}
```

## 📊 إدارة الجلسات

### Multi-Device Support

```javascript
// الحصول على جميع الجلسات
GET /auth/sessions

Response:
{
  "success": true,
  "sessions": [
    {
      "id": "session_id",
      "userAgent": "Chrome/120.0",
      "ipAddress": "192.168.1.1",
      "createdAt": "2024-01-01T10:00:00Z",
      "current": true
    }
  ]
}
```

### Bulk Logout

```javascript
// تسجيل خروج من جميع الأجهزة
POST /auth/logout-all

Response:
{
  "success": true,
  "message": "Logged out from all devices (3 sessions)",
  "revokedSessions": 3
}
```

## 🔍 التحليل والمراقبة

### Health Check

```javascript
GET /health

Response:
{
  "success": true,
  "status": "OK",
  "uptime": 3600,
  "features": {
    "localAuth": true,
    "jwtTokens": true,
    "oauthProviders": ["google", "github", "facebook"]
  }
}
```

### Logging

- **Winston Logger** للتسجيل المتقدم
- **Structured Logs** في JSON format
- **Error Tracking** مع stack traces
- **Request Logging** (development only)

## 🚀 نشر في الإنتاج

### متغيرات البيئة

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your_production_jwt_secret_minimum_64_characters"
CLIENT_URL="https://your-frontend-domain.com"
```

### Security Checklist

- [ ] استخدم HTTPS
- [ ] قاعدة بيانات PostgreSQL
- [ ] JWT secrets قوية
- [ ] CORS محدود لدومين الإنتاج
- [ ] Rate limiting مُفعل
- [ ] Logs monitoring

## 🔧 التخصيص

### إضافة OAuth Provider جديد

1. أضف strategy في `src/config/passport.js`
2. أضف routes في `src/routes/auth.routes.js`
3. أضف متغيرات البيئة في `src/config/index.js`

### تخصيص JWT

```javascript
// في src/config/index.js
jwt: {
  secret: envVars.JWT_SECRET,
  expiresIn: '30d', // تغيير فترة الانتهاء
}
```

## 🐛 استكشاف الأخطاء

### مشاكل شائعة

**OAuth callback fails:**

- تحقق من CLIENT_URL في .env
- تحقق من OAuth credentials
- تحقق من callback URLs في OAuth settings

**JWT invalid:**

- تحقق من JWT_SECRET
- تحقق من token expiration
- تحقق من session في قاعدة البيانات

**Database errors:**

- قم بتشغيل `npx prisma db push`
- تحقق من DATABASE_URL
- تحقق من file permissions (SQLite)

### Debug Mode

```bash
LOG_LEVEL=debug node auth-server-v2.js
```

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ feature branch
3. Commit التغييرات
4. اختبر جميع endpoints
5. أنشئ Pull Request

## 📝 المشاكل المُحلولة

✅ **تخزين دائم** - قاعدة بيانات بدلاً من الذاكرة
✅ **أمان الـ URL** - JWT فقط في callback، ليس بيانات المستخدم
✅ **فصل المسؤوليات** - هيكل منظم وقابل للصيانة
✅ **OAuth حقيقي** - strategies فعلية بدلاً من محاكاة
✅ **حماية شاملة** - rate limiting وvalidation
✅ **إدارة الإعدادات** - Joi validation لمتغيرات البيئة
✅ **معالجة أخطاء مركزية** - Winston logging ومعالجة موحدة

## 🎯 الخطوات التالية

1. **اختبار شامل** لجميع endpoints
2. **Integration tests** للـ OAuth flows
3. **Performance optimization**
4. **Docker containerization**
5. **API documentation** مع Swagger
6. **Email verification** للحسابات المحلية
7. **Password reset** functionality
8. **Admin panel** لإدارة المستخدمين

---

🚀 **نسخة محسنة من خادم المصادقة جاهزة للاستخدام!**
