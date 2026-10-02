import React from 'react';
import { ArrowRight, Sparkles, Star, Zap, Shield, Heart, ShoppingBag, TrendingUp, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const HomePage = ({ products, onSelectProduct, onNavigate, onSelectCategory }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const trendingProducts = products.slice(0, 8);

  const categories = [
    { name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=80', count: '12+ items' },
    { name: 'Audio & Sound', slug: 'audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80', count: '8+ items' },
    { name: 'Fashion & Apparel', slug: 'fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80', count: '15+ items' },
    { name: 'Footwear', slug: 'footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80', count: '6+ items' },
    { name: 'Home & Living', slug: 'home-living', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80', count: '10+ items' },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white mx-4 sm:mx-6 lg:mx-8 mt-6">
        {/* Glow ambient effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Commerce Experience</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Curated Essentials.<br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Elevated Living.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Explore high-performance electronics, minimalist streetwear, and precision acoustics. Instant verified digital invoices and seamless checkout engineered for simplicity.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-2">
              <button
                onClick={() => onNavigate('catalog')}
                className="px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <span>Shop Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  onSelectCategory('audio');
                  onNavigate('catalog');
                }}
                className="px-7 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <span>Featured Audio</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="text-lg sm:text-2xl font-black text-white">100%</p>
                <p className="text-[11px] text-slate-400 font-medium">Authentic Goods</p>
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-black text-white">Instant</p>
                <p className="text-[11px] text-slate-400 font-medium">Tax Invoices</p>
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-black text-white">4.9/5</p>
                <p className="text-[11px] text-slate-400 font-medium">User Rating</p>
              </div>
            </div>
          </div>

          {/* Hero Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-4">
              <div className="relative h-64 rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
                  alt="AuraSound Headphones"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  24% OFF
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 text-amber-400 text-xs mb-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-bold text-slate-200">4.9</span>
                  <span className="text-slate-400 text-[11px]">(128 reviews)</span>
                </div>
                <h3 className="text-sm font-bold text-white truncate">AuraSound Pro Wireless ANC</h3>
                <p className="text-xs text-slate-400 mt-1">Active Noise Cancelling • 38h Battery</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-white">$249.99</span>
                    <span className="text-xs text-slate-500 line-through">$329.99</span>
                  </div>
                  <button
                    onClick={() => {
                      const auraSound = products.find(p => p.sku === 'AUD-PRO-01');
                      if (auraSound) addToCart(auraSound, 1);
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                  >
                    Quick Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Explore Collections
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Carefully selected items for your daily lifestyle</p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.slug}
              onClick={() => {
                onSelectCategory(cat.slug);
                onNavigate('catalog');
              }}
              className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all border border-slate-200/60 bg-white"
            >
              <div className="h-32 w-full overflow-hidden bg-slate-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3 text-center">
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{cat.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Spotlight Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
              Editor's Choice
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Trending Products
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
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

                {/* Wishlist Toggle */}
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

                {/* Discount Badge */}
                {product.discountPercent > 0 && (
                  <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    -{product.discountPercent}%
                  </span>
                )}

                {/* Low Stock Warning Badge */}
                {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                  <span className="absolute bottom-2 left-2 bg-amber-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    Only {product.stockQuantity} left
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{product.categoryName || 'Curated'}</span>
                  <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{product.rating || '4.8'}</span>
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
      </section>

      {/* Promotional Strip */}
      <section className="mx-4 sm:mx-6 lg:mx-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
              Exclusive Member Discount
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">Save 10% on your next order</h3>
            <p className="text-xs text-blue-100 max-w-md">
              Apply coupon <strong className="text-amber-300 font-mono font-bold text-sm">NOVASAVE10</strong> at checkout to redeem immediate savings.
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="px-6 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold shadow-lg transition-all shrink-0"
          >
            Claim Offer Now
          </button>
        </div>
      </section>
    </div>
  );
};
