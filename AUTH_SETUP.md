# 🔐 KNOUX FINDR OAuth Authentication Setup

## 📋 Overview

KNOUX FINDR supports OAuth authentication with Google, GitHub, and Facebook for seamless user login.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env
```

### 3. Configure OAuth Providers

#### 🟢 Google OAuth Setup

1. Visit [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Set **Authorized redirect URI**: `http://localhost:3001/auth/google/callback`
6. Copy Client ID and Secret to `.env`

#### ⚫ GitHub OAuth Setup

1. Visit [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create new OAuth App:
   - **Application name**: KNOUX FINDR
   - **Homepage URL**: `http://localhost:3001`
   - **Authorization callback URL**: `http://localhost:3001/auth/github/callback`
3. Copy Client ID and Secret to `.env`

#### 🔵 Facebook OAuth Setup

1. Visit [Facebook Developers](https://developers.facebook.com/apps/)
2. Create App → Select "Consumer" → App name: KNOUX FINDR
3. Add Facebook Login product
4. Settings → Basic → Add platform "Website"
5. Set **Valid OAuth Redirect URI**: `http://localhost:3001/auth/facebook/callback`
6. Copy App ID and App Secret to `.env`

### 4. Start Servers

```bash
# Start all services (main app + auth server)
npm run dev-full

# Or start separately:
npm run server      # Main app (port 3000)
npm run auth-server # Auth server (port 3001)
```

## 🌐 API Endpoints

### Authentication URLs

- **Google**: `http://localhost:3001/auth/google`
- **GitHub**: `http://localhost:3001/auth/github`
- **Facebook**: `http://localhost:3001/auth/facebook`

### API Routes

- **GET** `/api/user` - Get current authenticated user
- **POST** `/api/logout` - Logout user
- **POST** `/auth/facebook/token` - Direct Facebook token login
- **GET** `/health` - Health check

### User Object Format

```json
{
  "id": "user_id",
  "provider": "google|github|facebook",
  "name": "User Name",
  "email": "user@example.com",
  "avatar": "https://avatar-url.jpg",
  "accessToken": "access_token",
  "refreshToken": "refresh_token"
}
```

## 🔧 Integration with React

### Frontend Login Buttons

```jsx
const handleSocialLogin = (provider) => {
  window.location.href = `http://localhost:3001/auth/${provider}`;
};

// Usage
<button onClick={() => handleSocialLogin('google')}>
  🟢 Login with Google
</button>
<button onClick={() => handleSocialLogin('github')}>
  ⚫ Login with GitHub
</button>
<button onClick={() => handleSocialLogin('facebook')}>
  🔵 Login with Facebook
</button>
```

### Check Authentication Status

```jsx
const checkAuthStatus = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/user", {
      credentials: "include",
    });
    const data = await response.json();
    if (data.success) {
      setUser(data.user);
    }
  } catch (error) {
    console.log("Not authenticated");
  }
};
```

### Logout

```jsx
const handleLogout = async () => {
  try {
    await fetch("http://localhost:3001/api/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
```

## 🛠️ Development Notes

### CORS Configuration

The auth server includes CORS support for:

- `http://localhost:3000` (main app)
- `http://localhost:8080` (webpack dev)
- `http://localhost:3001` (auth server)

### Session Management

- Sessions expire after 24 hours
- Secure cookies in production
- Session data includes full user profile

### Error Handling

- Invalid tokens return 400 status
- Authentication failures redirect to login
- All errors logged for debugging

## 🚨 Security Best Practices

1. **Environment Variables**: Never commit `.env` to version control
2. **HTTPS in Production**: Use HTTPS for all OAuth callbacks in production
3. **Session Secrets**: Use strong, unique session secrets
4. **CORS Origins**: Restrict CORS to specific domains in production
5. **Token Validation**: Always validate OAuth tokens server-side

## 📝 Environment Variables Reference

```bash
# Server
NODE_ENV=development|production
AUTH_PORT=3001
HOST=localhost
SESSION_SECRET=your_secure_random_string

# Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Facebook
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check callback URLs match exactly in OAuth app settings
   - Ensure port numbers are correct

2. **"Session not found"**
   - Check CORS credentials are included in requests
   - Verify session middleware is configured

3. **"Access denied"**
   - Check OAuth app permissions/scopes
   - Verify client IDs and secrets

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and logging.

## 📞 Support

For issues with OAuth setup, check the console logs in both servers for detailed error information.
