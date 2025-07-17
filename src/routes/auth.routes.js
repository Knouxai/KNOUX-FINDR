const express = require("express");
const {
  passport,
  isProviderEnabled,
  getAvailableProviders,
} = require("../config/passport");
const authController = require("../controllers/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const {
  createNotFoundError,
  catchAsync,
} = require("../middleware/error.middleware");

const router = express.Router();

// ✅ المصادقة المحلية (Local Authentication)
router.post("/register", authController.register);
router.post("/login", authController.login);

// ✅ Google OAuth
if (isProviderEnabled("google")) {
  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    }),
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: "/auth/failure/google",
    }),
    authController.oauthCallback,
  );
}

// ✅ GitHub OAuth
if (isProviderEnabled("github")) {
  router.get(
    "/github",
    passport.authenticate("github", {
      scope: ["user:email"],
      session: false,
    }),
  );

  router.get(
    "/github/callback",
    passport.authenticate("github", {
      session: false,
      failureRedirect: "/auth/failure/github",
    }),
    authController.oauthCallback,
  );
}

// ✅ Facebook OAuth
if (isProviderEnabled("facebook")) {
  router.get(
    "/facebook",
    passport.authenticate("facebook", {
      scope: ["email"],
      session: false,
    }),
  );

  router.get(
    "/facebook/callback",
    passport.authenticate("facebook", {
      session: false,
      failureRedirect: "/auth/failure/facebook",
    }),
    authController.oauthCallback,
  );
}

// ✅ Microsoft OAuth
if (isProviderEnabled("microsoft")) {
  router.get(
    "/microsoft",
    passport.authenticate("microsoft", {
      session: false,
    }),
  );

  router.get(
    "/microsoft/callback",
    passport.authenticate("microsoft", {
      session: false,
      failureRedirect: "/auth/failure/microsoft",
    }),
    authController.oauthCallback,
  );
}

// ✅ Apple OAuth (للمستقبل)
if (isProviderEnabled("apple")) {
  router.get("/apple", (req, res) => {
    res.status(501).json({
      success: false,
      error: "Apple OAuth is configured but not yet implemented",
      message: "Apple OAuth integration is coming soon",
    });
  });
}

// ❌ معالج فشل OAuth العام
router.get("/failure/:provider", authController.oauthFailure);

// 🔐 المسارات المحمية (تتطلب JWT صحيح)

// الحصول على بيانات المستخدم الحالي
router.get("/me", authMiddleware, authController.getCurrentUser);

// تسجيل الخروج من الجلسة الحالية
router.post("/logout", authMiddleware, authController.logout);

// تسجيل الخروج من جميع الأجهزة
router.post("/logout-all", authMiddleware, authController.logoutAll);

// الحصول على جميع الجلسات النشطة
router.get("/sessions", authMiddleware, authController.getSessions);

// التحقق من صحة الـ token
router.post("/verify-token", authMiddleware, authController.verifyToken);

// إحصائيات المصادقة
router.get("/stats", authMiddleware, authController.getAuthStats);

// 📊 معلومات عن المزودين المتاحين
router.get(
  "/providers",
  catchAsync(async (req, res) => {
    const availableProviders = getAvailableProviders();

    res.json({
      success: true,
      providers: {
        available: availableProviders,
        local: true, // المصادقة المحلية متاحة دائماً
        oauth: availableProviders.filter((p) => p !== "local"),
      },
      endpoints: {
        local: {
          register: "POST /auth/register",
          login: "POST /auth/login",
        },
        oauth: availableProviders.reduce((acc, provider) => {
          acc[provider] = `GET /auth/${provider}`;
          return acc;
        }, {}),
        protected: {
          me: "GET /auth/me",
          logout: "POST /auth/logout",
          logoutAll: "POST /auth/logout-all",
          sessions: "GET /auth/sessions",
          verifyToken: "POST /auth/verify-token",
          stats: "GET /auth/stats",
        },
      },
    });
  }),
);

// 🎯 معالج المسارات غير الموجودة لـ auth
router.use((req, res, next) => {
  throw createNotFoundError(
    `Auth endpoint not found: ${req.method} ${req.path}`,
  );
});

module.exports = router;
