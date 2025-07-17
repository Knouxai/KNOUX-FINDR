const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const config = require("../config");

const prisma = new PrismaClient();

/**
 * إنشاء JWT token آمن
 * @param {object} user - كائن المستخدم
 * @param {object} options - خيارات إضافية مثل userAgent, ipAddress
 * @returns {Promise<{token: string, expiresAt: Date}>}
 */
const generateAuthToken = async (user, options = {}) => {
  try {
    const { userAgent, ipAddress } = options;

    // إنشاء payload للـ JWT
    const payload = {
      sub: user.id, // subject (معرف المستخدم)
      email: user.email,
      provider: user.provider,
      iat: Math.floor(Date.now() / 1000), // issued at
    };

    // إنشاء الـ JWT
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    // حساب تاريخ انتهاء الصلاحية
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 أيام

    // حفظ الجلسة في قاعدة البيانات
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        userAgent: userAgent || "Unknown",
        ipAddress: ipAddress || "Unknown",
        expiresAt,
      },
    });

    return { token, expiresAt };
  } catch (error) {
    console.error("❌ Error generating auth token:", error);
    throw new Error("Failed to generate authentication token");
  }
};

/**
 * التحقق من صحة JWT token
 * @param {string} token
 * @returns {Promise<{user: object, session: object}|null>}
 */
const verifyAuthToken = async (token) => {
  try {
    // التحقق من صحة الـ JWT
    const decoded = jwt.verify(token, config.jwt.secret);

    // البحث عن الجلسة في قاعدة البيانات
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            provider: true,
            emailVerified: true,
            isActive: true,
            lastLogin: true,
          },
        },
      },
    });

    if (!session) {
      return null; // الجلسة غير موجودة
    }

    // التحقق من انتهاء صلاحية الجلسة
    if (session.expiresAt < new Date()) {
      // حذف الجلسة المنتهية الصلاحية
      await prisma.session.delete({
        where: { id: session.id },
      });
      return null;
    }

    // التحقق من أن المستخدم لا يزال نشطاً
    if (!session.user.isActive) {
      return null;
    }

    return {
      user: session.user,
      session: {
        id: session.id,
        createdAt: session.createdAt,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
      },
    };
  } catch (error) {
    // JWT غير صحيح أو منتهي الصلاحية
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return null;
    }
    console.error("❌ Error verifying auth token:", error);
    return null;
  }
};

/**
 * إلغاء جلسة معينة
 * @param {string} token
 * @returns {Promise<boolean>}
 */
const revokeToken = async (token) => {
  try {
    const deletedSession = await prisma.session.delete({
      where: { token },
    });
    return !!deletedSession;
  } catch (error) {
    console.error("❌ Error revoking token:", error);
    return false;
  }
};

/**
 * إلغاء جميع جلسات المستخدم
 * @param {string} userId
 * @returns {Promise<number>} عدد الجلسات المحذوفة
 */
const revokeAllUserTokens = async (userId) => {
  try {
    const result = await prisma.session.deleteMany({
      where: { userId },
    });
    return result.count;
  } catch (error) {
    console.error("❌ Error revoking all user tokens:", error);
    return 0;
  }
};

/**
 * الحصول على جميع جلسات المستخدم النشطة
 * @param {string} userId
 * @returns {Promise<Array>}
 */
const getUserActiveSessions = async (userId) => {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(), // أكبر من الوقت الحالي
        },
      },
      select: {
        id: true,
        token: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return sessions;
  } catch (error) {
    console.error("❌ Error getting user sessions:", error);
    return [];
  }
};

/**
 * تنظيف الجلسات المنتهية الصلاحية
 * @returns {Promise<number>} عدد الجلسات المحذوفة
 */
const cleanupExpiredSessions = async () => {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(), // أقل من الوقت الحالي
        },
      },
    });

    if (result.count > 0) {
      console.log(`🧹 Cleaned up ${result.count} expired sessions`);
    }

    return result.count;
  } catch (error) {
    console.error("❌ Error cleaning up expired sessions:", error);
    return 0;
  }
};

/**
 * إنشاء رمز إعادة تعيين كلمة المرور
 * @param {string} email
 * @returns {Promise<string>} reset token
 */
const generatePasswordResetToken = async (email) => {
  try {
    // إنشاء رمز عشوائي آمن
    const resetToken = jwt.sign(
      { email, type: "password_reset" },
      config.jwt.secret,
      { expiresIn: "1h" },
    );

    // تاريخ انتهاء الصلاحية (ساعة واحدة)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // حفظ الرمز في قاعدة البيانات
    await prisma.passwordReset.create({
      data: {
        email,
        token: resetToken,
        expiresAt,
      },
    });

    return resetToken;
  } catch (error) {
    console.error("❌ Error generating password reset token:", error);
    throw new Error("Failed to generate password reset token");
  }
};

/**
 * التحقق من رمز إعادة تعيين كلمة المرور
 * @param {string} token
 * @returns {Promise<{email: string}|null>}
 */
const verifyPasswordResetToken = async (token) => {
  try {
    // التحقق من صحة الـ JWT
    const decoded = jwt.verify(token, config.jwt.secret);

    if (decoded.type !== "password_reset") {
      return null;
    }

    // البحث عن الرمز في قاعدة البيانات
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (
      !resetRecord ||
      resetRecord.used ||
      resetRecord.expiresAt < new Date()
    ) {
      return null;
    }

    return { email: resetRecord.email };
  } catch (error) {
    console.error("❌ Error verifying password reset token:", error);
    return null;
  }
};

/**
 * استخدام رمز إعادة تعيين كلمة المرور (تعيينه كمستخدم)
 * @param {string} token
 * @returns {Promise<boolean>}
 */
const usePasswordResetToken = async (token) => {
  try {
    await prisma.passwordReset.update({
      where: { token },
      data: { used: true },
    });
    return true;
  } catch (error) {
    console.error("❌ Error using password reset token:", error);
    return false;
  }
};

module.exports = {
  generateAuthToken,
  verifyAuthToken,
  revokeToken,
  revokeAllUserTokens,
  getUserActiveSessions,
  cleanupExpiredSessions,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  usePasswordResetToken,
};
