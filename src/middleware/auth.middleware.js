const { verifyAuthToken } = require("../services/token.service");

/**
 * Middleware للتحقق من JWT والمصادقة
 * يتحقق من وجود وصحة الـ JWT في الطلب
 */
const authMiddleware = async (req, res, next) => {
  try {
    // استخراج الـ token من الطلب
    let token = null;

    // البحث في Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // إزالة "Bearer "
    }

    // البحث في body (للطلبات POST)
    if (!token && req.body && req.body.token) {
      token = req.body.token;
    }

    // البحث في query parameters
    if (!token && req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access token is required",
        code: "TOKEN_MISSING",
      });
    }

    // التحقق من صحة الـ token
    const authResult = await verifyAuthToken(token);

    if (!authResult) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
        code: "TOKEN_INVALID",
      });
    }

    // إضافة بيانات المستخدم والجلسة للطلب
    req.user = authResult.user;
    req.session = authResult.session;
    req.token = token;

    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      error: "Authentication error",
      code: "AUTH_ERROR",
    });
  }
};

/**
 * Middleware اختياري للتحقق من JWT (لا يرفض الطلب إذا لم يكن موجود)
 * مفيد للـ endpoints التي تعمل مع وبدون مصادقة
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    // استخراج الـ token
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (token) {
      // إذا كان الـ token موجود، تحقق منه
      const authResult = await verifyAuthToken(token);
      if (authResult) {
        req.user = authResult.user;
        req.session = authResult.session;
        req.token = token;
      }
    }

    // المتابعة بغض النظر عن وجود الـ token
    next();
  } catch (error) {
    console.error("❌ Optional auth middleware error:", error);
    // في حالة الخطأ، نتابع بدون مصادقة
    next();
  }
};

/**
 * Middleware للتحقق من أن المستخدم مُوثق عبر provider معين
 * @param {string|Array<string>} allowedProviders - المزودين المسموحين
 */
const requireProvider = (allowedProviders) => {
  const providers = Array.isArray(allowedProviders)
    ? allowedProviders
    : [allowedProviders];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    if (!providers.includes(req.user.provider)) {
      return res.status(403).json({
        success: false,
        error: `Access restricted to users from: ${providers.join(", ")}`,
        code: "PROVIDER_NOT_ALLOWED",
      });
    }

    next();
  };
};

/**
 * Middleware للتحقق من أن البريد الإلكتروني مُتحقق منه
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      error: "Email verification required",
      code: "EMAIL_NOT_VERIFIED",
    });
  }

  next();
};

/**
 * Middleware للتحقق من أن الحساب نشط
 */
const requireActiveAccount = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }

  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      error: "Account is deactivated",
      code: "ACCOUNT_DEACTIVATED",
    });
  }

  next();
};

/**
 * دالة مساعدة لاستخراج معلومات الطلب (IP, User Agent)
 * @param {object} req - Express request object
 * @returns {object} معلومات الطلب
 */
const extractRequestInfo = (req) => {
  return {
    userAgent: req.headers["user-agent"] || "Unknown",
    ipAddress:
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.headers["x-real-ip"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      "Unknown",
  };
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireProvider,
  requireEmailVerified,
  requireActiveAccount,
  extractRequestInfo,
};
