import React, { useState, useEffect } from "react";
import { useSession } from "../context/SessionContext";

const Settings = () => {
  const { settings, updateSettings, addNotification } = useSession();
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState("general");
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingChange = (category, key, value) => {
    const newSettings = {
      ...localSettings,
      [category]: {
        ...localSettings[category],
        [key]: value,
      },
    };
    setLocalSettings(newSettings);
    setIsModified(true);
  };

  const saveSettings = () => {
    updateSettings(localSettings);
    setIsModified(false);
    addNotification("تم حفظ الإعدادات بنجاح", "success");
  };

  const resetSettings = () => {
    const defaultSettings = {
      general: {
        theme: "dark",
        language: "ar",
        autoSave: true,
        notifications: true,
        startWithSystem: false,
      },
      search: {
        aiEnabled: true,
        indexingEnabled: true,
        searchHistory: true,
        instantSearch: true,
        maxResults: 50,
      },
      organization: {
        autoOrganize: false,
        duplicateDetection: true,
        smartCategories: true,
        confirmBeforeMove: true,
      },
      privacy: {
        analyticsEnabled: false,
        errorReporting: true,
        usageStats: false,
      },
    };
    setLocalSettings(defaultSettings);
    setIsModified(true);
  };

  const tabs = [
    { id: "general", name: "عام", icon: "⚙️" },
    { id: "search", name: "البحث", icon: "🔍" },
    { id: "organization", name: "التنظيم", icon: "🗂️" },
    { id: "privacy", name: "الخصوصية", icon: "🔒" },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          🎨 المظهر والواجهة
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              السمة
            </label>
            <select
              value={localSettings.general?.theme || "dark"}
              onChange={(e) =>
                handleSettingChange("general", "theme", e.target.value)
              }
              className="w-full glass-button p-3 rounded-lg text-white"
            >
              <option value="dark">مظلم</option>
              <option value="light">فاتح</option>
              <option value="auto">تلقائي</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              اللغة
            </label>
            <select
              value={localSettings.general?.language || "ar"}
              onChange={(e) =>
                handleSettingChange("general", "language", e.target.value)
              }
              className="w-full glass-button p-3 rounded-lg text-white"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          🔔 الإشعارات والسلوك
        </h3>

        <div className="space-y-4">
          <SettingToggle
            label="الحفظ التلقائي"
            description="حفظ تغييراتك تلقائياً كل 30 ثانية"
            checked={localSettings.general?.autoSave || false}
            onChange={(checked) =>
              handleSettingChange("general", "autoSave", checked)
            }
          />

          <SettingToggle
            label="الإشعارات"
            description="عرض إشعارات للعمليات والتحديثات"
            checked={localSettings.general?.notifications || false}
            onChange={(checked) =>
              handleSettingChange("general", "notifications", checked)
            }
          />

          <SettingToggle
            label="بدء مع النظام"
            description="تشغيل التطبيق عند بدء النظام"
            checked={localSettings.general?.startWithSystem || false}
            onChange={(checked) =>
              handleSettingChange("general", "startWithSystem", checked)
            }
          />
        </div>
      </div>
    </div>
  );

  const renderSearchSettings = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          🤖 الذكاء الاصطناعي
        </h3>

        <div className="space-y-4">
          <SettingToggle
            label="تفعيل الذكاء الاصطناعي"
            description="استخدام AI لتحسين نتائج البحث والاقتراحات"
            checked={localSettings.search?.aiEnabled || false}
            onChange={(checked) =>
              handleSettingChange("search", "aiEnabled", checked)
            }
          />

          <SettingToggle
            label="البحث الفوري"
            description="عرض النتائج أثناء الكتابة"
            checked={localSettings.search?.instantSearch || false}
            onChange={(checked) =>
              handleSettingChange("search", "instantSearch", checked)
            }
          />
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          📚 الفهرسة والتاريخ
        </h3>

        <div className="space-y-4">
          <SettingToggle
            label="الفهرسة التلقائية"
            description="فهرسة الملفات الجديدة تلقائياً"
            checked={localSettings.search?.indexingEnabled || false}
            onChange={(checked) =>
              handleSettingChange("search", "indexingEnabled", checked)
            }
          />

          <SettingToggle
            label="حفظ تاريخ البحث"
            description="تخزين عمليات البحث السابقة للاقتراحات"
            checked={localSettings.search?.searchHistory || false}
            onChange={(checked) =>
              handleSettingChange("search", "searchHistory", checked)
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              عدد النتائج القصوى
            </label>
            <input
              type="number"
              min="10"
              max="500"
              value={localSettings.search?.maxResults || 50}
              onChange={(e) =>
                handleSettingChange(
                  "search",
                  "maxResults",
                  parseInt(e.target.value),
                )
              }
              className="w-full glass-button p-3 rounded-lg text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrganizationSettings = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          🗂️ التنظيم التلقائي
        </h3>

        <div className="space-y-4">
          <SettingToggle
            label="التنظيم التلقائي"
            description="تنظيم الملفات تلقائياً حسب النوع والتاريخ"
            checked={localSettings.organization?.autoOrganize || false}
            onChange={(checked) =>
              handleSettingChange("organization", "autoOrganize", checked)
            }
          />

          <SettingToggle
            label="التصنيفات الذكية"
            description="استخدام AI لتصنيف الملفات تلقائياً"
            checked={localSettings.organization?.smartCategories || false}
            onChange={(checked) =>
              handleSettingChange("organization", "smartCategories", checked)
            }
          />

          <SettingToggle
            label="تأكيد قبل النقل"
            description="طلب تأكيد قبل نقل أو إعادة تنظيم الملفات"
            checked={localSettings.organization?.confirmBeforeMove || false}
            onChange={(checked) =>
              handleSettingChange("organization", "confirmBeforeMove", checked)
            }
          />
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          🔄 كشف التكرارات
        </h3>

        <div className="space-y-4">
          <SettingToggle
            label="كشف التكرارات"
            description="البحث عن الملفات المكررة تلقائياً"
            checked={localSettings.organization?.duplicateDetection || false}
            onChange={(checked) =>
              handleSettingChange("organization", "duplicateDetection", checked)
            }
          />
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          🔒 الخصوصية والبيانات
        </h3>

        <div className="space-y-4">
          <SettingToggle
            label="إحصائيات الاستخدام"
            description="مشاركة إحصائيات الاستخدام لتحسين التطبيق"
            checked={localSettings.privacy?.usageStats || false}
            onChange={(checked) =>
              handleSettingChange("privacy", "usageStats", checked)
            }
          />

          <SettingToggle
            label="تقارير الأخطاء"
            description="إرسال تقارير الأخطاء لحل المشاكل"
            checked={localSettings.privacy?.errorReporting || false}
            onChange={(checked) =>
              handleSettingChange("privacy", "errorReporting", checked)
            }
          />

          <SettingToggle
            label="التحليلات"
            description="تفعيل التحليلات لفهم استخدام التطبيق"
            checked={localSettings.privacy?.analyticsEnabled || false}
            onChange={(checked) =>
              handleSettingChange("privacy", "analyticsEnabled", checked)
            }
          />
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          🛡️ الأمان
        </h3>

        <div className="space-y-4">
          <button className="w-full glass-button p-3 rounded-lg text-left hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">
                  مسح البيانات المحلية
                </div>
                <div className="text-sm text-gray-400">
                  حذف جميع البيانات المخزنة محلياً
                </div>
              </div>
              <span className="text-red-400">🗑️</span>
            </div>
          </button>

          <button className="w-full glass-button p-3 rounded-lg text-left hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">تصدير البيانات</div>
                <div className="text-sm text-gray-400">
                  تصدير إعداداتك وبياناتك
                </div>
              </div>
              <span className="text-blue-400">📥</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const SettingToggle = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 glass-button rounded-lg">
      <div className="flex-1">
        <div className="font-medium text-white">{label}</div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="glass-card rounded-xl p-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          ⚙️ الإعدادات
        </h1>
        <p className="text-gray-400">تخصيص تطبيق KNOUX FINDR حسب احتياجاتك</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-xl p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-right p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                    activeTab === tab.id
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {activeTab === "general" && renderGeneralSettings()}
          {activeTab === "search" && renderSearchSettings()}
          {activeTab === "organization" && renderOrganizationSettings()}
          {activeTab === "privacy" && renderPrivacySettings()}

          {/* Save/Reset Controls */}
          {isModified && (
            <div className="glass-card rounded-xl p-6">
              <div className="flex gap-4 justify-end">
                <button
                  onClick={resetSettings}
                  className="px-6 py-3 glass-button rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  إعادة تعيين
                </button>
                <button
                  onClick={saveSettings}
                  className="px-6 py-3 primary-button rounded-lg hover:scale-105 transition-transform"
                >
                  حفظ التغييرات
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
