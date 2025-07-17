const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

// استيراد الإعدادات والخدمات
const config = require("./config");
const { passport } = require("./config/passport");
const authRoutes = require("./routes/auth.routes");
const {
  errorHandler,
  notFoundHandler,
  logger,
} = require("./middleware/error.middleware");
const { cleanupExpiredSessions } = require("./services/token.service");

// إنشاء التطبيق
const app = express();

// 🛡️ طبقات الأمان الأساسية
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false, // تعطيل COEP للسماح بـ OAuth redirects
  }),
);

// 📊 معالجة البيانات الواردة
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 🌐 إعدادات CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // السماح بالطلبات بدون origin (مثل mobile apps)
      if (!origin) return callback(null, true);

      // السماح للـ CLIENT_URL المُعرف
      if (origin === config.clientUrl) {
        return callback(null, true);
      }

      // في بيئة التطوير، السماح بـ localhost ports
      if (config.env === "development") {
        const allowedDevelopmentOrigins = [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:8080",
          "http://127.0.0.1:3000",
          "http://127.0.0.1:3001",
          "http://127.0.0.1:8080",
        ];
        if (allowedDevelopmentOrigins.includes(origin)) {
          return callback(null, true);
        }
      }

      // رفض الطلبات من origins غير مُفوض لهم
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// 📝 إعداد الجلسات (مطلوب فقط لـ OAuth flow)
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.env === "production", // HTTPS only في الإنتاج
      httpOnly: true,
      maxAge: 10 * 60 * 1000, // 10 دقائق (كافية لـ OAuth flow)
    },
    name: "knoux.auth.sid", // اسم مخصص للكوكي
  }),
);

// 🔐 تهيئة Passport
app.use(passport.initialize());
app.use(passport.session());

// 🚫 Rate Limiting للمصادقة
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many authentication attempts",
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
  },
  skip: (req) => {
    // تخطي OAuth callbacks من rate limiting
    return req.path.includes("/callback");
  },
});

// تطبيق rate limiting على مسا��ات المصادقة الحساسة
app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);
app.use("/auth/verify-token", authLimiter);

// 🌐 مسارات API
app.use("/auth", authRoutes);

// 📊 Health Check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    service: "KNOUX FINDR Auth Server",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    features: {
      localAuth: true,
      jwtTokens: true,
      sessionManagement: true,
      rateLimiting: true,
      securityHeaders: true,
      oauthProviders: require("./config/passport").getAvailableProviders(),
    },
  });
});

// 📋 معلومات الخادم
app.get("/", (req, res) => {
  const availableProviders =
    require("./config/passport").getAvailableProviders();

  res.json({
    success: true,
    message: "🚀 KNOUX FINDR Authentication Server",
    version: "2.0.0",
    status: "Active",
    features: [
      "🔐 JWT Authentication",
      "🌐 OAuth 2.0 Support",
      "📱 Multi-device Session Management",
      "🛡️ Advanced Security Headers",
      "⚡ Rate Limiting Protection",
      "📊 Comprehensive Logging",
      "���� Token Refresh & Revocation",
    ],
    providers: {
      local: "Email/Password Authentication",
      oauth: availableProviders.reduce((acc, provider) => {
        const providerNames = {
          google: "Google OAuth 2.0",
          github: "GitHub OAuth 2.0",
          facebook: "Facebook OAuth 2.0",
          microsoft: "Microsoft OAuth 2.0",
          apple: "Apple Sign In",
        };
        acc[provider] = providerNames[provider] || provider;
        return acc;
      }, {}),
    },
    endpoints: {
      authentication: "/auth",
      health: "/health",
      documentation: "/docs",
    },
    security: {
      rateLimiting: "Enabled",
      corsProtection: "Enabled",
      helmetSecurity: "Enabled",
      sessionSecurity: "HTTPOnly + Secure",
    },
  });
});

// 📚 إنشاء مجلد logs إذا لم يكن موجوداً
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 🧹 تنظيف الجلسات المنتهية الصلاحية كل ساعة
setInterval(
  async () => {
    try {
      const cleanedCount = await cleanupExpiredSessions();
      if (cleanedCount > 0) {
        logger.info(`Cleaned up ${cleanedCount} expired sessions`);
      }
    } catch (error) {
      logger.error("Error during session cleanup:", error);
    }
  },
  60 * 60 * 1000,
); // كل ساعة

// 📈 تسجيل الطلبات الواردة (في بيئة التطوير فقط)
if (config.env === "development") {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });
    next();
  });
}

// 🚫 معالجة المسارات غير الموجودة
app.use(notFoundHandler);

// ❌ معالجة الأخطاء المركزي
app.use(errorHandler);

module.exports = app;
