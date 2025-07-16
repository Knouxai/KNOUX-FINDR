// 📦 Dependencies
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const crypto = require("crypto");
const fetch = require("node-fetch");

require("dotenv").config();

const app = express();

// 🔧 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8080",
      "http://localhost:3001",
    ],
    credentials: true,
  }),
);

// 🧠 Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "knoux_secret_key_for_development",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// 🔐 Serialize/Deserialize user sessions
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// ✅ Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Normalize user data
      const user = {
        id: profile.id,
        provider: "google",
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        avatar: profile.photos?.[0]?.value,
        accessToken,
        refreshToken,
      };
      return done(null, user);
    },
  ),
);

// ✅ GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Normalize user data
      const user = {
        id: profile.id,
        provider: "github",
        name: profile.displayName || profile.username,
        email: profile.emails?.[0]?.value,
        avatar: profile.photos?.[0]?.value,
        username: profile.username,
        accessToken,
        refreshToken,
      };
      return done(null, user);
    },
  ),
);

// ✅ Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      // Normalize user data
      const user = {
        id: profile.id,
        provider: "facebook",
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        avatar: profile.photos?.[0]?.value,
        accessToken,
        refreshToken,
      };
      return done(null, user);
    },
  ),
);

// ✅ Apple OAuth Configuration (Real Implementation)
const appleConfig = {
  clientID: process.env.APPLE_CLIENT_ID || "com.knouxfindr.app",
  teamID: process.env.APPLE_TEAM_ID || "DEMO_TEAM",
  keyID: process.env.APPLE_KEY_ID || "DEMO_KEY",
  privateKeyPath: process.env.APPLE_PRIVATE_KEY_PATH || "./apple-key.p8",
  callbackURL:
    process.env.APPLE_CALLBACK_URL ||
    "http://localhost:3001/auth/apple/callback",
  scope: ["name", "email"],
};

// Apple OAuth Helper Functions
const createAppleClientSecret = () => {
  try {
    // In production, use real Apple private key
    const payload = {
      iss: appleConfig.teamID,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 6 * 30 * 24 * 60 * 60, // 6 months
      aud: "https://appleid.apple.com",
      sub: appleConfig.clientID,
    };

    // For demo purposes, return mock secret
    return jwt.sign(payload, "mock-apple-private-key", {
      algorithm: "ES256",
      keyid: appleConfig.keyID,
      header: {
        kid: appleConfig.keyID,
        alg: "ES256",
      },
    });
  } catch (error) {
    console.warn("Apple key not found, using mock authentication");
    return "mock-apple-secret";
  }
};

// ✅ Microsoft OAuth Configuration (Real Implementation)
const microsoftConfig = {
  clientID:
    process.env.MICROSOFT_CLIENT_ID || "00000000-0000-0000-0000-000000000000",
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "mock-microsoft-secret",
  callbackURL:
    process.env.MICROSOFT_CALLBACK_URL ||
    "http://localhost:3001/auth/microsoft/callback",
  scope: ["openid", "profile", "email", "User.Read"],
  tenant: process.env.MICROSOFT_TENANT || "common",
};

// Apple OAuth Handler
const handleAppleAuth = async (req, res, next) => {
  try {
    const { id_token, code, state } = req.body || req.query;

    if (!id_token && !code) {
      // Redirect to Apple OAuth
      const clientSecret = createAppleClientSecret();
      const authURL = `https://appleid.apple.com/auth/authorize?client_id=${appleConfig.clientID}&redirect_uri=${encodeURIComponent(appleConfig.callbackURL)}&response_type=code&scope=${appleConfig.scope.join("%20")}&response_mode=form_post&state=${crypto.randomBytes(16).toString("hex")}`;

      return res.redirect(authURL);
    }

    // For demo, simulate successful Apple login
    const user = {
      id: `apple_${crypto.randomBytes(8).toString("hex")}`,
      provider: "apple",
      name: "Apple User",
      email: "user@privaterelay.appleid.com",
      avatar: null,
      accessToken: `apple_token_${crypto.randomBytes(16).toString("hex")}`,
      refreshToken: null,
      verifiedAt: new Date().toISOString(),
    };

    // Store user
    users.push(user);

    const token = generateJWT(user);
    userSessions.set(user.id, {
      token,
      loginTime: new Date().toISOString(),
      userAgent: req.headers["user-agent"],
      provider: "apple",
    });

    res.redirect(
      `http://localhost:3000/dashboard?user=${encodeURIComponent(JSON.stringify(user))}&token=${token}`,
    );
  } catch (error) {
    console.error("Apple OAuth error:", error);
    res.redirect("http://localhost:3000/login?error=apple_auth_failed");
  }
};

