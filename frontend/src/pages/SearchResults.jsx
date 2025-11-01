// src/pages/SearchResults.jsx - FIXED with lighter backdrop
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../services/api";

export default function SearchResultsPopup({ query, onProductClick, onClose, addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query && query.trim().length >= 2) {
      fetchResults(query);
    } else {
      setProducts([]);
    }
  }, [query]);

  const fetchResults = async (q) => {
    setLoading(true);
    try {
      const data = await api.searchProducts(q);
      setProducts(data.results || data.items || data || []);
    } catch (error) {
      console.error("❌ Search failed:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    onProductClick(product);
  };

  return (
    <>
      {/* Transparent Backdrop - Click to close */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Popup Container */}
      <div className="fixed top-32 sm:top-24 left-1/2 -translate-x-1/2 w-full max-w-5xl bg-white rounded-lg shadow-2xl z-50 max-h-[85vh] overflow-hidden border-2 border-gray-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Search Results
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              {loading ? 'Searching...' : `${products.length} products found for "${query}"`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all bg-white group"
                >
                  <div className="relative aspect-square mb-3 overflow-hidden rounded-md bg-gray-100">
                    <img
                      src={product.image || product.images?.[0]?.image || '/placeholder.png'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.discount_price && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-2">
                    {product.discount_price ? (
                      <>
                        <span className="text-base font-bold text-gray-900">
                          ₹{product.discount_price}
                        </span>
                        <span className="text-sm line-through text-gray-400">
                          ₹{product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-base font-bold text-gray-900">
                        ₹{product.price}
                      </span>
                    )}
                  </div>

                  {product.stock_quantity !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                      {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg
                className="mx-auto h-16 w-16 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Try searching with different keywords or check your spelling
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}