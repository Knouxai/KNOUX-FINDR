import React, { useState, useEffect } from "react";

/**
 * Professional Notification System for KNOUX FINDR
 * Supports various notification types with animations and auto-dismiss
 */

const NotificationSystem = ({ notifications, onDismiss }) => {
  const getNotificationIcon = (type) => {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
      loading: "🔄",
    };
    return icons[type] || icons.info;
  };

  const getNotificationStyles = (type) => {
    const styles = {
      success: "bg-green-500/20 border-green-500/30 text-green-400",
      error: "bg-red-500/20 border-red-500/30 text-red-400",
      warning: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
      info: "bg-blue-500/20 border-blue-500/30 text-blue-400",
      loading: "bg-purple-500/20 border-purple-500/30 text-purple-400",
    };
    return styles[type] || styles.info;
  };

  return (
    <div className="fixed top-6 right-6 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg border transition-all duration-300 transform hover:scale-105 ${getNotificationStyles(notification.type)} glass-card`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </span>
            <div className="flex-1 min-w-0">
              {notification.title && (
                <div className="font-semibold mb-1">{notification.title}</div>
              )}
              <div className="text-sm opacity-90">{notification.message}</div>
              {notification.timestamp && (
                <div className="text-xs opacity-60 mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(notification.id)}
                className="text-gray-400 hover:text-white text-sm flex-shrink-0"
              >
                ✕
              </button>
            )}
          </div>

          {/* Progress bar for auto-dismiss */}
          {notification.autoDelete && (
            <div className="mt-2 w-full bg-white/10 rounded-full h-1">
              <div
                className="bg-current h-1 rounded-full transition-all duration-100"
                style={{
                  width: `${((notification.duration - notification.remaining) / notification.duration) * 100}%`,
                }}
              ></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = "info", options = {}) => {
    const id = Date.now() + Math.random();
    const duration = options.duration || 5000;

    const notification = {
      id,
      message,
      type,
      title: options.title,
      timestamp: new Date(),
      autoDelete: options.autoDelete !== false,
      duration,
      remaining: duration,
    };

    setNotifications((prev) => [notification, ...prev.slice(0, 4)]);

    if (notification.autoDelete) {
      const interval = setInterval(() => {
        setNotifications((prev) => {
          const updated = prev.map((n) =>
            n.id === id
              ? { ...n, remaining: Math.max(0, n.remaining - 100) }
              : n,
          );

          const current = updated.find((n) => n.id === id);
          if (current && current.remaining <= 0) {
            clearInterval(interval);
            return updated.filter((n) => n.id !== id);
          }

          return updated;
        });
      }, 100);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
};

export default NotificationSystem;
