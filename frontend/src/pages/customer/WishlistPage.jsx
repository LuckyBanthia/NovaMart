import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

export const WishlistPage = ({ onSelectProduct, onStartShopping }) => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Wishlist</h1>
        <p className="text-xs text-slate-500 mt-1">Saved items you want to keep an eye on</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-400 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
            Tap the heart icon on any product in our catalog to save it here for later.
          </p>
          <button
            onClick={onStartShopping}
            className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Start Exploring
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div 
                  onClick={() => onSelectProduct(product)}
                  className="h-44 rounded-2xl overflow-hidden bg-slate-50 cursor-pointer mb-3"
                >
                  <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                </div>
                <h3 
                  onClick={() => onSelectProduct(product)}
                  className="text-xs font-bold text-slate-800 truncate cursor-pointer hover:text-blue-600"
                >
                  {product.title}
                </h3>
                <p className="text-sm font-black text-slate-900 mt-2">${Number(product.price).toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => addToCart(product, 1)}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
