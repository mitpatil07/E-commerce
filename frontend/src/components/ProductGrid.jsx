import { ShoppingCart, Heart, Star } from 'lucide-react';

function ProductCard({ 
  product, 
  onAddToCart,
  onProductClick 
}) {
  const imageUrl = product.image || `https://source.unsplash.com/600x600/?clothing,fashion&sig=${product.id}`;

  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-all duration-200">
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center cursor-pointer"
          onClick={() => onProductClick(product)}
        />
        

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-900">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {product.brand}
        </p>
        
        {/* Product Name */}
        <h3 
          className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-gray-600 transition-colors"
          onClick={() => onProductClick(product)}
        >
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 fill-black text-black" />
            <span className="text-xs text-gray-600">{product.rating}</span>
            {product.reviews && (
              <span className="text-xs text-gray-400">({product.reviews})</span>
            )}
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              ${product.price.toFixed(2)}
            </p>
            {product.originalPrice && (
              <p className="text-xs text-gray-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={!product.inStock}
            className={`p-2 rounded-full transition ${
              product.inStock 
                ? 'bg-black text-white hover:bg-gray-800' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ 
  products, 
  onAddToCart, 
  onProductClick 
}) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onProductClick={onProductClick}
          />
        ))}
      </div>
    </main>
  );
}