import React, { useState, useEffect } from "react";

/**
 * KNOUX FINDR Professional Dashboard
 * Complete Enterprise-Grade File Management System
 * Full English Language Support with Advanced Analytics
 */

const ProfessionalDashboard = ({ user, onLogout }) => {
  const [activeModule, setActiveModule] = useState("overview");
  const [searchStats, setSearchStats] = useState({
    totalSearches: 2847293,
    successRate: 98.7,
    avgResponseTime: 0.23,
    totalFiles: 15847293,
    indexedFiles: 15623847,
    categorizedFiles: 14983472,
    duplicatesFound: 284729,
    spaceRecovered: 1247293847,
    lastIndexed: new Date(),
    systemHealth: 99.2,
  });

  const [realtimeMetrics, setRealtimeMetrics] = useState({
    activeUsers: 247,
    currentSearches: 15,
    systemLoad: 23.8,
    memoryUsage: 67.4,
    diskUsage: 45.2,
    networkThroughput: 125.6,
  });

  const [databaseMetrics, setDatabaseMetrics] = useState({
    totalRecords: 15847293,
    indexSize: 2847293,
    queryPerformance: 0.15,
    cacheHitRate: 94.6,
    connectionPool: 85,
    transactionsPerSecond: 2847,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeMetrics((prev) => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
        currentSearches: Math.max(
          0,
          prev.currentSearches + Math.floor(Math.random() * 6 - 3),
        ),
        systemLoad: Math.max(
          0,
          Math.min(100, prev.systemLoad + Math.random() * 4 - 2),
        ),
        memoryUsage: Math.max(
          0,
          Math.min(100, prev.memoryUsage + Math.random() * 2 - 1),
        ),
        networkThroughput: Math.max(
          0,
          prev.networkThroughput + Math.random() * 20 - 10,
        ),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const modules = [
    { id: "overview", label: "System Overview", icon: "📊", color: "blue" },
    {
      id: "analytics",
      label: "Advanced Analytics",
      icon: "📈",
      color: "green",
    },
    {
      id: "database",
      label: "Database Management",
      icon: "🗄️",
      color: "purple",
    },
    { id: "search", label: "Search Intelligence", icon: "🔍", color: "indigo" },
    { id: "files", label: "File Operations", icon: "📁", color: "orange" },
    { id: "ai", label: "AI Processing", icon: "🤖", color: "cyan" },
    { id: "security", label: "Security Center", icon: "🔒", color: "red" },
    {
      id: "reports",
      label: "Enterprise Reports",
      icon: "📋",
      color: "emerald",
    },
    { id: "settings", label: "System Settings", icon: "⚙️", color: "gray" },
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const SystemOverview = () => (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Files Indexed",
            value: formatNumber(searchStats.totalFiles),
            icon: "📁",
            color: "blue",
            change: "+12.5%",
          },
          {
            label: "Search Success Rate",
            value: `${searchStats.successRate}%`,
            icon: "✅",
            color: "green",
            change: "+0.3%",
          },
          {
            label: "Avg Response Time",
            value: `${searchStats.avgResponseTime}s`,
            icon: "⚡",
            color: "yellow",
            change: "-15ms",
          },
          {
            label: "Space Recovered",
            value: formatBytes(searchStats.spaceRecovered),
            icon: "💾",
            color: "purple",
            change: "+2.1GB",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="glass-card rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`text-3xl bg-${stat.color}-500/20 p-3 rounded-lg`}
              >
                {stat.icon}
              </div>
              <div
                className={`text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full`}
              >
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {stat.value}
            </div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            Real-time System Metrics
          </h3>
          <div className="space-y-4">
            {[
              {
                label: "Active Users",
                value: realtimeMetrics.activeUsers,
                icon: "👥",
                color: "blue",
              },
              {
                label: "Current Searches",
                value: realtimeMetrics.currentSearches,
                icon: "🔍",
                color: "green",
              },
              {
                label: "System Load",
                value: `${realtimeMetrics.systemLoad.toFixed(1)}%`,
                icon: "📊",
                color: "orange",
              },
              {
                label: "Memory Usage",
                value: `${realtimeMetrics.memoryUsage.toFixed(1)}%`,
                icon: "🧠",
                color: "purple",
              },
            ].map((metric, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{metric.icon}</span>
                  <span className="text-gray-300">{metric.label}</span>
                </div>
                <div className={`text-${metric.color}-400 font-bold`}>
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-2xl">🗄️</span>
            Database Performance
          </h3>
          <div className="space-y-4">
            {[
              {
                label: "Total Records",
                value: formatNumber(databaseMetrics.totalRecords),
                icon: "📋",
                color: "indigo",
              },
              {
                label: "Query Performance",
                value: `${databaseMetrics.queryPerformance}s`,
                icon: "⚡",
                color: "yellow",
              },
              {
                label: "Cache Hit Rate",
                value: `${databaseMetrics.cacheHitRate}%`,
                icon: "🎯",
                color: "green",
              },
              {
                label: "Transactions/sec",
                value: formatNumber(databaseMetrics.transactionsPerSecond),
                icon: "🔄",
                color: "cyan",
              },
            ].map((metric, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{metric.icon}</span>
                  <span className="text-gray-300">{metric.label}</span>
                </div>
                <div className={`text-${metric.color}-400 font-bold`}>
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-2xl">❤️</span>
          System Health Dashboard
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "CPU Usage",
              value: realtimeMetrics.systemLoad,
              max: 100,
              color: "blue",
            },
            {
              name: "Memory Usage",
              value: realtimeMetrics.memoryUsage,
              max: 100,
              color: "green",
            },
            {
              name: "Disk Usage",
              value: realtimeMetrics.diskUsage,
              max: 100,
              color: "orange",
            },
          ].map((health, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-gray-400 mb-2">{health.name}</div>
              <div className="relative w-24 h-24 mx-auto mb-2">
                <svg
                  className="w-24 h-24 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={`rgb(var(--color-${health.color}-500))`}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - health.value / health.max)}`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {health.value.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AdvancedAnalytics = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-3xl">📈</span>
          Advanced Search Analytics & Intelligence
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">
              Search Performance Metrics
            </h4>
            {[
              {
                metric: "Query Complexity Score",
                value: "8.7/10",
                desc: "Average complexity of user queries",
              },
              {
                metric: "AI Accuracy Rate",
                value: "96.4%",
                desc: "AI-powered search result accuracy",
              },
              {
                metric: "Multi-language Support",
                value: "47 Languages",
                desc: "Supported file content languages",
              },
              {
                metric: "Semantic Understanding",
                value: "94.2%",
                desc: "Context comprehension rate",
              },
            ].map((item, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{item.metric}</span>
                  <span className="text-blue-400 font-bold">{item.value}</span>
                </div>
                <div className="text-xs text-gray-400">{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-400">
              File Classification Intelligence
            </h4>
            {[
              {
                type: "Documents",
                count: "5.2M",
                accuracy: "99.1%",
                color: "blue",
              },
              {
                type: "Images",
                count: "3.8M",
                accuracy: "97.8%",
                color: "green",
              },
              {
                type: "Videos",
                count: "1.4M",
                accuracy: "95.6%",
                color: "purple",
              },
              {
                type: "Audio",
                count: "847K",
                accuracy: "93.2%",
                color: "orange",
              },
              {
                type: "Code Files",
                count: "2.1M",
                accuracy: "98.7%",
                color: "cyan",
              },
              {
                type: "Archives",
                count: "624K",
                accuracy: "96.4%",
                color: "red",
              },
            ].map((item, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 bg-${item.color}-500 rounded-full`}
                    ></div>
                    <span className="text-white">{item.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{item.count}</div>
                    <div className="text-xs text-gray-400">
                      {item.accuracy} accuracy
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const DatabaseManagement = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-3xl">🗄️</span>
          Enterprise Database Management System
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-lg font-semibold text-purple-400">
              Database Performance Dashboard
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total Tables", value: "247", icon: "📋" },
                { label: "Total Indexes", value: "1,847", icon: "🔍" },
                { label: "Stored Procedures", value: "324", icon: "⚙️" },
                { label: "Views", value: "156", icon: "👁️" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-lg p-4 text-center"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-xl font-bold text-white">
                    {item.value}
                  </div>
                  <div className="text-xs text-gray-400">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h5 className="text-md font-semibold text-white">
                Real-time Query Analytics
              </h5>
              {[
                {
                  query: "File content search",
                  executions: "2.4M/day",
                  avgTime: "0.15s",
                  status: "optimal",
                },
                {
                  query: "Duplicate detection",
                  executions: "847K/day",
                  avgTime: "0.89s",
                  status: "good",
                },
                {
                  query: "Metadata indexing",
                  executions: "5.2M/day",
                  avgTime: "0.03s",
                  status: "excellent",
                },
                {
                  query: "AI classification",
                  executions: "1.8M/day",
                  avgTime: "1.24s",
                  status: "good",
                },
              ].map((query, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">
                        {query.query}
                      </div>
                      <div className="text-xs text-gray-400">
                        {query.executions} • {query.avgTime} avg
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        query.status === "excellent"
                          ? "bg-green-500/20 text-green-400"
                          : query.status === "optimal"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {query.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-cyan-400">
              Storage Analytics
            </h4>

            {[
              {
                name: "Primary Database",
                size: "2.8 TB",
                usage: 78,
                growth: "+12GB/day",
              },
              {
                name: "Index Storage",
                size: "847 GB",
                usage: 65,
                growth: "+3.2GB/day",
              },
              {
                name: "Backup Storage",
                size: "5.6 TB",
                usage: 45,
                growth: "+18GB/day",
              },
              {
                name: "Cache Storage",
                size: "124 GB",
                usage: 82,
                growth: "+1.1GB/day",
              },
            ].map((storage, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{storage.name}</span>
                  <span className="text-cyan-400 font-bold">
                    {storage.size}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${storage.usage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{storage.usage}% used</span>
                  <span>{storage.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveModule = () => {
    switch (activeModule) {
      case "overview":
        return <SystemOverview />;
      case "analytics":
        return <AdvancedAnalytics />;
      case "database":
        return <DatabaseManagement />;
      default:
        return (
          <div className="glass-card rounded-xl p-12 border border-white/10 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Module Under Development
            </h3>
            <p className="text-gray-400">
              This advanced module is currently being developed for the
              enterprise version.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta text-white">
      {/* Header */}
      <header className="glass-card border-b-2 border-white/10 p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold gradient-text">KNOUX FINDR</h1>
            <span className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
              Enterprise Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Welcome,{" "}
              <span className="text-blue-400 font-semibold">
                {user?.name || "Administrator"}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="glass-button px-4 py-2 rounded-lg text-sm hover:scale-105 transition-transform"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex px-4 pb-4 gap-6">
        {/* Sidebar */}
        <aside className="w-80 space-y-2">
          <div className="glass-card rounded-xl p-4 border border-white/10 mb-4">
            <h3 className="text-lg font-bold text-white mb-3">
              System Modules
            </h3>
            <div className="space-y-1">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                    activeModule === module.id
                      ? `bg-${module.color}-500/20 text-${module.color}-400 border border-${module.color}-500/30`
                      : "hover:bg-white/5 text-gray-300"
                  }`}
                >
                  <span className="text-xl">{module.icon}</span>
                  <span className="font-medium">{module.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass-card rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">System Health</span>
                <span className="text-green-400 font-bold">
                  {searchStats.systemHealth}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Active Users</span>
                <span className="text-blue-400 font-bold">
                  {realtimeMetrics.activeUsers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Queries/sec</span>
                <span className="text-purple-400 font-bold">
                  {Math.floor(databaseMetrics.transactionsPerSecond / 60)}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{renderActiveModule()}</main>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
