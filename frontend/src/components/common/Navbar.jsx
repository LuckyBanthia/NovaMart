import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  User, 
  ShieldCheck, 
  LogOut, 
  Package, 
  SlidersHorizontal,
  X,
  Menu,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { aiAPI } from '../../api/api';

export const Navbar = ({ 
  onNavigate, 
  currentPage, 
  onOpenAuth, 
  searchQuery, 
  setSearchQuery,
  onSearchSubmit,
  selectedCategory,
  onSelectCategory,
  products = [],
  onSelectProduct
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search Recommendation States
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const searchContainerRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const categories = [
    { label: 'All Products', slug: 'all' },
    { label: 'Electronics', slug: 'electronics' },
    { label: 'Audio & Sound', slug: 'audio' },
    { label: 'Fashion', slug: 'fashion' },
    { label: 'Footwear', slug: 'footwear' },
    { label: 'Home & Living', slug: 'home-living' },
  ];

  // Live intelligent recommendations (Local + Scikit-Learn TF-IDF AI Microservice)
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setRecommendations([]);
      return;
    }

    const q = searchQuery.toLowerCase().trim();

    // Instant local filtering
    const local = (products || []).filter(p => {
      const text = [p.title, p.description, p.brand, p.categoryName, p.categorySlug, p.sku].filter(Boolean).join(' ').toLowerCase();
      const isLaptop = ['laptop', 'notebook', 'computer', 'ultrabook'].some(w => q.includes(w) || w.includes(q));
      const isShoe = ['shoe', 'shoes', 'sneaker', 'sneakers', 'footwear'].some(w => q.includes(w) || w.includes(q));
      if (isLaptop && (text.includes('laptop') || p.sku?.includes('LAP') || text.includes('zenith'))) return true;
      if (isShoe && (text.includes('shoe') || text.includes('sneaker') || p.sku?.includes('SHOE'))) return true;
      return text.includes(q);
    }).slice(0, 5);
    setRecommendations(local);

    // Call Scikit-Learn AI Service for semantic cosine similarity recommendations
    const timer = setTimeout(async () => {
      try {
        setAiLoading(true);
        const res = await aiAPI.searchRecommendations(q, 5);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const aiItems = res.data.map(item => {
            const found = (products || []).find(p => p.id === item.id);
            return found ? { ...found, ai_similarity_score: item.ai_similarity_score } : item;
          });
          setRecommendations(aiItems);
        }
      } catch (err) {
        // Keep local matches if offline or syncing
      } finally {
        setAiLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, products]);

  // Click-outside listener to close recommendation dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current && !searchContainerRef.current.contains(e.target) &&
        (!mobileSearchRef.current || !mobileSearchRef.current.contains(e.target))
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setIsSearchFocused(false);
      onSearchSubmit();
    }
  };

  const renderSearchDropdown = () => {
    if (!isSearchFocused) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fadeIn divide-y divide-slate-100">
        {searchQuery && searchQuery.trim() ? (
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5 text-blue-600">
                <Sparkles className="w-3.5 h-3.5" />
                AI Smart Recommendations
              </span>
              {aiLoading ? (
                <span className="text-[10px] text-indigo-500 font-semibold animate-pulse flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Scikit-Learn TF-IDF...
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">
                  {recommendations.length} recommended
                </span>
              )}
            </div>

            {recommendations.length > 0 ? (
              <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                {recommendations.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      if (onSelectProduct) onSelectProduct(prod);
                      setIsSearchFocused(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        className="w-11 h-11 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-100"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {prod.title}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {prod.brand || 'NovaMart'} • {prod.categoryName || 'Catalog'}
                        </p>
                        {prod.ai_similarity_score !== undefined && prod.ai_similarity_score > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mt-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            {Math.round(prod.ai_similarity_score * 100)}% ML Match
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-3">
                      <span className="text-xs font-black text-slate-900 block">
                        ${Number(prod.price).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                        View <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-5 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-700">No instant recommendation</p>
                <p className="text-[11px] text-slate-400">Press Enter to search the catalog with full filters</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsSearchFocused(false);
                  onSearchSubmit();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-between transition-colors shadow-xs"
              >
                <span>View all catalog matches for "{searchQuery}"</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Trending Product Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '💻 Laptops', q: 'laptop' },
                { label: '🎧 Wireless ANC Headphones', q: 'headphones' },
                { label: '👟 Running Shoes', q: 'shoes' },
                { label: '⌨️ Mechanical Keyboard', q: 'keyboard' },
                { label: '📷 4K Cinema Camera', q: 'camera' },
                { label: '☕ Ceramic Pour-Over Kettle', q: 'kettle' },
                { label: '⌚ Titanium Watch', q: 'watch' },
              ].map((item) => (
                <button
                  key={item.q}
                  type="button"
                  onClick={() => {
                    setSearchQuery(item.q);
                    setIsSearchFocused(false);
                    onSearchSubmit();
                  }}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-200">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 text-center tracking-wide font-medium flex justify-center items-center gap-4">
        <span>⚡ Flash Offer: Use code <strong className="text-amber-400 font-bold tracking-wider">NOVASAVE10</strong> for 10% OFF</span>
        <span className="hidden md:inline text-slate-500">•</span>
        <span className="hidden md:inline">Free Express Delivery on Orders Over $50</span>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <button 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              N
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                Nova<span className="text-blue-600">Mart</span>
              </span>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest -mt-1">
                Curated Store
              </span>
            </div>
          </button>

          {/* Search Bar (Desktop) */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands, audio, laptops, shoes..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 text-sm pl-10 pr-10 py-2.5 rounded-full border border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Recommendations Dropdown */}
            {renderSearchDropdown()}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Badge/Link */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  currentPage === 'admin'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Admin Panel</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('wishlist')}
              className={`relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors ${
                currentPage === 'wishlist' ? 'text-red-500 bg-red-50' : ''
              }`}
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100/80 text-blue-700 rounded-full font-medium text-sm transition-all focus:ring-2 focus:ring-blue-500/20"
              title="Open Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Cart</span>
              {totalItemCount > 0 && (
                <span className="w-5 h-5 text-xs font-bold bg-blue-600 text-white rounded-full flex items-center justify-center">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* User Account / Login */}
            <div className="relative">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 text-slate-700 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline text-xs font-medium max-w-[90px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {user.role === 'ROLE_ADMIN' ? 'Administrator' : 'Customer'}
                        </span>
                      </div>

                      <button
                        onClick={() => onNavigate('orders')}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        My Orders & Invoices
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => onNavigate('admin')}
                          className="w-full text-left px-4 py-2.5 text-xs text-indigo-600 font-semibold hover:bg-indigo-50 flex items-center gap-2.5"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          Admin Dashboard
                        </button>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-full shadow-sm transition-all focus:ring-2 focus:ring-slate-900/20"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div ref={mobileSearchRef} className="md:hidden pb-3 relative">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products, laptops, audio..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="w-full bg-slate-100 text-slate-800 text-sm pl-9 pr-8 py-2 rounded-full border border-slate-200 outline-none focus:bg-white focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {renderSearchDropdown()}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar border-t border-slate-100 text-xs font-medium">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => {
                onSelectCategory(cat.slug);
                if (currentPage !== 'catalog') {
                  onNavigate('catalog');
                }
              }}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
