import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import ClothingShowcase from './ClothingShowcase';
import { useNavigate } from 'react-router-dom';
export default function CategorySection({ onCategorySelect }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  const categories = [
    {
      id: 1,
      name: "T-Shirts",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      itemCount: 156,
    },
    {
      id: 2,
      name: "Hoodies",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
      itemCount: 89,
    },
    {
      id: 3,
      name: "Jeans",
      image: "https://images.unsplash.com/photo-1542272454315-7f6b6c17f7f8?w=400&h=400&fit=crop",
      itemCount: 124,
    },
    {
      id: 4,
      name: "Track Pants",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
      itemCount: 98
    },
    {
      id: 5,
      name: "Polo Shirts",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
      itemCount: 67,
    },
    {
      id: 6,
      name: "Track Suits",
      image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop",
      itemCount: 142,
    },
    {
      id: 7,
      name: "Wind Cheater",
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop",
      itemCount: 43
    },
    {
      id: 8,
      name: "Jerseys",
      image: "https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=400&h=400&fit=crop",
      itemCount: 211,
    }
  ];

  const handleCategoryClick = (category) => {
    // console.log('📂 Category clicked:', category.name);
    setSelectedCategory(category.id);
    
    // Navigate to category page
    const categoryUrl = category.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/category/${categoryUrl}`, {
      state: { category: category.name }
    });
    
    // Also call parent handler if provided
    if (onCategorySelect && typeof onCategorySelect === 'function') {
      onCategorySelect(category);
    }
  };
  return (
    <>
      <section className="bg-white">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          
          .section-title {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 900;
            letter-spacing: -0.04em;
            line-height: 1;
          }
          
          .category-name {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 700;
            letter-spacing: -0.01em;
            line-height: 1.2;
          }
          
          .category-count {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 600;
            letter-spacing: 0.01em;
          }
        `}</style>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl text-black mb-2 uppercase">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-sm sm:text-base uppercase tracking-wide">
              Discover our premium men's collection
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`group relative overflow-hidden transition-all duration-300 bg-white ${
                  selectedCategory === category.id
                    ? 'ring-4 ring-black'
                    : 'hover:ring-2 hover:ring-black'
                }`}
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Arrow Icon */}
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white rounded-full p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 translate-x-2 transition-all duration-300">
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </div>

                {/* Content Below Image */}
                <div className="bg-white p-3 sm:p-4 border-t border-gray-200">
                  <h3 className="category-name text-sm sm:text-base lg:text-lg text-black mb-1 uppercase">
                    {category.name}
                  </h3>
                  <p className="category-count text-xs sm:text-sm text-gray-600 uppercase">
                    {category.itemCount}+ Products
                  </p>
                </div>

                {/* Selected Indicator */}
                {selectedCategory === category.id && (
                  <div className="absolute inset-0 border-4 border-black pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>
      <ClothingShowcase/>
    </>
  );
}