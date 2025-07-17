const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const AzureADOIDCStrategy = require("passport-azure-ad").OIDCStrategy;

const config = require("./index");
const { findOrCreateUser } = require("../services/user.service");

/**
 * دالة موحدة لمعالجة OAuth callbacks من جميع المزودين
 * تقوم بتوحيد بيانات المستخدم وإنشاء/تحديث السجل في قاعدة البيانات
 */
const oauthCallback = async (accessToken, refreshToken, profile, done) => {
  try {
    // توحيد بيانات المستخدم من مختلف المزودين
    const normalizedProfile = {
      provider: profile.provider,
      providerId: profile.id,
      name: profile.displayName || profile.username || "User",
      email: profile.emails?.[0]?.value || null,
      avatar: profile.photos?.[0]?.value || null,
    };

    // التحقق من وجود البريد الإلكتروني
    if (!normalizedProfile.email) {
      return done(
        new Error(`Email not provided by ${profile.provider} OAuth provider.`),
        false,
      );
    }

    // البحث عن المستخدم أو إنشاء واحد جديد
    const user = await findOrCreateUser(normalizedProfile);

    // إرجاع المستخدم مع معلومات OAuth إضافية
    const userWithTokens = {
      ...user,
      accessToken,
      refreshToken,
    };

    return done(null, userWithTokens);
  } catch (error) {
    console.error(`❌ OAuth callback error for ${profile.provider}:`, error);
    return done(error, false);
  }
};

// ✅ Google OAuth Strategy
if (config.oauth.google.clientID && config.oauth.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.oauth.google.clientID,
        clientSecret: config.oauth.google.clientSecret,
        callbackURL: config.oauth.google.callbackURL,
        scope: ["profile", "email"],
      },
      oauthCallback,
    ),
  );
  console.log("✅ Google OAuth strategy configured");
} else {
  console.warn("⚠️  Google OAuth not configured - missing credentials");
}

// ✅ GitHub OAuth Strategy
if (config.oauth.github.clientID && config.oauth.github.clientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: config.oauth.github.clientID,
        clientSecret: config.oauth.github.clientSecret,
        callbackURL: config.oauth.github.callbackURL,
        scope: ["user:email"],
      },
      oauthCallback,
    ),
  );
  console.log("✅ GitHub OAuth strategy configured");
} else {
  console.warn("⚠️  GitHub OAuth not configured - missing credentials");
}

// ✅ Facebook OAuth Strategy
if (config.oauth.facebook.clientID && config.oauth.facebook.clientSecret) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: config.oauth.facebook.clientID,
        clientSecret: config.oauth.facebook.clientSecret,
        callbackURL: config.oauth.facebook.callbackURL,
        profileFields: ["id", "displayName", "photos", "email"],
        scope: ["email"],
      },
      oauthCallback,
    ),
  );
  console.log("✅ Facebook OAuth strategy configured");
} else {
  console.warn("⚠️  Facebook OAuth not configured - missing credentials");
}

// ✅ Microsoft OAuth Strategy (using Azure AD)
if (config.oauth.microsoft.clientID && config.oauth.microsoft.clientSecret) {
  passport.use(
    "microsoft",
    new AzureADOIDCStrategy(
      {
        identityMetadata: `https://login.microsoftonline.com/${config.oauth.microsoft.tenant}/v2.0/.well-known/openid_configuration`,
        clientID: config.oauth.microsoft.clientID,
        clientSecret: config.oauth.microsoft.clientSecret,
        redirectUrl: `http://${config.host}:${config.port}${config.oauth.microsoft.callbackURL}`,
        allowHttpForRedirectUrl: config.env !== "production",
        responseType: "code",
        responseMode: "query",
        scope: ["profile", "email", "openid"],
        passReqToCallback: false,
      },
      async (iss, sub, profile, accessToken, refreshToken, done) => {
        try {
          // تحويل profile من Microsoft إلى الشكل الموحد
          const normalizedProfile = {
            provider: "microsoft",
            providerId: profile.oid || profile.sub,
            name:
              profile.name || `${profile.given_name} ${profile.family_name}`,
            email: profile.preferred_username || profile.email,
            avatar: null, // Microsoft لا يوفر صورة في ال�� profile
          };

          const user = await findOrCreateUser(normalizedProfile);
          const userWithTokens = {
            ...user,
            accessToken,
            refreshToken,
          };

          return done(null, userWithTokens);
        } catch (error) {
          console.error("❌ Microsoft OAuth callback error:", error);
          return done(error, false);
        }
      },
    ),
  );
  console.log("✅ Microsoft OAuth strategy configured");
} else {
  console.warn("⚠️  Microsoft OAuth not configured - missing credentials");
}

// Apple OAuth Strategy (متقدم - يتطلب مفاتيح Apple الخاصة)
// يمكن إضافته لاحقاً مع passport-apple
if (config.oauth.apple.clientID && config.oauth.apple.teamID) {
  console.log("⚠️  Apple OAuth configuration detected but not implemented yet");
  console.log(
    "💡 Consider installing passport-apple for full Apple OAuth support",
  );
}

/**
 * Passport Serialization
 * في نهج JWT stateless، نحتاج serialization مؤقت فقط لعملية OAuth redirect
 */
passport.serializeUser((user, done) => {
  // حفظ معرف المستخدم فقط
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // في نهج JWT، هذا سيُستخدم فقط مؤقتاً أثناء OAuth flow
    // المعلومات الفعلية ستأتي من JWT في الطلبات اللاحقة
    done(null, { id });
  } catch (error) {
    done(error, null);
  }
});

/**
 * دالة مساعدة للحصول على المزودين المتاحين
 * @returns {Array<string>} قائمة بالمزودين المُفعلين
 */
const getAvailableProviders = () => {
  const providers = [];

  if (config.oauth.google.clientID) providers.push("google");
  if (config.oauth.github.clientID) providers.push("github");
  if (config.oauth.facebook.clientID) providers.push("facebook");
  if (config.oauth.microsoft.clientID) providers.push("microsoft");
  if (config.oauth.apple.clientID) providers.push("apple");

  return providers;
};

/**
 * دالة للتحقق من أن OAuth provider مُفعل
 * @param {string} provider
 * @returns {boolean}
 */
const isProviderEnabled = (provider) => {
  const availableProviders = getAvailableProviders();
  return availableProviders.includes(provider);
};

module.exports = {
  passport,
  getAvailableProviders,
  isProviderEnabled,
};
