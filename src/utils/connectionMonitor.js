/**
 * Connection Monitor
 * Periodically checks server availability and manages offline mode
 */

import { checkAuthServerHealth } from "../config/api";
import { getOfflineStatus } from "./fetchInterceptor";

class ConnectionMonitor {
  constructor() {
    this.isMonitoring = false;
    this.checkInterval = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.checkIntervalMs = 30000; // 30 seconds
    this.listeners = new Set();
  }

  /**
   * Start monitoring connection
   */
  startMonitoring() {
    if (this.isMonitoring) {
      return;
    }

    console.log("🔍 Starting connection monitoring...");
    this.isMonitoring = true;
    this.scheduleNextCheck();
  }

  /**
   * Stop monitoring connection
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    console.log("🛑 Stopping connection monitoring");
    this.isMonitoring = false;

    if (this.checkInterval) {
      clearTimeout(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Schedule next health check
   */
  scheduleNextCheck() {
    if (!this.isMonitoring) {
      return;
    }

    this.checkInterval = setTimeout(async () => {
      await this.performHealthCheck();
      this.scheduleNextCheck();
    }, this.checkIntervalMs);
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    try {
      const isHealthy = await checkAuthServerHealth();
      const offlineStatus = getOfflineStatus();

      if (isHealthy && offlineStatus.isOfflineMode) {
        // Server is back online
        this.retryCount = 0;
        this.notifyListeners("server-online", {
          message: "تم استعادة الاتصال بالخادم",
          wasOffline: true,
        });
      } else if (!isHealthy && !offlineStatus.isOfflineMode) {
        // Server went offline
        this.retryCount++;

        if (this.retryCount >= this.maxRetries) {
          this.notifyListeners("server-offline", {
            message: "فقدان الاتصال بالخادم - تم التبديل للوضع التجريبي",
            retryCount: this.retryCount,
          });
        }
      }

      // Log current status
      console.log(
        `🔍 Health check: Server ${isHealthy ? "online" : "offline"}, App ${offlineStatus.isOfflineMode ? "offline" : "online"} mode`,
      );
    } catch (error) {
      console.warn("Health check failed:", error.message);
    }
  }

  /**
   * Add event listener
   */
  addEventListener(event, callback) {
    this.listeners.add({ event, callback });
  }

  /**
   * Remove event listener
   */
  removeEventListener(event, callback) {
    this.listeners.forEach((listener) => {
      if (listener.event === event && listener.callback === callback) {
        this.listeners.delete(listener);
      }
    });
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach((listener) => {
      if (listener.event === event) {
        try {
          listener.callback(data);
        } catch (error) {
          console.error("Error in connection monitor listener:", error);
        }
      }
    });
  }

  /**
   * Force a health check now
   */
  async checkNow() {
    await this.performHealthCheck();
  }

  /**
   * Reset retry count
   */
  resetRetryCount() {
    this.retryCount = 0;
  }
}

// Create singleton instance
const connectionMonitor = new ConnectionMonitor();

export default connectionMonitor;

export const {
  startMonitoring,
  stopMonitoring,
  addEventListener,
  removeEventListener,
  checkNow,
  resetRetryCount,
} = connectionMonitor;
