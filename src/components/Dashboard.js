import React, { useState, useEffect } from "react";

const Dashboard = ({ user, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentView, setCurrentView] = useState("search");

  // Mock file data for demonstration
  const mockFiles = [
    {
      id: 1,
      name: "project-proposal.pdf",
      type: "PDF",
      size: "2.4 MB",
      modified: "2 hours ago",
      path: "/Documents/Projects/",
      content: "project proposal marketing strategy business plan",
    },
    {
      id: 2,
      name: "vacation-photos.jpg",
      type: "Image",
      size: "1.8 MB",
      modified: "1 day ago",
      path: "/Pictures/Vacation/",
      content: "beach sunset vacation family photos",
    },
    {
      id: 3,
      name: "meeting-notes.txt",
      type: "Text",
      size: "45 KB",
      modified: "3 hours ago",
      path: "/Documents/Notes/",
      content: "meeting notes quarterly review team discussion action items",
    },
    {
      id: 4,
      name: "invoice-2024.xlsx",
      type: "Spreadsheet",
      size: "892 KB",
      modified: "1 week ago",
      path: "/Documents/Finance/",
      content: "invoice billing accounting financial records",
    },
    {
      id: 5,
      name: "app-mockup.figma",
      type: "Design",
      size: "3.2 MB",
      modified: "5 days ago",
      path: "/Design/Projects/",
      content: "app design mockup user interface wireframe",
    },
  ];

  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    setTimeout(() => {
      const results = mockFiles.filter(
        (file) =>
          file.name.toLowerCase().includes(query.toLowerCase()) ||
          file.content.toLowerCase().includes(query.toLowerCase()) ||
          file.type.toLowerCase().includes(query.toLowerCase()),
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery]);

  const getFileIcon = (type) => {
    const icons = {
      PDF: "📄",
      Image: "🖼️",
      Text: "📝",
      Spreadsheet: "📊",
      Design: "🎨",
      Video: "🎥",
      Audio: "🎵",
      Code: "💻",
    };
    return icons[type] || "📁";
  };

  const filterFiles = (files) => {
    if (activeFilter === "all") return files;
    return files.filter(
      (file) => file.type.toLowerCase() === activeFilter.toLowerCase(),
    );
  };

  const displayedFiles = searchQuery
    ? filterFiles(searchResults)
    : filterFiles(mockFiles.slice(0, 8));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta relative overflow-hidden">
      {/* Background Elements */}
      <div
        className="floating-orb w-96 h-96 top-20 -right-20"
        style={{ animationDelay: "0s" }}
      ></div>
      <div
        className="floating-orb w-64 h-64 bottom-40 -left-10"
        style={{ animationDelay: "3s" }}
      ></div>

      {/* Enhanced Header */}
      <header className="glass-card border-b-2 border-white/10 p-6 fade-in relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#0075FF]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#0075FF]/5 to-transparent rounded-full blur-2xl"></div>

        <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className="text-[24px] font-bold gradient-text relative">
              KNOUX FINDR
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#0075FF] to-transparent"></div>
            </div>
            <div className="text-[12px] text-[#A0AEC0] bg-[#0075FF]/20 px-3 py-1 rounded-full pulse-glow">
              🚀 Local Search Engine
            </div>
            <div className="text-[10px] text-green-400 bg-green-500/20 px-2 py-1 rounded-full flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              ONLINE
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="glass-button px-3 py-1 rounded-lg">
              <span className="text-[#A0AEC0] text-[12px]">Welcome, </span>
              <span className="text-white text-[14px] font-semibold">
                {user?.name || "User"}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="glass-button px-4 py-2 rounded-lg text-white text-[12px] font-bold hover:bg-red-500/20 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              <span className="relative z-10">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 flex gap-6">
        {/* Enhanced Sidebar */}
        <aside className="w-64 space-y-6 fade-in">
          {/* Navigation */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-[#0075FF]/10 to-transparent rounded-full blur-xl"></div>
            <h3 className="text-white text-[16px] font-bold mb-4 relative z-10">
              🧭 Navigation
            </h3>
            <div className="space-y-2 relative z-10">
                            {[
                { id: "search", name: "Search Files", icon: "🔍" },
                { id: "timeline", name: "Timeline", icon: "📅" },
                { id: "stats", name: "Statistics", icon: "📊" },
                { id: "natural", name: "Smart Search", icon: "🧠" },
                { id: "powerops", name: "PowerOps", icon: "⚡" },
                { id: "settings", name: "Settings", icon: "⚙️" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-[14px] transition-all group relative overflow-hidden ${
                    currentView === item.id
                      ? "primary-button text-white pulse-glow"
                      : "glass-button text-[#A0AEC0] hover:text-white"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="text-[16px] group-hover:scale-110 transition-transform relative z-10">
                    {item.icon}
                  </span>
                  <span className="relative z-10">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced File Type Filters */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-[#0075FF]/5 to-transparent rounded-full blur-lg"></div>
            <h3 className="text-white text-[16px] font-bold mb-4 relative z-10">
              📂 File Types
            </h3>
            <div className="space-y-2 relative z-10">
              {[
                {
                  id: "all",
                  name: "All Files",
                  count: mockFiles.length,
                  icon: "📁",
                },
                { id: "pdf", name: "Documents", count: 2, icon: "📄" },
                { id: "image", name: "Images", count: 1, icon: "🖼️" },
                { id: "text", name: "Text Files", count: 1, icon: "📝" },
                { id: "design", name: "Design Files", count: 1, icon: "🎨" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-[12px] transition-all group ${
                    activeFilter === filter.id
                      ? "primary-button text-white"
                      : "text-[#A0AEC0] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="group-hover:scale-110 transition-transform">
                      {filter.icon}
                    </span>
                    <span>{filter.name}</span>
                  </div>
                  <span className="bg-white/10 px-2 py-1 rounded-full">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-1/2 left-0 w-8 h-8 bg-gradient-to-r from-[#0075FF]/10 to-transparent rounded-full blur-lg"></div>
            <h3 className="text-white text-[16px] font-bold mb-4 relative z-10">
              ⚡ Quick Actions
            </h3>
            <div className="space-y-2 relative z-10">
              <button className="w-full glass-button p-3 rounded-lg text-[12px] text-[#A0AEC0] hover:text-white transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative z-10">🗂️ Organize Files</span>
              </button>
              <button className="w-full glass-button p-3 rounded-lg text-[12px] text-[#A0AEC0] hover:text-white transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative z-10">🧹 Clean Duplicates</span>
              </button>
              <button className="w-full glass-button p-3 rounded-lg text-[12px] text-[#A0AEC0] hover:text-white transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative z-10">🔒 Secure Files</span>
              </button>
            </div>
          </div>
        </aside>

                {/* Enhanced Main Content */}
        <main className="flex-1 space-y-6">
          {currentView === "search" && (
          <>
          {/* Enhanced Search Bar */}
          <div className="glass-card rounded-2xl p-6 fade-in relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, rgba(0,117,255,0.3) 1px, transparent 0)",
                  backgroundSize: "30px 30px",
                }}
              ></div>
            </div>

            <div className="relative z-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0075FF]/20 via-transparent to-[#0075FF]/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search for files, content, or keywords..."
                  className="w-full h-[60px] px-6 pr-16 rounded-2xl glass-card text-white placeholder-[#A0AEC0] text-[16px] focus:outline-none focus:border-[#0075FF] focus:shadow-lg focus:shadow-[#0075FF]/20 transition-all duration-300 relative z-10"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
                  {isSearching ? (
                    <div className="loading-spinner" />
                  ) : (
                    <svg
                      className="w-[24px] h-[24px] text-[#A0AEC0] group-hover:text-[#0075FF] transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {searchQuery && (
                <div className="mt-4 flex items-center justify-between fade-in">
                  <div className="text-[#A0AEC0] text-[14px]">
                    Found{" "}
                    <span className="text-[#0075FF] font-semibold">
                      {displayedFiles.length}
                    </span>{" "}
                    result{displayedFiles.length !== 1 ? "s" : ""} for "
                    {searchQuery}"
                  </div>
                  <div className="flex gap-2">
                    <div className="text-[10px] text-[#A0AEC0] bg-white/5 px-2 py-1 rounded-full">
                      ⚡ Instant
                    </div>
                    <div className="text-[10px] text-[#A0AEC0] bg-white/5 px-2 py-1 rounded-full">
                      🎯 Accurate
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Results */}
          <div className="glass-card rounded-2xl p-6 fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#0075FF]/5 to-transparent rounded-full blur-2xl"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-white text-[20px] font-bold flex items-center gap-2">
                {searchQuery ? "🔍 Search Results" : "📁 Recent Files"}
              </h2>
              <div className="flex gap-2">
                <button className="glass-button p-2 rounded-lg group">
                  <svg
                    className="w-[20px] h-[20px] text-white group-hover:text-[#0075FF] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
                <button className="glass-button p-2 rounded-lg group">
                  <svg
                    className="w-[20px] h-[20px] text-white group-hover:text-[#0075FF] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {displayedFiles.length === 0 ? (
              <div className="text-center py-12 relative z-10">
                <div className="text-[48px] mb-4">🔍</div>
                <div className="text-[#A0AEC0] text-[16px]">
                  {searchQuery
                    ? "No files found matching your search"
                    : "No files to display"}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10">
                {displayedFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className="glass-button rounded-xl p-4 cursor-pointer group hover:scale-105 transition-all duration-300 relative overflow-hidden fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0075FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-[32px] group-hover:scale-110 transition-transform duration-300">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="text-[10px] text-[#A0AEC0] bg-white/10 px-2 py-1 rounded-full group-hover:bg-[#0075FF]/20 group-hover:text-white transition-all">
                          {file.type}
                        </div>
                      </div>

                      <div className="text-white text-[14px] font-semibold mb-2 truncate group-hover:text-[#0075FF] transition-colors">
                        {file.name}
                      </div>

                      <div className="text-[#A0AEC0] text-[12px] mb-2 truncate group-hover:text-white/80 transition-colors">
                        📁 {file.path}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-[#A0AEC0] group-hover:text-white/70 transition-colors">
                        <span className="flex items-center gap-1">
                          💾 {file.size}
                        </span>
                        <span className="flex items-center gap-1">
                          🕒 {file.modified}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#0075FF] to-[#00A6FF] rounded-full transition-all duration-1000 group-hover:w-full"
                          style={{ width: `${Math.random() * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in">
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <div className="text-[#A0AEC0] text-[12px] mb-1">
                    Total Files
                  </div>
                  <div className="text-white text-[24px] font-bold group-hover:text-[#0075FF] transition-colors">
                    2,847
                  </div>
                  <div className="text-[10px] text-green-400">
                    +12% this week
                  </div>
                </div>
                <div className="text-[32px] group-hover:scale-110 transition-transform">
                  📁
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <div className="text-[#A0AEC0] text-[12px] mb-1">
                    Storage Used
                  </div>
                  <div className="text-white text-[24px] font-bold group-hover:text-[#0075FF] transition-colors">
                    156 GB
                  </div>
                  <div className="text-[10px] text-orange-400">
                    78% capacity
                  </div>
                </div>
                <div className="text-[32px] group-hover:scale-110 transition-transform">
                  💾
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <div className="text-[#A0AEC0] text-[12px] mb-1">
                    Last Scan
                  </div>
                  <div className="text-white text-[24px] font-bold group-hover:text-[#0075FF] transition-colors">
                    2 min ago
                  </div>
                  <div className="text-[10px] text-green-400">
                    System healthy
                  </div>
                </div>
                <div className="text-[32px] group-hover:scale-110 transition-transform">
                  ⚡
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;