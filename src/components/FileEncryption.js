import React, { useState, useEffect, useCallback } from "react";

const FileEncryption = ({ user }) => {
  const [encryptionTasks, setEncryptionTasks] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [keyStrength, setKeyStrength] = useState("strong");
  const [encryptionMethod, setEncryptionMethod] = useState("AES-256");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [encryptedFiles, setEncryptedFiles] = useState([]);
  const [secureVault, setSecureVault] = useState({
    totalFiles: 0,
    totalSize: 0,
    lastBackup: null,
    vaultHealth: "excellent",
  });

  // تحميل الملفات المشفرة والمهام النشطة
  useEffect(() => {
    loadEncryptedFiles();
    loadEncryptionTasks();
    loadSecureVault();
  }, []);

  // تحميل الملفات المشفرة من backend
  const loadEncryptedFiles = async () => {
    try {
      if (window.electronAPI) {
        // الحصول على الملفات المشفرة من Electron backend
        const encrypted = await window.electronAPI.getEncryptedFiles();
        setEncryptedFiles(encrypted);
      } else {
        // محاكاة للواجهة Web
        const mockEncrypted = [
          {
            id: 1,
            originalName: "تقرير_مالي_سري.pdf",
            encryptedName: "enc_f4e7d3c2a1b5.knx",
            size: 2500000,
            encryptedAt: Date.now() - 86400000,
            method: "AES-256",
            keyStrength: "strong",
            hash: "sha256_abc123def456",
            status: "encrypted",
          },
          {
            id: 2,
            originalName: "كلمات_مرور.txt",
            encryptedName: "enc_a1b2c3d4e5f6.knx",
            size: 15000,
            encryptedAt: Date.now() - 3600000,
            method: "AES-256",
            keyStrength: "strong",
            hash: "sha256_def789ghi012",
            status: "encrypted",
          },
        ];
        setEncryptedFiles(mockEncrypted);
      }
    } catch (error) {
      console.error("خطأ في تحميل الملفات المشفرة:", error);
    }
  };

  // تحميل مهام التشفير النشطة
  const loadEncryptionTasks = async () => {
    try {
      if (window.electronAPI) {
        const tasks = await window.electronAPI.getEncryptionTasks();
        setEncryptionTasks(tasks);
      }
    } catch (error) {
      console.error("خطأ في تحميل مهام التشفير:", error);
    }
  };

  // تحميل معلومات الخزنة الآمنة
  const loadSecureVault = async () => {
    try {
      if (window.electronAPI) {
        const vault = await window.electronAPI.getSecureVault();
        setSecureVault(vault);
      } else {
        // محاكاة بيانات الخزنة
        setSecureVault({
          totalFiles: encryptedFiles.length,
          totalSize: encryptedFiles.reduce((sum, file) => sum + file.size, 0),
          lastBackup: Date.now() - 7200000, // منذ ساعتين
          vaultHealth: "excellent",
        });
      }
    } catch (error) {
      console.error("خطأ في تحميل معلومات الخزنة:", error);
    }
  };

  // تشفير الملفات المحددة
  const encryptSelectedFiles = useCallback(async () => {
    if (selectedFiles.length === 0) {
      alert("⚠️ يرجى تحديد ملفات للتشفير");
      return;
    }

    if (!encryptionKey || encryptionKey.length < 8) {
      alert("⚠️ يرجى إدخال كلمة مرور قوية (8 أحرف على الأقل)");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // محاكاة عملية التشفير
        console.log(`🔐 تشفير الملف: ${file.name}`);

        if (window.electronAPI) {
          // تشفير حقيقي في Electron
          const encrypted = await window.electronAPI.encryptFile({
            filePath: file.path,
            key: encryptionKey,
            method: encryptionMethod,
            keyStrength: keyStrength,
          });

          // إضافة الملف المشفر للقائمة
          setEncryptedFiles((prev) => [...prev, encrypted]);
        } else {
          // محاكاة للواجهة Web
          const encryptedFile = {
            id: Date.now() + i,
            originalName: file.name,
            encryptedName: `enc_${Math.random().toString(36).substr(2, 12)}.knx`,
            size: file.size,
            encryptedAt: Date.now(),
            method: encryptionMethod,
            keyStrength: keyStrength,
            hash: `sha256_${Math.random().toString(36).substr(2, 16)}`,
            status: "encrypted",
          };

          setEncryptedFiles((prev) => [...prev, encryptedFile]);
        }

        // تحديث التقدم
        setProcessingProgress(((i + 1) / selectedFiles.length) * 100);

        // تأخير للمحاكاة
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      alert(`✅ تم تشفير ${selectedFiles.length} ملف بنجاح!`);
      setSelectedFiles([]);
      setEncryptionKey("");
    } catch (error) {
      console.error("خطأ في التشفير:", error);
      alert(`❌ فشل في التشفير: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      loadSecureVault(); // تحديث معلومات الخزنة
    }
  }, [selectedFiles, encryptionKey, encryptionMethod, keyStrength]);

  // فك تشفير ملف
  const decryptFile = async (encryptedFile) => {
    const key = prompt("🔑 أدخل كلمة المرور لفك التشفير:");

    if (!key) return;

    try {
      if (window.electronAPI) {
        const decrypted = await window.electronAPI.decryptFile({
          encryptedPath: encryptedFile.encryptedName,
          key: key,
          originalName: encryptedFile.originalName,
        });

        if (decrypted.success) {
          alert(`✅ تم فك تشفير الملف: ${decrypted.outputPath}`);
        }
      } else {
        // محاكاة فك التشفير
        console.log(`🔓 فك تشفير الملف: ${encryptedFile.originalName}`);
        alert(`✅ تم فك تشفير الملف: ${encryptedFile.originalName}`);
      }
    } catch (error) {
      alert(`❌ فشل في فك التشفير: ${error.message}`);
    }
  };

  // حذف ملف مشفر
  const deleteEncryptedFile = async (fileId) => {
    const confirmed = window.confirm(
      "⚠️ هل أنت متأكد من حذف هذا الملف المشفر نهائياً؟",
    );

    if (confirmed) {
      try {
        if (window.electronAPI) {
          await window.electronAPI.deleteEncryptedFile(fileId);
        }

        setEncryptedFiles((prev) => prev.filter((f) => f.id !== fileId));
        alert("✅ تم حذف الملف المشفر");
        loadSecureVault();
      } catch (error) {
        alert(`❌ فشل في الحذف: ${error.message}`);
      }
    }
  };

  // تنسيق حجم الملف
  const formatFileSize = (bytes) => {
    const sizes = ["بايت", "كيلو", "ميجا", "جيجا"];
    if (bytes === 0) return "0 بايت";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // تنسيق التاريخ
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("ar", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta text-white p-6"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-3 flex items-center gap-3">
                🔒 ت��فير الملفات المتقدم
              </h1>
              <p className="text-gray-300 text-lg">
                حماية فائقة لملفاتك الحساسة بتشفير عسكري المستوى
              </p>
            </div>

            {/* معلومات الخزنة السريعة */}
            <div className="glass-button p-4 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {secureVault.totalFiles}
                </div>
                <div className="text-sm text-gray-400">ملفات محمية</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* عملية التشفير الجديدة */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                🛡️ تشفير ملفات جديدة
              </h2>

              {/* إعدادات التشفير */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-3">
                    طريقة التشفير
                  </label>
                  <select
                    value={encryptionMethod}
                    onChange={(e) => setEncryptionMethod(e.target.value)}
                    className="w-full glass-button p-3 rounded-lg"
                  >
                    <option value="AES-256">AES-256 (الأقوى)</option>
                    <option value="AES-128">AES-128 (سريع)</option>
                    <option value="ChaCha20">ChaCha20 (متوازن)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    قوة المفتاح
                  </label>
                  <select
                    value={keyStrength}
                    onChange={(e) => setKeyStrength(e.target.value)}
                    className="w-full glass-button p-3 rounded-lg"
                  >
                    <option value="maximum">أقصى (بطيء، آمن جداً)</option>
                    <option value="strong">قوي (متوازن)</option>
                    <option value="standard">معياري (سريع)</option>
                  </select>
                </div>
              </div>

              {/* كلمة المرور */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  🔑 كلمة مرور التشفير
                </label>
                <input
                  type="password"
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  placeholder="أدخل كلمة مرور قوية (8 أحرف على الأقل)"
                  className="w-full glass-button p-3 rounded-lg"
                  minLength={8}
                />

                {/* مؤشر قوة كلمة المرور */}
                {encryptionKey && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          encryptionKey.length >= 12
                            ? "bg-green-500 w-full"
                            : encryptionKey.length >= 8
                              ? "bg-yellow-500 w-2/3"
                              : "bg-red-500 w-1/3"
                        }`}
                      ></div>
                    </div>
                    <div className="text-xs mt-1 text-gray-400">
                      قوة كلمة المرور:{" "}
                      {encryptionKey.length >= 12
                        ? "🟢 ممتازة"
                        : encryptionKey.length >= 8
                          ? "🟡 جيدة"
                          : "🔴 ضعيفة"}
                    </div>
                  </div>
                )}
              </div>

              {/* منطقة اختيار الملفات */}
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center mb-6 hover:border-blue-500 transition-colors">
                <div className="text-4xl mb-4">📁</div>
                <div className="text-lg mb-2">
                  اسحب الملفات هنا أو انقر للاختيار
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  يدعم جميع أنواع الملفات
                </div>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files).map(
                      (file, index) => ({
                        id: Date.now() + index,
                        name: file.name,
                        size: file.size,
                        path: file.webkitRelativePath || file.name,
                      }),
                    );
                    setSelectedFiles(files);
                  }}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="primary-button px-6 py-3 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                >
                  اختيار الملفات
                </label>
              </div>

              {/* الملفات المحددة */}
              {selectedFiles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    📋 الملفات المحددة ({selectedFiles.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between glass-button p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">📄</span>
                          <div>
                            <div className="font-medium">{file.name}</div>
                            <div className="text-sm text-gray-400">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setSelectedFiles((prev) =>
                              prev.filter((f) => f.id !== file.id),
                            )
                          }
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* زر التشفير */}
              <button
                onClick={encryptSelectedFiles}
                disabled={
                  selectedFiles.length === 0 || !encryptionKey || isProcessing
                }
                className="w-full primary-button py-4 rounded-xl font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    🔐 جاري التشفير... {Math.round(processingProgress)}%
                  </div>
                ) : (
                  `🔐 تشفير ${selectedFiles.length > 0 ? selectedFiles.length + " " : ""}الملفات`
                )}
              </button>

              {/* شريط التقدم */}
              {isProcessing && (
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* معلومات الخزنة الآمنة */}
          <div>
            <div className="glass-card rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🏦 الخزنة الآمنة
              </h3>

              <div className="space-y-4">
                <div className="glass-button p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {secureVault.totalFiles}
                  </div>
                  <div className="text-sm text-gray-400">الملفات المحمية</div>
                </div>

                <div className="glass-button p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {formatFileSize(secureVault.totalSize)}
                  </div>
                  <div className="text-sm text-gray-400">المساحة المحمية</div>
                </div>

                <div className="glass-button p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">صحة الخزنة</span>
                    <span
                      className={`text-sm ${
                        secureVault.vaultHealth === "excellent"
                          ? "text-green-400"
                          : secureVault.vaultHealth === "good"
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {secureVault.vaultHealth === "excellent"
                        ? "🟢 ممتازة"
                        : secureVault.vaultHealth === "good"
                          ? "🟡 جيدة"
                          : "🔴 تحتاج مراجعة"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    آخر نسخة احتياطية:{" "}
                    {secureVault.lastBackup
                      ? formatDate(secureVault.lastBackup)
                      : "لم يتم"}
                  </div>
                </div>
              </div>
            </div>

            {/* إعدادات الأمان السريعة */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">⚙️ إعدادات سريعة</h3>

              <div className="space-y-3">
                <button className="w-full glass-button p-3 rounded-lg text-sm hover:bg-blue-500/20 transition-colors">
                  💾 نسخة احتياطية للخزنة
                </button>
                <button className="w-full glass-button p-3 rounded-lg text-sm hover:bg-green-500/20 transition-colors">
                  🔄 مزامنة آمنة
                </button>
                <button className="w-full glass-button p-3 rounded-lg text-sm hover:bg-purple-500/20 transition-colors">
                  📊 تقرير الأمان
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* قائمة الملفات المشفرة */}
        <div className="glass-card rounded-xl p-6 mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              🔐 الملفات المشفرة
            </h2>
            <div className="text-sm text-gray-400">
              {encryptedFiles.length} ملف محمي
            </div>
          </div>

          {encryptedFiles.length > 0 ? (
            <div className="space-y-3">
              {encryptedFiles.map((file) => (
                <div key={file.id} className="glass-button p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">🔒</div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {file.originalName}
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                            {file.method}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatFileSize(file.size)} • مشفر في{" "}
                          {formatDate(file.encryptedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => decryptFile(file)}
                        className="glass-button px-3 py-2 rounded-lg text-sm hover:bg-green-500/20 transition-colors"
                      >
                        🔓 فك التشفير
                      </button>
                      <button
                        onClick={() => deleteEncryptedFile(file.id)}
                        className="glass-button px-3 py-2 rounded-lg text-sm hover:bg-red-500/20 transition-colors text-red-400"
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔒</div>
              <div className="text-xl text-gray-400 mb-2">
                لا توجد ملفات مشفرة
              </div>
              <div className="text-sm text-gray-500">
                ابدأ بتشفير ملفاتك الحساسة
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileEncryption;
