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
      <section className="bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-black text-black mb-2 uppercase tracking-tight">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-sm uppercase tracking-wide font-medium">
              Discover our premium men's collection
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`group relative overflow-hidden bg-white border-2 transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'border-black'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-200" />
                  
                  {/* Arrow Icon */}
                  <div className="absolute top-3 right-3 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                    <ChevronRight className="w-4 h-4 text-black" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 text-left bg-white">
                  <h3 className="text-base md:text-lg font-bold text-black mb-1 uppercase tracking-tight">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 uppercase tracking-wide font-medium">
                    {category.itemCount}+ Products
                  </p>
                </div>

                {/* Selected Border */}
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