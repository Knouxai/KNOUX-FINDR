const Joi = require("joi");
const {
  createLocalUser,
  verifyLocalUser,
  findUserById,
} = require("../services/user.service");
const {
  generateAuthToken,
  revokeToken,
  revokeAllUserTokens,
  getUserActiveSessions,
} = require("../services/token.service");
const {
  extractRequestInfo,
  createValidationError,
  createUnauthorizedError,
  catchAsync,
} = require("../middleware/error.middleware");
const config = require("../config");

// مخططات التحقق من البيانات
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 50 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      "any.required": "Password is required",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

/**
 * تسجيل مستخدم جديد محلياً
 */
const register = catchAsync(async (req, res) => {
  // التحقق من صحة البيانات
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    const details = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));
    throw createValidationError("Registration validation failed", details);
  }

  const { name, email, password } = value;
  const requestInfo = extractRequestInfo(req);

  try {
    // إنشاء المستخدم
    const user = await createLocalUser({ name, email, password });

    // إنشاء JWT token
    const { token, expiresAt } = await generateAuthToken(user, requestInfo);

    // إزالة كلمة المرور من الاستجابة
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: userWithoutPassword,
      token,
      expiresAt,
    });
  } catch (error) {
    if (error.message.includes("already exists")) {
      throw createValidationError("An account with this email already exists");
    }
    throw error;
  }
});

/**
 * تسجيل دخول محلي
 */
const login = catchAsync(async (req, res) => {
  // التحقق من صحة البيانات
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    const details = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));
    throw createValidationError("Login validation failed", details);
  }

  const { email, password } = value;
  const requestInfo = extractRequestInfo(req);

  // التحقق من بيانات الاعتماد
  const user = await verifyLocalUser(email, password);
  if (!user) {
    throw createUnauthorizedError("Invalid email or password");
  }

  // التحقق من أن الحساب نشط
  if (!user.isActive) {
    throw createUnauthorizedError(
      "Account is deactivated. Please contact support.",
    );
  }

  // إنشاء JWT token
  const { token, expiresAt } = await generateAuthToken(user, requestInfo);

  // إزالة كلمة المرور من الاستجابة
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: "Login successful",
    user: userWithoutPassword,
    token,
    expiresAt,
  });
});

/**
 * معالج موحد لإعادة التوجيه من OAuth
 * يتم استدعاؤه بعد نجاح المصادقة من أي مزود OAuth
 */
const oauthCallback = catchAsync(async (req, res) => {
  if (!req.user) {
    return res.redirect(`${config.clientUrl}/login?error=oauth_failed`);
  }

  const requestInfo = extractRequestInfo(req);

  try {
    // إنشاء JWT token للمستخدم
    const { token, expiresAt } = await generateAuthToken(req.user, requestInfo);

    // إعادة التوجيه إلى الواجهة الأمامية مع الـ token فقط
    // هذا يحل مشكلة إرسال بيانات المستخدم في الـ URL
    res.redirect(`${config.clientUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error("❌ OAuth callback error:", error);
    res.redirect(`${config.clientUrl}/login?error=token_generation_failed`);
  }
});

/**
 * معالج فشل OAuth
 */
const oauthFailure = (req, res) => {
  const provider = req.params.provider || "unknown";
  res.redirect(`${config.clientUrl}/login?error=${provider}_auth_failed`);
};

/**
 * الحصول على بيانات المستخدم الحالي
 */
const getCurrentUser = catchAsync(async (req, res) => {
  // req.user تم تعيينه بواسطة authMiddleware
  if (!req.user) {
    throw createUnauthorizedError("User not found");
  }

  // جلب البيانات المحدثة من قاعدة البيانات
  const user = await findUserById(req.user.id);
  if (!user) {
    throw createUnauthorizedError("User not found");
  }

  res.json({
    success: true,
    user,
    session: {
      loginTime: req.session.createdAt,
      userAgent: req.session.userAgent,
      ipAddress: req.session.ipAddress,
    },
  });
});

/**
 * تسجيل خروج من الجلسة الحالية
 */
const logout = catchAsync(async (req, res) => {
  const token = req.token; // تم تعيينه بواسطة authMiddleware

  if (token) {
    await revokeToken(token);
  }

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * تسجيل خروج من جميع الأجهزة
 */
const logoutAll = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const revokedCount = await revokeAllUserTokens(userId);

  res.json({
    success: true,
    message: `Logged out from all devices (${revokedCount} sessions)`,
    revokedSessions: revokedCount,
  });
});

/**
 * الحصول على جميع الجلسات النشطة
 */
const getSessions = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const currentToken = req.token;

  const sessions = await getUserActiveSessions(userId);

  // تمييز الجلسة الحالية
  const sessionsWithCurrent = sessions.map((session) => ({
    id: session.id,
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    current: session.token === currentToken,
  }));

  res.json({
    success: true,
    sessions: sessionsWithCurrent,
    total: sessionsWithCurrent.length,
  });
});

/**
 * التحقق من صحة الـ token
 */
const verifyToken = catchAsync(async (req, res) => {
  // إذا وصل الطلب إلى ه��ا، فهذا يعني أن الـ token صحيح (تم التحقق في authMiddleware)
  res.json({
    success: true,
    message: "Token is valid",
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      provider: req.user.provider,
      emailVerified: req.user.emailVerified,
      isActive: req.user.isActive,
    },
    session: {
      createdAt: req.session.createdAt,
      userAgent: req.session.userAgent,
      ipAddress: req.session.ipAddress,
    },
  });
});

/**
 * إحصائيات المصادقة
 */
const getAuthStats = catchAsync(async (req, res) => {
  // هذا endpoint مفيد للمراقبة والتحليل
  res.json({
    success: true,
    stats: {
      user: {
        id: req.user.id,
        provider: req.user.provider,
        lastLogin: req.user.lastLogin,
        emailVerified: req.user.emailVerified,
      },
      session: {
        current: req.session,
        // يمكن إضافة إحصائيات أخرى هنا
      },
    },
  });
});

module.exports = {
  register,
  login,
  oauthCallback,
  oauthFailure,
  getCurrentUser,
  logout,
  logoutAll,
  getSessions,
  verifyToken,
  getAuthStats,
};
