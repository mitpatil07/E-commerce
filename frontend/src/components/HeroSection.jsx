import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FullScreenCategoryHero() {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categories = [
    {
      id: 1,
      name: "Hoodies",
      image: "https://www.dhresource.com/webp/m/0x0/f2/albu/g18/M01/A3/01/rBVapGDZhImAWZJ4AAIejsIWKLQ193.jpg",
      description: "Premium comfort meets street style",
      tagline: "Stay Cozy",
    },
    {
      id: 2,
      name: "T-Shirts",
      image: "https://www.cleanipedia.com/images/yvwvo5xgjuhg/3tqC3rlQmQmHrSfjtQXxA9/0fbceabb7d7b191b0bdbe628b1fb0096/My5fQ29tZm9ydF9Ib3dfdG9fVW53cmlua2xlX0Nsb3RoZXNfR2VuaXVzX0F0LUhvbWVfVGlwcy1IZXJvLmpwZw/600w/assorted-children's-clothing-hanging-on-a-clothes-rack-against-a-yellow-background..avif",
      description: "Essential basics for every wardrobe",
      tagline: "Classic Comfort",
    },
    {
      id: 3,
      name: "Jeans",
      image: "https://www.cabionline.com/wp-content/uploads/2025/07/F25-Denim-Guide-share.jpg",
      description: "Perfect fit, timeless style",
      tagline: "Denim Days",
    },
    {
      id: 4,
      name: "Jerseys",
      image: "https://www.thesun.co.uk/wp-content/uploads/2018/06/nintchdbpict000409186926.jpg?strip=all&w=960",
      description: "Game-ready athletic wear",
      tagline: "Sport in Style",
    }
  ];

  const handleCategoryClick = (category) => {
    const categoryUrl = category.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/category/${categoryUrl}`, {
      state: { category: category.name }
    });
  };

  return (
    <div className="relative bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        }
        
        .category-title {
          font-weight: 900;
          letter-spacing: -0.02em;
          line-height: 0.95;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative h-screen bg-black overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop"
            alt="Fashion store"
            className="w-full h-full object-cover opacity-40"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-6">
          <div className="text-center max-w-4xl">
            <div className="mb-6 opacity-0 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <span className="text-xs font-semibold uppercase tracking-widest">
                Discover Your Style
              </span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase mb-8 opacity-0 animate-fadeInUp" style={{animationDelay: '0.4s', fontWeight: 900, letterSpacing: '-0.02em'}}>
              WHAT YOU WEAR
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl mb-12 text-white/80 font-light opacity-0 animate-fadeInUp" style={{animationDelay: '0.6s'}}>
              Premium streetwear collection crafted for your lifestyle
            </p>
            
            <button className="bg-white text-black px-10 py-5 font-bold text-base uppercase hover:bg-gray-200 transition-all duration-300 opacity-0 animate-fadeInUp" style={{animationDelay: '0.8s'}}>
              Explore Collection
            </button>
          </div>
        </div>
      </section>

      {/* Featured Categories Title */}
      <section className="py-20 px-6 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase mb-6" style={{letterSpacing: '-0.02em'}}>
            Featured Collection
          </h2>
          <p className="text-lg text-gray-600 font-light">
            Discover our handpicked selection of trending styles
          </p>
        </div>
      </section>

      {/* Category Grid */}
      <div className="md:p-4">
        {/* First Category - Full Width */}
        <div
          onClick={() => handleCategoryClick(categories[0])}
          onMouseEnter={() => setHoveredCategory(categories[0].id)}
          onMouseLeave={() => setHoveredCategory(null)}
          className="relative h-screen md:h-[80vh] cursor-pointer overflow-hidden group md:mb-4"
        >
          <div className="absolute inset-0">
            <img
              src={categories[0].image}
              alt={categories[0].name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${
              hoveredCategory === categories[0].id ? 'opacity-40' : 'opacity-50'
            }`}></div>
          </div>

          <div className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-12 text-white">
            <div className="mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
                {categories[0].tagline}
              </span>
            </div>

            <h3 className="category-title text-5xl sm:text-6xl md:text-7xl mb-4 uppercase">
              {categories[0].name}
            </h3>

            <p className="text-base mb-6 text-white/90 max-w-md font-light">
              {categories[0].description}
            </p>

            <button className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-bold text-sm uppercase hover:bg-gray-100 transition-all duration-300 self-start group-hover:gap-5">
              Shop {categories[0].name}
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12">
              <div className="text-white/20 text-7xl sm:text-8xl font-black">
                01
              </div>
            </div>
          </div>

          <div className={`absolute inset-0 border-2 border-white transition-opacity duration-300 pointer-events-none ${
            hoveredCategory === categories[0].id ? 'opacity-50' : 'opacity-0'
          }`}></div>
        </div>

        {/* Second and Third Categories - Side by Side on Desktop */}
        <div className="md:grid md:grid-cols-2 md:gap-4 md:mb-4">
          {categories.slice(1, 3).map((category, index) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="relative h-screen md:h-[65vh] cursor-pointer overflow-hidden group"
            >
              <div className="absolute inset-0">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${
                  hoveredCategory === category.id ? 'opacity-40' : 'opacity-50'
                }`}></div>
              </div>

              <div className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-12 text-white">
                <div className="mb-3">
                  <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
                    {category.tagline}
                  </span>
                </div>

                <h3 className="category-title text-5xl sm:text-6xl md:text-7xl mb-4 uppercase">
                  {category.name}
                </h3>

                <p className="text-base mb-6 text-white/90 max-w-md font-light">
                  {category.description}
                </p>

                <button className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-bold text-sm uppercase hover:bg-gray-100 transition-all duration-300 self-start group-hover:gap-5">
                  Shop {category.name}
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12">
                  <div className="text-white/20 text-7xl sm:text-8xl font-black">
                    0{index + 2}
                  </div>
                </div>
              </div>

              <div className={`absolute inset-0 border-2 border-white transition-opacity duration-300 pointer-events-none ${
                hoveredCategory === category.id ? 'opacity-50' : 'opacity-0'
              }`}></div>
            </div>
          ))}
        </div>

        {/* Fourth Category - Full Width */}
        <div
          onClick={() => handleCategoryClick(categories[3])}
          onMouseEnter={() => setHoveredCategory(categories[3].id)}
          onMouseLeave={() => setHoveredCategory(null)}
          className="relative h-screen md:h-[60vh] cursor-pointer overflow-hidden group"
        >
          <div className="absolute inset-0">
            <img
              src={categories[3].image}
              alt={categories[3].name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${
              hoveredCategory === categories[3].id ? 'opacity-40' : 'opacity-50'
            }`}></div>
          </div>

          <div className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-12 text-white">
            <div className="mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
                {categories[3].tagline}
              </span>
            </div>

            <h3 className="category-title text-5xl sm:text-6xl md:text-7xl mb-4 uppercase">
              {categories[3].name}
            </h3>

            <p className="text-base mb-6 text-white/90 max-w-md font-light">
              {categories[3].description}
            </p>

            <button className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-bold text-sm uppercase hover:bg-gray-100 transition-all duration-300 self-start group-hover:gap-5">
              Shop {categories[3].name}
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12">
              <div className="text-white/20 text-7xl sm:text-8xl font-black">
                04
              </div>
            </div>
          </div>

          <div className={`absolute inset-0 border-2 border-white transition-opacity duration-300 pointer-events-none ${
            hoveredCategory === categories[3].id ? 'opacity-50' : 'opacity-0'
          }`}></div>
        </div>
      </div>
    </div>
  );
}