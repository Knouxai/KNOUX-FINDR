import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Store error details
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log specific network/fetch errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      console.warn("Network connectivity issue detected:", error.message);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Reload the page to retry
    window.location.reload();
  };

  handleContinueOffline = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Try to continue in offline mode
    if (this.props.onOfflineMode) {
      this.props.onOfflineMode();
    }
  };

  render() {
    if (this.state.hasError) {
      const isNetworkError =
        this.state.error?.name === "TypeError" &&
        (this.state.error.message.includes("fetch") ||
          this.state.error.message.includes("Network") ||
          this.state.error.message.includes("Failed to fetch"));

      return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a1b54] via-[#0d0e38] to-[#020515] font-jakarta flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="text-6xl mb-6">{isNetworkError ? "🌐" : "⚠️"}</div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-white mb-4">
              {isNetworkError ? "مشكلة في الاتصال" : "حدث خطأ غير متوقع"}
            </h1>

            {/* Error Message */}
            <p className="text-gray-300 mb-6 leading-relaxed">
              {isNetworkError
                ? "لا يمكن الاتصال بالخادم. تحقق من اتصال الإنترنت أو جرب الوضع التجريبي."
                : "نعتذر، حدث خطأ أثناء تشغيل التطبيق. يمكنك المحاولة مرة أخرى أو المتابعة في الوضع التجريبي."}
            </p>

            {/* Error Details (in development) */}
            {typeof process !== "undefined" &&
              process.env &&
              process.env.NODE_ENV === "development" &&
              this.state.error && (
                <details className="text-left bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                  <summary className="text-red-400 cursor-pointer mb-2 font-semibold">
                    تفاصيل الخطأ (وضع التطوير)
                  </summary>
                  <pre className="text-xs text-gray-300 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300"
              >
                🔄 إعادة المحاولة
              </button>

              {isNetworkError && (
                <button
                  onClick={this.handleContinueOffline}
                  className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-300"
                >
                  📱 متابعة في الوضع التجريبي
                </button>
              )}

              <button
                onClick={() => (window.location.href = "/")}
                className="w-full px-6 py-3 bg-transparent border border-gray-500 hover:border-gray-400 text-gray-300 hover:text-white font-medium rounded-lg transition-colors duration-300"
              >
                🏠 العودة للصفحة الرئيسية
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-8 p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-gray-400">
                إذا استمرت المشكلة، تأكد من:
              </p>
              <ul className="text-xs text-gray-500 mt-2 space-y-1">
                <li>• اتصالك بالإنترنت يعمل بشكل صحيح</li>
                <li>• تم حفظ عملك قبل إعادة التحميل</li>
                <li>• خادم المصادقة متاح ويعمل</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