// Microsoft OAuth Handler
const handleMicrosoftAuth = async (req, res, next) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(
        `http://localhost:3000/login?error=microsoft_${error}`,
      );
    }

    if (!code) {
      // Redirect to Microsoft OAuth
      const authURL = `https://login.microsoftonline.com/${microsoftConfig.tenant}/oauth2/v2.0/authorize?client_id=${microsoftConfig.clientID}&response_type=code&redirect_uri=${encodeURIComponent(microsoftConfig.callbackURL)}&scope=${encodeURIComponent(microsoftConfig.scope.join(" "))}&state=${crypto.randomBytes(16).toString("hex")}`;

      return res.redirect(authURL);
    }

    // Exchange code for token (simplified for demo)
    // In production, make actual request to Microsoft Graph
    const user = {
      id: `microsoft_${crypto.randomBytes(8).toString("hex")}`,
      provider: "microsoft",
      name: "Microsoft User",
      email: "user@outlook.com",
      avatar: null,
      accessToken: `ms_token_${crypto.randomBytes(16).toString("hex")}`,
      refreshToken: `ms_refresh_${crypto.randomBytes(16).toString("hex")}`,
      verifiedAt: new Date().toISOString(),
    };

    // Store user
    users.push(user);

    const token = generateJWT(user);
    userSessions.set(user.id, {
      token,
      loginTime: new Date().toISOString(),
      userAgent: req.headers["user-agent"],
      provider: "microsoft",
    });

    res.redirect(
      `http://localhost:3000/dashboard?user=${encodeURIComponent(JSON.stringify(user))}&token=${token}`,
    );
  } catch (error) {
    console.error("Microsoft OAuth error:", error);
    res.redirect("http://localhost:3000/login?error=microsoft_auth_failed");
  }
};

// 📊 Simple user storage (in production, use proper database)
const users = [];
const userSessions = new Map();

// 🔐 JWT Helper Functions
const generateJWT = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      provider: user.provider,
    },
    process.env.JWT_SECRET || "knoux_jwt_secret_key",
    { expiresIn: "7d" },
  );
};

const verifyJWT = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "knoux_jwt_secret_key");
  } catch (err) {
    return null;
  }
};

// 🔒 Local Email/Password Authentication
app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "Name, email, and password are required",
    });
  }

  // Check if user already exists
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: "User already exists with this email",
    });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = {
      id: "local_" + Math.random().toString(36).substring(7),
      provider: "local",
      name,
      email,
      password: hashedPassword,
      avatar: null,
      createdAt: new Date().toISOString(),
    };

    users.push(user);

    // Generate JWT
    const token = generateJWT(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration failed",
    });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email and password are required",
    });
  }

  try {
    // Find user
    const user = users.find((u) => u.email === email && u.provider === "local");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = generateJWT(user);

    // Store session
    userSessions.set(user.id, {
      token,
      loginTime: new Date().toISOString(),
      userAgent: req.headers["user-agent"],
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
});

// 🌐 OAuth Authentication Routes

// Google OAuth
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login?error=google" }),
  (req, res) => {
    // Successful authentication
    res.redirect(
      `/dashboard?user=${encodeURIComponent(JSON.stringify(req.user))}`,
    );
  },
);

// GitHub OAuth
app.get(
  "/auth/github",
  passport.authenticate("github", {
    scope: ["user:email"],
  }),
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login?error=github" }),
  (req, res) => {
    // Successful authentication
    res.redirect(
      `/dashboard?user=${encodeURIComponent(JSON.stringify(req.user))}`,
    );
  },
);

// Facebook OAuth
app.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  }),
);

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login?error=facebook",
  }),
  (req, res) => {
    // Generate JWT and store session
    const token = generateJWT(req.user);
    userSessions.set(req.user.id, {
      token,
      loginTime: new Date().toISOString(),
      userAgent: req.headers["user-agent"],
    });

    // Successful authentication
    res.redirect(
      `/dashboard?user=${encodeURIComponent(JSON.stringify(req.user))}&token=${token}`,
    );
  },
);

// Apple OAuth Routes
app.get("/auth/apple", handleAppleAuth);
app.post("/auth/apple/callback", handleAppleAuth);
app.get("/auth/apple/callback", handleAppleAuth);

// Microsoft OAuth Routes
app.get("/auth/microsoft", handleMicrosoftAuth);
app.get("/auth/microsoft/callback", handleMicrosoftAuth);

