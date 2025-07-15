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
    <div className="min-h-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta">
      {/* Header */}
      <header className="glass-card border-b-2 border-white/10 p-6 fade-in">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-[24px] font-bold gradient-text">
              KNOUX FINDR
            </div>
            <div className="text-[12px] text-[#A0AEC0] bg-[#0075FF]/20 px-3 py-1 rounded-full">
              Local Search Engine
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-white text-[14px]">
              Welcome, {user?.name || "User"}
            </div>
            <button
              onClick={onLogout}
              className="glass-button px-4 py-2 rounded-lg text-white text-[12px] font-bold hover:bg-red-500/20 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 space-y-6 fade-in">
          {/* Navigation */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-white text-[16px] font-bold mb-4">
              Navigation
            </h3>
            <div className="space-y-2">
              {[
                { id: "search", name: "Search Files", icon: "🔍" },
                { id: "recent", name: "Recent Files", icon: "⏰" },
                { id: "analytics", name: "Analytics", icon: "📊" },
                { id: "settings", name: "Settings", icon: "⚙️" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-[14px] transition-all ${
                    currentView === item.id
                      ? "primary-button text-white"
                      : "glass-button text-[#A0AEC0] hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* File Type Filters */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-white text-[16px] font-bold mb-4">
              File Types
            </h3>
            <div className="space-y-2">
              {[
                { id: "all", name: "All Files", count: mockFiles.length },
                { id: "pdf", name: "Documents", count: 2 },
                { id: "image", name: "Images", count: 1 },
                { id: "text", name: "Text Files", count: 1 },
                { id: "design", name: "Design Files", count: 1 },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-[12px] transition-all ${
                    activeFilter === filter.id
                      ? "primary-button text-white"
                      : "text-[#A0AEC0] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{filter.name}</span>
                  <span className="bg-white/10 px-2 py-1 rounded-full">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-white text-[16px] font-bold mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full glass-button p-3 rounded-lg text-[12px] text-[#A0AEC0] hover:text-white transition-all">
                🗂️ Organize Files
              </button>
              <button className="w-full glass-button p-3 rounded-lg text-[12px] text-[#A0AEC0] hover:text-white transition-all">
                🧹 Clean Duplicates
              </button>
              <button className="w-full glass-button p-3 rounded-lg text-[12px] text-[#A0AEC0] hover:text-white transition-all">
                🔒 Secure Files
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          {/* Search Bar */}
          <div className="glass-card rounded-2xl p-6 fade-in">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for files, content, or keywords..."
                className="w-full h-[60px] px-6 pr-16 rounded-2xl glass-card text-white placeholder-[#A0AEC0] text-[16px] focus:outline-none focus:border-white/40 pulse-glow"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                {isSearching ? (
                  <div className="loading-spinner" />
                ) : (
                  <svg
                    className="w-[24px] h-[24px] text-[#A0AEC0]"
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
              <div className="mt-4 text-[#A0AEC0] text-[14px]">
                Found {displayedFiles.length} result
                {displayedFiles.length !== 1 ? "s" : ""} for "{searchQuery}"
              </div>
            )}
          </div>

          {/* Results */}
          <div className="glass-card rounded-2xl p-6 fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-[20px] font-bold">
                {searchQuery ? "Search Results" : "Recent Files"}
              </h2>
              <div className="flex gap-2">
                <button className="glass-button p-2 rounded-lg">
                  <svg
                    className="w-[20px] h-[20px] text-white"
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
                <button className="glass-button p-2 rounded-lg">
                  <svg
                    className="w-[20px] h-[20px] text-white"
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
              <div className="text-center py-12">
                <div className="text-[48px] mb-4">🔍</div>
                <div className="text-[#A0AEC0] text-[16px]">
                  {searchQuery
                    ? "No files found matching your search"
                    : "No files to display"}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="glass-button rounded-xl p-4 cursor-pointer group hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-[32px]">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="text-[10px] text-[#A0AEC0] bg-white/10 px-2 py-1 rounded-full">
                        {file.type}
                      </div>
                    </div>

                    <div className="text-white text-[14px] font-semibold mb-2 truncate group-hover:text-[#0075FF] transition-colors">
                      {file.name}
                    </div>

                    <div className="text-[#A0AEC0] text-[12px] mb-2 truncate">
                      {file.path}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-[#A0AEC0]">
                      <span>{file.size}</span>
                      <span>{file.modified}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[#A0AEC0] text-[12px] mb-1">
                    Total Files
                  </div>
                  <div className="text-white text-[24px] font-bold">2,847</div>
                </div>
                <div className="text-[32px]">📁</div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[#A0AEC0] text-[12px] mb-1">
                    Storage Used
                  </div>
                  <div className="text-white text-[24px] font-bold">156 GB</div>
                </div>
                <div className="text-[32px]">💾</div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[#A0AEC0] text-[12px] mb-1">
                    Last Scan
                  </div>
                  <div className="text-white text-[24px] font-bold">
                    2 min ago
                  </div>
                </div>
                <div className="text-[32px]">⚡</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
