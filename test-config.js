const config = require("./src/config");
const { getAvailableProviders } = require("./src/config/passport");

console.log("🔧 Configuration Test:");
console.log("✅ Environment:", config.env);
console.log("✅ Port:", config.port);
console.log("✅ JWT Secret configured:", !!config.jwt.secret);
console.log("✅ Database URL:", config.database.url);
console.log("✅ Available OAuth Providers:", getAvailableProviders());
console.log("\n🎯 Configuration loaded successfully!");