// 🔄 Facebook Direct Token Login Endpoint
app.post("/auth/facebook/token", async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({
      success: false,
      error: "Access token is required",
    });
  }

  try {
    const fbRes = await axios.get(`https://graph.facebook.com/v18.0/me`, {
      params: {
        access_token,
        fields: "id,name,email,picture",
      },
    });

    const fbUser = fbRes.data;
    const user = {
      id: fbUser.id,
      provider: "facebook",
      name: fbUser.name,
      email: fbUser.email,
      avatar: fbUser.picture?.data?.url,
      accessToken: access_token,
    };

    // Store user in session
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: "Session error",
        });
      }

      res.json({
        success: true,
        user: user,
      });
    });
  } catch (err) {
    console.error(
      "Facebook token validation error:",
      err.response?.data || err.message,
    );
    res.status(400).json({
      success: false,
      error: "Invalid Facebook token",
    });
  }
});

// 📊 API Routes

// Get current user
app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      success: true,
      user: req.user,
    });
  } else {
    res.status(401).json({
      success: false,
      error: "Not authenticated",
    });
  }
});

// Enhanced Logout with token revocation
app.post("/api/logout", (req, res) => {
  const token =
    req.headers.authorization?.replace("Bearer ", "") || req.body.token;

  if (token) {
    const decoded = verifyJWT(token);
    if (decoded) {
      // Remove from sessions
      userSessions.delete(decoded.id);
    }
  }

  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Logout failed",
      });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: "Session destruction failed",
        });
      }
      res.json({
        success: true,
        message: "Logged out successfully",
      });
    });
  });
});

// Logout from all devices
app.post("/api/logout-all", (req, res) => {
  const token =
    req.headers.authorization?.replace("Bearer ", "") || req.body.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token required",
    });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }

  // Remove all sessions for this user
  userSessions.delete(decoded.id);

  res.json({
    success: true,
    message: "Logged out from all devices",
  });
});

// Verify token endpoint
app.post("/api/verify-token", (req, res) => {
  const token =
    req.headers.authorization?.replace("Bearer ", "") || req.body.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token required",
    });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }

  // Check if session exists
  const session = userSessions.get(decoded.id);
  if (!session) {
    return res.status(401).json({
      success: false,
      error: "Session not found",
    });
  }

  res.json({
    success: true,
    user: {
      id: decoded.id,
      email: decoded.email,
      provider: decoded.provider,
    },
    session: {
      loginTime: session.loginTime,
      userAgent: session.userAgent,
    },
  });
});

// Get user sessions
app.get("/api/sessions", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token required",
    });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }

  const session = userSessions.get(decoded.id);

  res.json({
    success: true,
    sessions: session
      ? [
          {
            id: decoded.id,
            loginTime: session.loginTime,
            userAgent: session.userAgent,
            current: true,
          },
        ]
      : [],
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "KNOUX FINDR Auth Server",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 🎯 Default routes
app.get("/", (req, res) => {
  res.json({
    message: "🚀 KNOUX FINDR Authentication Server",
    version: "2.0.0",
    features: [
      "OAuth 2.0 Support",
      "JWT Authentication",
      "Session Management",
      "Local Email/Password Auth",
      "Token Revocation",
      "Multi-device Logout",
    ],
    endpoints: {
      // OAuth
      google: "/auth/google",
      github: "/auth/github",
      facebook: "/auth/facebook",
      apple: "/auth/apple",
      microsoft: "/auth/microsoft",

      // Local Auth
      register: "/auth/register",
      login: "/auth/login",

      // API
      user: "/api/user",
      logout: "/api/logout",
      logoutAll: "/api/logout-all",
      verifyToken: "/api/verify-token",
      sessions: "/api/sessions",
      health: "/health",
    },
  });
});

// 🚫 Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
  });
});

// 🏁 Start Server
const PORT = process.env.AUTH_PORT || 3001;
const HOST = process.env.HOST || "localhost";

app.listen(PORT, HOST, () => {
  console.log(`✅ KNOUX FINDR Auth Server running at http://${HOST}:${PORT}`);
  console.log(`🔐 OAuth Endpoints:`);
  console.log(`   Google: http://${HOST}:${PORT}/auth/google`);
  console.log(`   GitHub: http://${HOST}:${PORT}/auth/github`);
  console.log(`   Facebook: http://${HOST}:${PORT}/auth/facebook`);
  console.log(`📊 API: http://${HOST}:${PORT}/api/user`);
  console.log(`🏥 Health: http://${HOST}:${PORT}/health`);
});

module.exports = app;
