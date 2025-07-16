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
    // Successful authentication
    res.redirect(
      `/dashboard?user=${encodeURIComponent(JSON.stringify(req.user))}`,
    );
  },
);

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

// Logout
app.post("/api/logout", (req, res) => {
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
    version: "1.0.0",
    endpoints: {
      google: "/auth/google",
      github: "/auth/github",
      facebook: "/auth/facebook",
      user: "/api/user",
      logout: "/api/logout",
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
