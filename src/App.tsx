import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, Search, Download, Copy, Check, Terminal, ExternalLink, 
  BookOpen, Star, Filter, ArrowUpDown, Code, Cpu, ShieldCheck, 
  Server, Globe, Sparkles, Layers, Info, Trash2, Play
} from 'lucide-react';
import { PACKAGES_LIST, PackageMeta } from './data/packages';

export default function App() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'json-api' | 'gh-pages' | 'batch'>('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Selection and bookmarks
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  
  // Drawer / Modal state
  const [activePkg, setActivePkg] = useState<PackageMeta | null>(null);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  
  // JSON API live data state
  const [apiData, setApiData] = useState<any>(null);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState<string | null>(null);

  // Fetch live API data when json-api tab is opened
  useEffect(() => {
    if (activeTab === 'json-api' && !apiData) {
      setIsLoadingApi(true);
      fetch('/api/list-package.json')
        .then(res => res.json())
        .then(data => {
          setApiData(data);
          setIsLoadingApi(false);
        })
        .catch(err => {
          console.error('Error fetching API:', err);
          setIsLoadingApi(false);
        });
    }
  }, [activeTab]);

  // Fetch AI insights when a package is opened
  useEffect(() => {
    if (activePkg) {
      setIsLoadingAi(true);
      setAiInsights('');
      fetch('/api/ai-package-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageName: activePkg.name })
      })
        .then(res => res.json())
        .then(data => {
          setAiInsights(data.insights);
          setIsLoadingAi(false);
        })
        .catch(err => {
          console.error('AI insight error:', err);
          setAiInsights('Unable to fetch live AI insights right now.');
          setIsLoadingAi(false);
        });
    }
  }, [activePkg]);

  const categories = ['All', 'Core & Shell', 'Compilers & Runtimes', 'Libraries', 'Networking', 'Termux Tools', 'Development & CLI'];

  const filteredPackages = useMemo(() => {
    return PACKAGES_LIST.filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || pkg.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      let valA = a.name.toLowerCase();
      let valB = b.name.toLowerCase();
      if (sortBy === 'category') {
        valA = a.category.toLowerCase();
        valB = b.category.toLowerCase();
      } else if (sortBy === 'size') {
        const numA = parseFloat(a.size);
        const numB = parseFloat(b.size);
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [searchQuery, selectedCategory, sortBy, sortOrder]);

  const toggleBookmark = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(bookmarked);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setBookmarked(next);
  };

  const toggleSelectPkg = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedPackages);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelectedPackages(next);
  };

  const handleCopyCommand = (cmd: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cmd);
    setCopiedInstall(cmd);
    setTimeout(() => setCopiedInstall(null), 2000);
  };

  const downloadStaticJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      count: PACKAGES_LIST.length,
      packages: PACKAGES_LIST.map(p => p.name),
      detailedPackages: PACKAGES_LIST,
      generatedAt: new Date().toISOString()
    }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "packages.json");
    dlAnchorElem.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Bar Contract (3 Zones) */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveTab('explorer')}>
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">PkgHub</span>
            <span className="hidden sm:inline-block ml-2 text-xs text-indigo-400 font-mono">v2.5 // Termux Registry</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-800/60 p-1 rounded-lg border border-slate-700/50">
          <button 
            onClick={() => setActiveTab('explorer')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${activeTab === 'explorer' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Package Explorer
          </button>
          <button 
            onClick={() => setActiveTab('json-api')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${activeTab === 'json-api' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Static JSON API (`/api/list-package.json`)
          </button>
          <button 
            onClick={() => setActiveTab('gh-pages')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${activeTab === 'gh-pages' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            GitHub Pages Deploy
          </button>
          <button 
            onClick={() => setActiveTab('batch')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${activeTab === 'batch' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Batch Installer {selectedPackages.size > 0 && `(${selectedPackages.size})`}
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={downloadStaticJson}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-sm whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download packages.json</span>
          </button>
        </div>
      </header>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden overflow-x-auto gap-2 p-3 bg-slate-900 border-b border-slate-800">
        <button 
          onClick={() => setActiveTab('explorer')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${activeTab === 'explorer' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-800'}`}
        >
          Explorer
        </button>
        <button 
          onClick={() => setActiveTab('json-api')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${activeTab === 'json-api' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-800'}`}
        >
          JSON API
        </button>
        <button 
          onClick={() => setActiveTab('gh-pages')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${activeTab === 'gh-pages' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-800'}`}
        >
          GH Pages
        </button>
        <button 
          onClick={() => setActiveTab('batch')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${activeTab === 'batch' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-800'}`}
        >
          Batch ({selectedPackages.size})
        </button>
      </div>

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* TAB 1: EXPLORER */}
        {activeTab === 'explorer' && (
          <div className="space-y-8">
            
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Termux & Linux Package Registry Hub</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-wrap balance">
                  Explore {PACKAGES_LIST.length} Curated Termux Packages
                </h1>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                  Search, inspect dependencies, generate batch installation scripts, and export clean static JSON for GitHub Pages or offline deployment with zero server setup required.
                </p>
                
                {/* Stats Bar */}
                <div className="flex flex-wrap gap-6 pt-2 text-xs text-slate-400 font-mono tabular-nums">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{PACKAGES_LIST.length}</span> Total Packages
                  </div>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{categories.length - 1}</span> Categories
                  </div>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">100%</span> Static & Express Compatible
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Bar: Search, Category Filter, Sort */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search packages by name or description (e.g., git, python, clang)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-400">Sort by:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="name" className="bg-slate-900">Name</option>
                    <option value="category" className="bg-slate-900">Category</option>
                    <option value="size" className="bg-slate-900">Size</option>
                  </select>
                  <button 
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="text-slate-400 hover:text-white px-1 font-mono"
                  >
                    {sortOrder === 'asc' ? 'ASC' : 'DESC'}
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Pills (Interactive Buttons) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Package Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPackages.map(pkg => {
                const isBookmarked = bookmarked.has(pkg.name);
                const isSelected = selectedPackages.has(pkg.name);
                const installCmd = `pkg install ${pkg.name}`;

                return (
                  <div 
                    key={pkg.name}
                    onClick={() => setActivePkg(pkg)}
                    className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/50 rounded-xl p-5 transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md relative"
                  >
                    <div>
                      {/* Top Row: Category & Actions */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-indigo-400 font-mono tracking-tight">
                          {pkg.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onClick={(e) => toggleSelectPkg(pkg.name, e)}
                            onChange={() => {}}
                            title="Select for batch installation"
                            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                          />
                          <button 
                            onClick={(e) => toggleBookmark(pkg.name, e)}
                            className={`p-1 rounded-md transition-colors ${isBookmarked ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
                          >
                            <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Package Name & Description */}
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors mb-1.5">
                        {pkg.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {pkg.description}
                      </p>
                    </div>

                    {/* Footer Info & Quick Copy Install */}
                    <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
                        <span>v{pkg.version}</span>
                        <span aria-hidden="true">·</span>
                        <span>{pkg.size}</span>
                      </div>

                      <button 
                        onClick={(e) => handleCopyCommand(installCmd, e)}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md text-xs font-mono transition-colors"
                        title="Copy pkg install command"
                      >
                        {copiedInstall === installCmd ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>pkg install</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredPackages.length === 0 && (
              <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">No packages found</h3>
                <p className="text-sm text-slate-400">Try adjusting your search query or category filter.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STATIC JSON API */}
        {activeTab === 'json-api' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                <Server className="w-3.5 h-3.5" />
                <span>Express API & Static JSON Export</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Static JSON API Endpoint (`/api/list-package.json`)
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                As requested, the backend exposes the full package list at <code className="text-indigo-300 bg-slate-900 px-2 py-0.5 rounded font-mono">/api/list-package.json</code>. You can also download the static JSON file directly for hosting on GitHub Pages or static static CDNs.
              </p>
            </div>

            {/* Actions Row */}
            <div className="flex items-center gap-4">
              <button 
                onClick={downloadStaticJson}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download packages.json File</span>
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(apiData || { count: PACKAGES_LIST.length, packages: PACKAGES_LIST.map(p => p.name) }, null, 2));
                  setCopiedJson(true);
                  setTimeout(() => setCopiedJson(false), 2000);
                }}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all border border-slate-700"
              >
                {copiedJson ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedJson ? 'Copied JSON' : 'Copy JSON to Clipboard'}</span>
              </button>
            </div>

            {/* JSON Code Viewer */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="bg-slate-800/80 px-4 py-2.5 border-b border-slate-700/50 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300">GET /api/list-package.json Response</span>
                <span className="text-xs text-emerald-400 font-mono">200 OK</span>
              </div>
              <div className="p-4 max-h-[500px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
                {isLoadingApi ? (
                  <div className="text-center py-12 text-slate-500">Loading API response...</div>
                ) : (
                  <pre>{JSON.stringify(apiData || { count: PACKAGES_LIST.length, packages: PACKAGES_LIST.map(p => p.name) }, null, 2)}</pre>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GITHUB PAGES DEPLOY */}
        {activeTab === 'gh-pages' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                <Globe className="w-3.5 h-3.5" />
                <span>Static Hosting & Deployment</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Deploying to GitHub Pages (No Express Server Required)
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                GitHub Pages is designed for static websites and static JSON hosting. Since GitHub Pages does not run a Node.js / Express backend, you can export your packages as a static <code className="text-indigo-300 bg-slate-900 px-2 py-0.5 rounded font-mono">packages.json</code> file alongside your compiled Vite React app.
              </p>
            </div>

            {/* Steps Guide */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-mono">1</span>
                  <span>Export Static JSON File</span>
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Click the <strong>"Download packages.json"</strong> button in the top bar to save your complete package array as a static JSON file in your public build folder (<code className="text-indigo-300 font-mono">public/packages.json</code>).
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-mono">2</span>
                  <span>Configure GitHub Actions Workflow</span>
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Create a GitHub Actions workflow file at <code className="text-indigo-300 font-mono">.github/workflows/deploy.yml</code> to automatically build and publish your app and static JSON to GitHub Pages:
                </p>
                
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto">
                  <pre>{`name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies & Build
        run: |
          npm install
          npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist`}</pre>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-mono">3</span>
                  <span>Access Static JSON on GitHub Pages</span>
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Once deployed, your static JSON file is globally accessible at:
                  <br />
                  <code className="text-indigo-300 font-mono mt-1 inline-block bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
                    https://&lt;your-username&gt;.github.io/&lt;repo-name&gt;/packages.json
                  </code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BATCH INSTALLER */}
        {activeTab === 'batch' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                <Terminal className="w-3.5 h-3.5" />
                <span>Batch Installation Generator</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Batch Package Installation Script
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Select packages from the explorer to generate a combined installation script or batch JSON payload.
              </p>
            </div>

            {selectedPackages.size === 0 ? (
              <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <Package className="w-12 h-12 text-slate-600 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">No packages selected</h3>
                  <p className="text-sm text-slate-400">Go to the Package Explorer and check the boxes next to packages you want to bundle.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('explorer')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Return to Explorer
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Selected Packages ({selectedPackages.size})</span>
                    <button 
                      onClick={() => setSelectedPackages(new Set())}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Selection</span>
                    </button>
                  </div>

                  {/* Selected badges */}
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-slate-950 rounded-lg border border-slate-800">
                    {Array.from(selectedPackages).map(name => (
                      <span key={name} className="inline-flex items-center gap-1.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-md text-xs font-mono">
                        <span>{name}</span>
                        <button onClick={() => {
                          const next = new Set(selectedPackages);
                          next.delete(name);
                          setSelectedPackages(next);
                        }} className="hover:text-white">&times;</button>
                      </span>
                    ))}
                  </div>

                  {/* Generated Shell Command */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 font-mono">Generated Termux Command:</label>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-emerald-400 flex items-center justify-between gap-4">
                      <span className="overflow-x-auto">pkg install -y {Array.from(selectedPackages).join(' ')}</span>
                      <button 
                        onClick={(e) => handleCopyCommand(`pkg install -y ${Array.from(selectedPackages).join(' ')}`, e)}
                        className="shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs transition-colors"
                      >
                        {copiedInstall?.startsWith('pkg install') ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Package Details Modal / Drawer */}
      {activePkg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-indigo-400 mb-1">{activePkg.category}</div>
                <h2 className="text-2xl font-bold text-white">{activePkg.name}</h2>
              </div>
              <button 
                onClick={() => setActivePkg(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed">
              {activePkg.description}
            </p>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <div className="text-xs text-slate-500 font-mono">Version</div>
                <div className="text-sm font-semibold text-white font-mono mt-0.5">v{activePkg.version}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-mono">Package Size</div>
                <div className="text-sm font-semibold text-white font-mono mt-0.5">{activePkg.size}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-mono">License</div>
                <div className="text-sm font-semibold text-white font-mono mt-0.5">{activePkg.license}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-mono">Manager</div>
                <div className="text-sm font-semibold text-white font-mono mt-0.5">Apt / Pkg</div>
              </div>
            </div>

            {/* Install Commands */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 font-mono">Installation Command:</label>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-400 flex items-center justify-between">
                <span>pkg install {activePkg.name}</span>
                <button 
                  onClick={(e) => handleCopyCommand(`pkg install ${activePkg.name}`, e)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs transition-colors"
                >
                  {copiedInstall === `pkg install ${activePkg.name}` ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* AI Technical Insights */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini AI Technical Insights & Usage Guide</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed min-h-[100px]">
                {isLoadingAi ? (
                  <div className="flex items-center justify-center py-8 text-slate-500 gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span>Generating AI package insights...</span>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none text-xs">
                    {aiInsights}
                  </div>
                )}
              </div>
            </div>

            {/* Close / Action */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button 
                onClick={() => setActivePkg(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
