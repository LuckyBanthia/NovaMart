import React, { useState, useMemo } from 'react';
import { Filter, Star, Heart, ShoppingBag, SlidersHorizontal, RotateCcw, Search } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const ProductListingPage = ({ 
  products, 
  onSelectProduct, 
  selectedCategory, 
  onSelectCategory,
  searchQuery,
  setSearchQuery 
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [priceRange, setPriceRange] = useState(2000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories = [
    { label: 'All Categories', slug: 'all' },
    { label: 'Electronics', slug: 'electronics' },
    { label: 'Audio & Sound', slug: 'audio' },
    { label: 'Fashion & Apparel', slug: 'fashion' },
    { label: 'Footwear', slug: 'footwear' },
    { label: 'Home & Living', slug: 'home-living' },
  ];

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category
        if (selectedCategory && selectedCategory !== 'all' && p.categorySlug !== selectedCategory) {
          return false;
        }
        // Search query with smart token and synonym matching
        if (searchQuery && searchQuery.trim() !== '') {
          const rawQ = searchQuery.toLowerCase().trim();
          const queryTokens = rawQ.split(/\s+/).filter(Boolean);
          
          const productText = [
            p.title,
            p.description,
            p.brand,
            p.categoryName,
            p.categorySlug,
            p.sku
          ].filter(Boolean).join(' ').toLowerCase();

          // Common e-commerce synonym dictionary
          const synonyms = {
            laptop: ['laptop', 'laptops', 'notebook', 'ultrabook', 'computer', 'pc', 'macbook', 'zenith'],
            shoes: ['shoe', 'shoes', 'sneaker', 'sneakers', 'runners', 'footwear', 'trainers'],
            headphones: ['headphone', 'headphones', 'headset', 'audio', 'earphones', 'earbuds', 'anc', 'sound'],
            watch: ['watch', 'watches', 'timepiece', 'chronometer', 'titanium'],
            camera: ['camera', 'cameras', 'cinema', 'lens', 'photo', 'photography', '4k'],
            keyboard: ['keyboard', 'keyboards', 'mechanical', 'switches', 'typing'],
            kettle: ['kettle', 'pour-over', 'coffee', 'tea', 'barista'],
            hoodie: ['hoodie', 'sweatshirt', 'terry', 'cotton', 'apparel', 'clothing']
          };

          const isMatch = queryTokens.some(token => {
            if (productText.includes(token)) return true;
            for (const key of Object.keys(synonyms)) {
              const cluster = synonyms[key];
              if (cluster.some(w => w.includes(token) || token.includes(w))) {
                if (cluster.some(w => productText.includes(w))) {
                  return true;
                }
              }
            }
            return false;
          });

          if (!isMatch) return false;
        }
        // Price
        if (Number(p.price) > priceRange) {
          return false;
        }
        // In stock
        if (onlyInStock && p.stockQuantity <= 0) {
          return false;
        }
        // Rating
        if (minRating > 0 && (p.rating || 0) < minRating) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0; // Default / featured
      });
  }, [products, selectedCategory, searchQuery, priceRange, onlyInStock, minRating, sortBy]);

  const resetFilters = () => {
    onSelectCategory('all');
    setSearchQuery('');
    setPriceRange(2000);
    setOnlyInStock(false);
    setMinRating(0);
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Curated Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing <strong className="text-slate-900">{filteredProducts.length}</strong> items
            {selectedCategory && selectedCategory !== 'all' && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs text-slate-600 ml-auto sm:ml-0">
            <span className="font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className={`space-y-6 md:block ${mobileFilterOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>Filters</span>
              </h3>
              <button
                onClick={resetFilters}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2.5">Category</h4>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => onSelectCategory(cat.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      selectedCategory === cat.slug
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-2">
                <span>Max Price</span>
                <span className="text-blue-600 font-bold">${priceRange}</span>
              </div>
              <input
                type="range"
                min="20"
                max="2000"
                step="20"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>$20</span>
                <span>$2,000+</span>
              </div>
            </div>

            {/* Availability */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Minimum Rating */}
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 mb-2">Minimum Rating</h4>
              <div className="space-y-1">
                {[4, 3, 2].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                      minRating === stars ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {Array.from({ length: stars }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="ml-1 text-[11px]">& Up</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No products matched your filters</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try widening your price range, searching for another keyword, or resetting category filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl border border-slate-100 p-3.5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative">
                    {/* Image */}
                    <div
                      onClick={() => onSelectProduct(product)}
                      className="h-48 rounded-2xl overflow-hidden bg-slate-50 cursor-pointer"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Wishlist Heart */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md shadow-sm transition-colors ${
                        isInWishlist(product.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 hover:bg-white text-slate-600'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>

                    {/* Badges */}
                    {product.discountPercent > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                        -{product.discountPercent}%
                      </span>
                    )}

                    {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                      <span className="absolute bottom-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        Only {product.stockQuantity} Left
                      </span>
                    )}

                    {product.stockQuantity <= 0 && (
                      <span className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>{product.categoryName || 'Curated'}</span>
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{product.rating || '4.5'}</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {product.title}
                    </h3>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                      <div>
                        <span className="text-sm font-black text-slate-900">
                          ${Number(product.price).toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[11px] text-slate-400 line-through ml-1.5">
                            ${Number(product.originalPrice).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(product, 1)}
                        disabled={product.stockQuantity <= 0}
                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-40"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
