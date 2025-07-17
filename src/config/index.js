const dotenv = require("dotenv");
const Joi = require("joi");
const path = require("path");

// تحميل متغيرات البيئة
dotenv.config({ path: path.join(__dirname, "../../.env") });

// مخطط التحقق من متغيرات البيئة
const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .default("development"),
    PORT: Joi.number().default(3001),
    HOST: Joi.string().default("localhost"),

    // قاعدة البيانات
    DATABASE_URL: Joi.string()
      .required()
      .description("Database connection URL is required"),

    // JWT Configuration
    JWT_SECRET: Joi.string()
      .min(32)
      .required()
      .description("JWT secret must be at least 32 characters"),
    JWT_EXPIRES_IN: Joi.string().default("7d"),

    // URLs
    CLIENT_URL: Joi.string()
      .uri()
      .required()
      .description("Frontend URL is required for CORS"),

    // Session
    SESSION_SECRET: Joi.string()
      .min(32)
      .required()
      .description("Session secret must be at least 32 characters"),

    // OAuth - Google (Required)
    GOOGLE_CLIENT_ID: Joi.string()
      .required()
      .description("Google OAuth Client ID is required"),
    GOOGLE_CLIENT_SECRET: Joi.string()
      .required()
      .description("Google OAuth Client Secret is required"),

    // OAuth - GitHub (Required)
    GITHUB_CLIENT_ID: Joi.string()
      .required()
      .description("GitHub OAuth Client ID is required"),
    GITHUB_CLIENT_SECRET: Joi.string()
      .required()
      .description("GitHub OAuth Client Secret is required"),

    // OAuth - Facebook (Required)
    FACEBOOK_APP_ID: Joi.string()
      .required()
      .description("Facebook App ID is required"),
    FACEBOOK_APP_SECRET: Joi.string()
      .required()
      .description("Facebook App Secret is required"),

    // OAuth - Apple (Optional)
    APPLE_CLIENT_ID: Joi.string().optional(),
    APPLE_TEAM_ID: Joi.string().optional(),
    APPLE_KEY_ID: Joi.string().optional(),
    APPLE_PRIVATE_KEY_PATH: Joi.string().optional(),

    // OAuth - Microsoft (Optional)
    MICROSOFT_CLIENT_ID: Joi.string().optional(),
    MICROSOFT_CLIENT_SECRET: Joi.string().optional(),
    MICROSOFT_TENANT: Joi.string().default("common"),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: Joi.number().default(10),

    // Logging
    LOG_LEVEL: Joi.string()
      .valid("error", "warn", "info", "debug")
      .default("info"),
  })
  .unknown();

// التحقق من متغيرات البيئة
const { value: envVars, error } = envVarsSchema.validate(process.env);

if (error) {
  console.error("❌ Configuration Error:");
  console.error(error.message);
  console.error(
    "\n💡 Please check your .env file and ensure all required variables are set.",
  );
  console.error("📄 Use .env.example as a reference.");
  process.exit(1);
}

// تصدير الإعدادات المنظمة
module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  host: envVars.HOST,

  // Database
  database: {
    url: envVars.DATABASE_URL,
  },

  // JWT Configuration
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },

  // URLs
  clientUrl: envVars.CLIENT_URL,

  // Session
  session: {
    secret: envVars.SESSION_SECRET,
  },

  // OAuth Providers
  oauth: {
    google: {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    github: {
      clientID: envVars.GITHUB_CLIENT_ID,
      clientSecret: envVars.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    facebook: {
      clientID: envVars.FACEBOOK_APP_ID,
      clientSecret: envVars.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
    },
    apple: {
      clientID: envVars.APPLE_CLIENT_ID,
      teamID: envVars.APPLE_TEAM_ID,
      keyID: envVars.APPLE_KEY_ID,
      privateKeyPath: envVars.APPLE_PRIVATE_KEY_PATH,
      callbackURL: "/auth/apple/callback",
    },
    microsoft: {
      clientID: envVars.MICROSOFT_CLIENT_ID,
      clientSecret: envVars.MICROSOFT_CLIENT_SECRET,
      tenant: envVars.MICROSOFT_TENANT,
      callbackURL: "/auth/microsoft/callback",
    },
  },

  // Rate Limiting
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    max: envVars.RATE_LIMIT_MAX_REQUESTS,
  },

  // Logging
  logLevel: envVars.LOG_LEVEL,
};
