import React, { useState, useEffect, useCallback } from "react";

const CloudSync = ({ user }) => {
  const [connectedServices, setConnectedServices] = useState({
    googleDrive: { connected: false, email: null, quota: null },
    oneDrive: { connected: false, email: null, quota: null },
    dropbox: { connected: false, email: null, quota: null },
  });

  const [syncStatus, setSyncStatus] = useState({
    isActive: false,
    lastSync: null,
    direction: "bidirectional", // upload, download, bidirectional
    filesInQueue: 0,
    totalSize: 0,
    progress: 0,
  });

  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncInterval: 30, // minutes
    encryptBeforeUpload: true,
    compressFiles: false,
    excludePatterns: [".tmp", ".cache", "node_modules"],
    maxFileSize: 100, // MB
  });

  const [cloudFiles, setCloudFiles] = useState([]);
  const [localFiles, setLocalFiles] = useState([]);
  const [conflictFiles, setConflictFiles] = useState([]);
  const [syncLogs, setSyncLogs] = useState([]);

  // تحميل حالة الاتصالات السحابية
  useEffect(() => {
    loadCloudConnections();
    loadSyncStatus();
    loadSyncLogs();
  }, []);

  // تحميل الاتصالات السحابية
  const loadCloudConnections = async () => {
    try {
      if (window.electronAPI) {
        const connections = await window.electronAPI.getCloudConnections();
        setConnectedServices(connections);
      } else {
        // محاكاة للواجهة Web
        const mockConnections = {
          googleDrive: {
            connected: false,
            email: null,
            quota: { used: 0, total: 15000000000 }, // 15GB
          },
          oneDrive: {
            connected: false,
            email: null,
            quota: { used: 0, total: 5000000000 }, // 5GB
          },
          dropbox: {
            connected: false,
            email: null,
            quota: { used: 0, total: 2000000000 }, // 2GB
          },
        };
        setConnectedServices(mockConnections);
      }
    } catch (error) {
      console.error("خطأ في تحميل الاتصالات السحابية:", error);
    }
  };

  // تحميل حالة المزامنة
  const loadSyncStatus = async () => {
    try {
      if (window.electronAPI) {
        const status = await window.electronAPI.getSyncStatus();
        setSyncStatus(status);
      }
    } catch (error) {
      console.error("خطأ في تحميل حالة المزامنة:", error);
    }
  };

  // تحميل سجل المزامنة
  const loadSyncLogs = async () => {
    try {
      if (window.electronAPI) {
        const logs = await window.electronAPI.getSyncLogs();
        setSyncLogs(logs);
      } else {
        // محاكاة سجل المزامنة
        const mockLogs = [
          {
            id: 1,
            timestamp: Date.now() - 3600000,
            type: "sync_complete",
            service: "googleDrive",
            message: "تمت مزامنة 15 ملف بنجاح",
            filesCount: 15,
            size: 2500000,
            status: "success",
          },
          {
            id: 2,
            timestamp: Date.now() - 7200000,
            type: "conflict_resolved",
            service: "oneDrive",
            message: "تم حل تضارب في ملف: تقرير_العمل.docx",
            filesCount: 1,
            size: 250000,
            status: "warning",
          },
        ];
        setSyncLogs(mockLogs);
      }
    } catch (error) {
      console.error("خطأ في تحميل سجل المزامنة:", error);
    }
  };

  // اتصال بـ Google Drive
  const connectGoogleDrive = async () => {
    try {
      if (window.electronAPI) {
        // اتصال حقيقي عبر Electron
        const result = await window.electronAPI.connectGoogleDrive();
        if (result.success) {
          setConnectedServices((prev) => ({
            ...prev,
            googleDrive: {
              connected: true,
              email: result.email,
              quota: result.quota,
            },
          }));
          alert("✅ تم الاتصال بـ Google Drive بنجاح!");
        }
      } else {
        // محاكاة اتصال OAuth للواجهة Web
        const authUrl =
          `https://accounts.google.com/oauth/authorize?` +
          `client_id=YOUR_GOOGLE_CLIENT_ID&` +
          `redirect_uri=${encodeURIComponent(window.location.origin + "/auth/google/callback")}&` +
          `scope=${encodeURIComponent("https://www.googleapis.com/auth/drive")}&` +
          `response_type=code&` +
          `access_type=offline`;

        // فتح نافذة OAuth
        const popup = window.open(
          authUrl,
          "google-drive-auth",
          "width=600,height=600",
        );

        // مراقبة إغلاق النافذة
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            // محاكاة نجاح الاتصال
            setConnectedServices((prev) => ({
              ...prev,
              googleDrive: {
                connected: true,
                email: user?.email || "user@example.com",
                quota: { used: 2000000000, total: 15000000000 },
              },
            }));
            alert("✅ تم الاتصال بـ Google Drive بنجاح!");
            loadCloudFiles("googleDrive");
          }
        }, 1000);
      }
    } catch (error) {
      console.error("خطأ في الاتصال بـ Google Drive:", error);
      alert(`❌ فشل الاتصال: ${error.message}`);
    }
  };

  // اتصال بـ OneDrive
  const connectOneDrive = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.connectOneDrive();
        if (result.success) {
          setConnectedServices((prev) => ({
            ...prev,
            oneDrive: {
              connected: true,
              email: result.email,
              quota: result.quota,
            },
          }));
          alert("✅ تم الاتصال بـ OneDrive بنجاح!");
        }
      } else {
        // محاكاة اتصال OneDrive
        setTimeout(() => {
          setConnectedServices((prev) => ({
            ...prev,
            oneDrive: {
              connected: true,
              email: user?.email || "user@example.com",
              quota: { used: 1000000000, total: 5000000000 },
            },
          }));
          alert("✅ تم الاتصال بـ OneDrive بنجاح!");
        }, 2000);
      }
    } catch (error) {
      console.error("خطأ في الاتصال بـ OneDrive:", error);
      alert(`❌ فشل الاتصال: ${error.message}`);
    }
  };

  // قطع الاتصال
  const disconnectService = async (service) => {
    const confirmed = window.confirm(`هل تريد قطع الاتصال مع ${service}؟`);

    if (confirmed) {
      try {
        if (window.electronAPI) {
          await window.electronAPI.disconnectCloudService(service);
        }

        setConnectedServices((prev) => ({
          ...prev,
          [service]: { connected: false, email: null, quota: null },
        }));

        alert(`✅ تم ��طع الاتصال مع ${service}`);
      } catch (error) {
        alert(`❌ فشل في قطع الاتصال: ${error.message}`);
      }
    }
  };

  // تحميل ملفات السحابة
  const loadCloudFiles = async (service) => {
    try {
      if (window.electronAPI) {
        const files = await window.electronAPI.getCloudFiles(service);
        setCloudFiles(files);
      } else {
        // محاكاة ملفات السحابة
        const mockCloudFiles = [
          {
            id: "1",
            name: "مستندات_العمل",
            type: "folder",
            size: 0,
            modified: Date.now() - 86400000,
            service: service,
            synced: true,
          },
          {
            id: "2",
            name: "تقرير_شهري.pdf",
            type: "file",
            size: 2500000,
            modified: Date.now() - 3600000,
            service: service,
            synced: false,
          },
        ];
        setCloudFiles(mockCloudFiles);
      }
    } catch (error) {
      console.error(`خطأ في تحميل ملفات ${service}:`, error);
    }
  };

  // بدء المزامنة
  const startSync = async (service, direction = "bidirectional") => {
    try {
      setSyncStatus((prev) => ({
        ...prev,
        isActive: true,
        progress: 0,
        direction: direction,
      }));

      if (window.electronAPI) {
        const result = await window.electronAPI.startCloudSync({
          service: service,
          direction: direction,
          settings: syncSettings,
        });

        // مراقبة تقدم المزامنة
        window.electronAPI.onSyncProgress((progress) => {
          setSyncStatus((prev) => ({
            ...prev,
            progress: progress.percentage,
            filesInQueue: progress.remaining,
          }));
        });

        if (result.success) {
          setSyncStatus((prev) => ({
            ...prev,
            isActive: false,
            lastSync: Date.now(),
            progress: 100,
          }));
          alert(`✅ تمت المزامنة مع ${service} بنجاح!`);
          loadSyncLogs();
        }
      } else {
        // محاكاة المزامنة
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          setSyncStatus((prev) => ({ ...prev, progress: i }));
        }

        setSyncStatus((prev) => ({
          ...prev,
          isActive: false,
          lastSync: Date.now(),
          progress: 100,
        }));

        alert(`✅ تمت المزامنة مع ${service} بنجاح!`);
      }
    } catch (error) {
      setSyncStatus((prev) => ({ ...prev, isActive: false }));
      alert(`❌ فشلت المزامنة: ${error.message}`);
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

  // حساب نسبة استخدام المساحة
  const getQuotaPercentage = (quota) => {
    if (!quota || quota.total === 0) return 0;
    return Math.round((quota.used / quota.total) * 100);
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
                ☁️ المزامنة السحابية
              </h1>
              <p className="text-gray-300 text-lg">
                مزامنة آمنة وذكية مع خدمات التخزين السحابي
              </p>
            </div>

            {syncStatus.isActive && (
              <div className="glass-button p-4 rounded-xl">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400 mb-1">
                    {syncStatus.progress}%
                  </div>
                  <div className="text-sm text-gray-400">جاري المزامنة</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* الخدمات السحابية */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-6">
                🌐 الخدمات ال��حابية
              </h2>

              <div className="space-y-6">
                {/* Google Drive */}
                <div className="glass-button p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">🟥</div>
                      <div>
                        <h3 className="text-xl font-semibold">Google Drive</h3>
                        {connectedServices.googleDrive.connected ? (
                          <div className="text-sm text-green-400">
                            متصل: {connectedServices.googleDrive.email}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">غير متصل</div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {connectedServices.googleDrive.connected ? (
                        <>
                          <button
                            onClick={() => startSync("googleDrive")}
                            disabled={syncStatus.isActive}
                            className="primary-button px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                          >
                            🔄 مزامنة
                          </button>
                          <button
                            onClick={() => disconnectService("googleDrive")}
                            className="glass-button px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/20"
                          >
                            قطع الاتصال
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={connectGoogleDrive}
                          className="primary-button px-4 py-2 rounded-lg text-sm"
                        >
                          🔗 اتصال
                        </button>
                      )}
                    </div>
                  </div>

                  {connectedServices.googleDrive.connected &&
                    connectedServices.googleDrive.quota && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>المساحة المستخدمة</span>
                          <span>
                            {formatFileSize(
                              connectedServices.googleDrive.quota.used,
                            )}{" "}
                            /{" "}
                            {formatFileSize(
                              connectedServices.googleDrive.quota.total,
                            )}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                            style={{
                              width: `${getQuotaPercentage(connectedServices.googleDrive.quota)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                </div>

                {/* OneDrive */}
                <div className="glass-button p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">🟦</div>
                      <div>
                        <h3 className="text-xl font-semibold">OneDrive</h3>
                        {connectedServices.oneDrive.connected ? (
                          <div className="text-sm text-green-400">
                            متصل: {connectedServices.oneDrive.email}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">غير متصل</div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {connectedServices.oneDrive.connected ? (
                        <>
                          <button
                            onClick={() => startSync("oneDrive")}
                            disabled={syncStatus.isActive}
                            className="primary-button px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                          >
                            🔄 مزامنة
                          </button>
                          <button
                            onClick={() => disconnectService("oneDrive")}
                            className="glass-button px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/20"
                          >
                            قطع الاتصال
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={connectOneDrive}
                          className="primary-button px-4 py-2 rounded-lg text-sm"
                        >
                          🔗 اتصال
                        </button>
                      )}
                    </div>
                  </div>

                  {connectedServices.oneDrive.connected &&
                    connectedServices.oneDrive.quota && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>المساحة المستخدمة</span>
                          <span>
                            {formatFileSize(
                              connectedServices.oneDrive.quota.used,
                            )}{" "}
                            /{" "}
                            {formatFileSize(
                              connectedServices.oneDrive.quota.total,
                            )}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{
                              width: `${getQuotaPercentage(connectedServices.oneDrive.quota)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* إعدادات المزامنة */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">
                ⚙️ إعدادات المزامنة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={syncSettings.autoSync}
                      onChange={(e) =>
                        setSyncSettings((prev) => ({
                          ...prev,
                          autoSync: e.target.checked,
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <span>مزامنة تلقائية</span>
                  </label>

                  <label className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={syncSettings.encryptBeforeUpload}
                      onChange={(e) =>
                        setSyncSettings((prev) => ({
                          ...prev,
                          encryptBeforeUpload: e.target.checked,
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <span>تشفير قبل الرفع</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm mb-2">اتجاه المزامنة</label>
                  <select
                    value={syncSettings.direction || "bidirectional"}
                    onChange={(e) =>
                      setSyncSettings((prev) => ({
                        ...prev,
                        direction: e.target.value,
                      }))
                    }
                    className="w-full glass-button p-2 rounded-lg text-sm"
                  >
                    <option value="bidirectional">في الاتجاهين</option>
                    <option value="upload">رفع فقط</option>
                    <option value="download">تنزيل فقط</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* معلومات المزامنة */}
          <div>
            <div className="glass-card rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">📊 حالة المزامنة</h3>

              <div className="space-y-4">
                <div className="glass-button p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">آخر مزامنة</div>
                  <div className="font-medium">
                    {syncStatus.lastSync
                      ? formatDate(syncStatus.lastSync)
                      : "لم تتم بعد"}
                  </div>
                </div>

                <div className="glass-button p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">
                    الملفات في الطابور
                  </div>
                  <div className="font-medium">
                    {syncStatus.filesInQueue} ملف
                  </div>
                </div>

                <div className="glass-button p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">
                    الحجم الإجمالي
                  </div>
                  <div className="font-medium">
                    {formatFileSize(syncStatus.totalSize)}
                  </div>
                </div>
              </div>

              {syncStatus.isActive && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>التقدم</span>
                    <span>{syncStatus.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                      style={{ width: `${syncStatus.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* سجل المزامنة */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">📜 سجل العمليات</h3>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {syncLogs.map((log) => (
                  <div key={log.id} className="glass-button p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm ${
                          log.status === "success"
                            ? "text-green-400"
                            : log.status === "warning"
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {log.status === "success"
                          ? "✅"
                          : log.status === "warning"
                            ? "⚠️"
                            : "❌"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm">{log.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudSync;
