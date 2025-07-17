const winston = require("winston");
const config = require("../config");

// إعداد نظام التسجيل
const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "knoux-auth-server" },
  transports: [
    // تسجيل الأخطاء في ملف
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // تسجيل جميع الأحداث في ملف
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// في بيئة التطوير، أضف console logging
if (config.env !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

/**
 * Middleware لمعالجة الأخطاء العامة
 * يجب أن يكون هذا آخر middleware في التطبيق
 */
const errorHandler = (err, req, res, next) => {
  // تسجيل الخطأ
  logger.error("Server Error", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
    userId: req.user?.id,
  });

  // إعداد الاستجابة الافتراضية
  let status = 500;
  let message = "Internal server error";
  let code = "INTERNAL_ERROR";

  // معالجة أنواع مختلفة من الأخطاء
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation failed";
    code = "VALIDATION_ERROR";
  } else if (err.name === "UnauthorizedError") {
    status = 401;
    message = "Unauthorized";
    code = "UNAUTHORIZED";
  } else if (err.name === "ForbiddenError") {
    status = 403;
    message = "Forbidden";
    code = "FORBIDDEN";
  } else if (err.name === "NotFoundError") {
    status = 404;
    message = "Resource not found";
    code = "NOT_FOUND";
  } else if (err.name === "ConflictError") {
    status = 409;
    message = "Resource conflict";
    code = "CONFLICT";
  } else if (err.name === "RateLimitError") {
    status = 429;
    message = "Too many requests";
    code = "RATE_LIMIT_EXCEEDED";
  }

  // بناء الاستجابة
  const response = {
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString(),
  };

  // في بيئة التطوير، أضف تفاصيل إضافية
  if (config.env === "development") {
    response.details = {
      message: err.message,
      stack: err.stack,
    };
  }

  res.status(status).json(response);
};

/**
 * Middleware لمعالجة المسارات غير الموجودة (404)
 */
const notFoundHandler = (req, res, next) => {
  logger.warn("Route not found", {
    url: req.url,
    method: req.method,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    code: "NOT_FOUND",
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      auth: {
        register: "POST /auth/register",
        login: "POST /auth/login",
        google: "GET /auth/google",
        github: "GET /auth/github",
        facebook: "GET /auth/facebook",
        microsoft: "GET /auth/microsoft",
      },
      api: {
        user: "GET /api/user",
        sessions: "GET /api/sessions",
        logout: "POST /api/logout",
        logoutAll: "POST /api/logout-all",
      },
      system: {
        health: "GET /health",
        info: "GET /",
      },
    },
  });
};

/**
 * دالة مساعدة لإنشاء أخطاء مخصصة
 */
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * دالة مساعدة لإنشاء خطأ التحقق
 */
const createValidationError = (message, details = null) => {
  const error = new AppError(message, 400, "VALIDATION_ERROR");
  error.name = "ValidationError";
  error.details = details;
  return error;
};

/**
 * دالة مساعدة لإنشاء خطأ عدم التفويض
 */
const createUnauthorizedError = (message = "Unauthorized") => {
  const error = new AppError(message, 401, "UNAUTHORIZED");
  error.name = "UnauthorizedError";
  return error;
};

/**
 * دالة مساعدة لإنشاء خطأ الممنوع
 */
const createForbiddenError = (message = "Forbidden") => {
  const error = new AppError(message, 403, "FORBIDDEN");
  error.name = "ForbiddenError";
  return error;
};

/**
 * دالة مساعدة لإنشاء خطأ عدم الوجود
 */
const createNotFoundError = (message = "Resource not found") => {
  const error = new AppError(message, 404, "NOT_FOUND");
  error.name = "NotFoundError";
  return error;
};

/**
 * دالة مساعدة لإنشاء خطأ التعارض
 */
const createConflictError = (message = "Resource conflict") => {
  const error = new AppError(message, 409, "CONFLICT");
  error.name = "ConflictError";
  return error;
};

/**
 * Middleware للتحقق من صحة البيانات
 * @param {object} schema - Joi validation schema
 * @param {string} source - مصدر البيانات (body, query, params)
 */
const validateRequest = (schema, source = "body") => {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return next(createValidationError("Validation failed", details));
    }

    // استبدال البيانات المُتحقق منها
    req[source] = value;
    next();
  };
};

/**
 * Wrapper لـ async functions لالتقاط الأخطاء تلقائياً
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  AppError,
  createValidationError,
  createUnauthorizedError,
  createForbiddenError,
  createNotFoundError,
  createConflictError,
  validateRequest,
  catchAsync,
  logger,
};
