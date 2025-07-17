#!/usr/bin/env node

/**
 * 🚀 KNOUX FINDR Authentication Server v2.0
 * خادم مصادقة محسن وآمن مع إدارة متقدمة للجلسات والـ JWT
 *
 * المميزات:
 * - مصادقة JWT آمنة
 * - OAuth متعدد المزودين
 * - إدارة جلسات متقدمة
 * - طبقات أمان شاملة
 * - قاعدة بيانات دائمة
 * - معالجة أخطاء مركزية
 */

const app = require("./src/app");
const config = require("./src/config");
const { PrismaClient } = require("@prisma/client");
const { logger } = require("./src/middleware/error.middleware");

const prisma = new PrismaClient();

/**
 * تهيئة قاعدة البيانات
 */
async function initializeDatabase() {
  try {
    // التحقق من الاتصال ��قاعدة البيانات
    await prisma.$connect();
    logger.info("✅ Database connected successfully");

    // إنشاء الجداول إذا لم تكن موجودة (SQLite فقط)
    if (config.database.url.includes("file:")) {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password TEXT,
          avatar TEXT,
          provider TEXT NOT NULL,
          providerId TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          lastLogin DATETIME,
          emailVerified BOOLEAN DEFAULT 0,
          isActive BOOLEAN DEFAULT 1
        )
      `;

      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          token TEXT UNIQUE NOT NULL,
          userAgent TEXT,
          ipAddress TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          expiresAt DATETIME NOT NULL,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `;

      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS password_resets (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expiresAt DATETIME NOT NULL,
          used BOOLEAN DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      logger.info("✅ Database tables verified/created");
    }
  } catch (error) {
    logger.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

/**
 * معالج إيقاف الخادم بشكل صحيح
 */
async function gracefulShutdown() {
  logger.info("🔄 Graceful shutdown initiated...");

  try {
    // إغلاق اتصال قاعدة البيانات
    await prisma.$disconnect();
    logger.info("✅ Database disconnected");

    // إنهاء العملية
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
}

/**
 * معالجة الإشارات لإيقاف الخادم
 */
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

/**
 * معالجة الأخطاء غير المتوقعة
 */
process.on("uncaughtException", (error) => {
  logger.error("💥 Uncaught Exception:", error);
  gracefulShutdown();
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown();
});

/**
 * بدء تشغيل الخادم
 */
async function startServer() {
  try {
    // تهيئة قاعدة البيانات
    await initializeDatabase();

    // بدء الخادم
    const server = app.listen(config.port, config.host, () => {
      logger.info(`🚀 KNOUX FINDR Auth Server v2.0 is running!`);
      logger.info(`📡 Server: http://${config.host}:${config.port}`);
      logger.info(`🌐 Frontend: ${config.clientUrl}`);
      logger.info(`🔧 Environment: ${config.env}`);
      logger.info(`📊 Log Level: ${config.logLevel}`);

      // عرض المزودين المتاحين
      const { getAvailableProviders } = require("./src/config/passport");
      const providers = getAvailableProviders();

      logger.info(
        `🔐 OAuth Providers: ${providers.length > 0 ? providers.join(", ") : "None configured"}`,
      );

      // عرض الـ endpoints المهمة
      console.log(`\n📋 Available Endpoints:`);
      console.log(`   🏠 Home: http://${config.host}:${config.port}/`);
      console.log(`   🏥 Health: http://${config.host}:${config.port}/health`);
      console.log(`   🔐 Auth: http://${config.host}:${config.port}/auth`);

      if (providers.includes("google")) {
        console.log(
          `   📱 Google OAuth: http://${config.host}:${config.port}/auth/google`,
        );
      }
      if (providers.includes("github")) {
        console.log(
          `   🐙 GitHub OAuth: http://${config.host}:${config.port}/auth/github`,
        );
      }
      if (providers.includes("facebook")) {
        console.log(
          `   📘 Facebook OAuth: http://${config.host}:${config.port}/auth/facebook`,
        );
      }
      if (providers.includes("microsoft")) {
        console.log(
          `   🏢 Microsoft OAuth: http://${config.host}:${config.port}/auth/microsoft`,
        );
      }

      console.log(`\n🛡️  Security Features:`);
      console.log(`   ✅ JWT Authentication`);
      console.log(
        `   ✅ Rate Limiting (${config.rateLimit.max} requests per ${config.rateLimit.windowMs / 1000}s)`,
      );
      console.log(`   ✅ CORS Protection`);
      console.log(`   ✅ Security Headers (Helmet)`);
      console.log(`   ✅ Session Management`);
      console.log(`   ✅ Database Persistence`);

      console.log(`\n📚 Documentation:`);
      console.log(`   💾 Database: ${config.database.url}`);
      console.log(`   📁 Logs: ./logs/`);
      console.log(`   ⚙️  Config: Validated with Joi`);

      console.log(`\n🎯 Ready to accept connections!`);
    });

    // إعداد timeout للخادم
    server.timeout = 30000; // 30 ثانية

    return server;
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// تشغيل الخادم
if (require.main === module) {
  startServer();
}

module.exports = { startServer, gracefulShutdown };
