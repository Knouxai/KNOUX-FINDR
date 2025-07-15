#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 بدء تشغيل KNOUX FINDR Desktop Application...");
console.log("📁 المسار:", __dirname);

// Start webpack build process
console.log("📦 بناء التطبيق...");
const buildProcess = spawn("npm", ["run", "build"], {
  stdio: "inherit",
  cwd: __dirname,
});

buildProcess.on("close", (code) => {
  if (code === 0) {
    console.log("✅ تم بناء التطبيق بنجاح");
    console.log("🖥️ تطبيق KNOUX FINDR جاهز للتشغيل");
    console.log("");
    console.log("الميزات المتاحة:");
    console.log("🤖 ذكاء اصطناعي محلي للتحليل النصي");
    console.log("🔍 بحث متقدم في الملفات");
    console.log("📊 فهرسة تلقائية للملفات");
    console.log("🏷️ تصنيف ذكي للملفات");
    console.log("📁 كشف الملفات المكررة");
    console.log("🌍 دعم العربية والإنجليزية");
    console.log("");
    console.log("للتشغيل في بيئة Electron المحلية:");
    console.log("npm run electron-build");
    console.log("");
    console.log("للوصول للواجهة Web:");
    console.log("npm run dev");
  } else {
    console.error("❌ فشل في بناء التطبيق");
    process.exit(1);
  }
});

buildProcess.on("error", (error) => {
  console.error("خطأ في بناء التطبيق:", error);
  process.exit(1);
});
