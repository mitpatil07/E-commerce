import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import TopDeals from './TopDeals';
import CategorySection from './CategorySection';

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: 'https://cdn.shopify.com/s/files/1/0070/7032/articles/how_20to_20start_20a_20clothing_20brand_01a87777-0df1-4ac7-ae83-bfa1c8de72c2.png?v=1758058287',
      title: 'Men\'s Fashion',
      subtitle: 'Summer Collection',
      description: 'Discover the latest trends with up to 50% off on premium menswear'
    },
    {
      id: 2,
      image: 'https://static.vecteezy.com/system/resources/thumbnails/070/206/608/small/trendy-white-t-shirt-hanging-on-stylish-background-photo.jpg',
      title: 'Formal Wear',
      subtitle: 'For Every Occasion',
      description: 'Premium quality suits and shirts designed for the modern man'
    },
    {
      id: 3,
      image: 'https://t3.ftcdn.net/jpg/14/18/73/78/360_F_1418737848_7RGfcexg9yjRKgttCe6cUeSPdshsI3G5.jpg',
      title: 'Casual Comfort',
      subtitle: 'Made Perfect',
      description: 'Effortless style meets exceptional comfort in men\'s casual wear'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=1200&h=800&fit=crop',
      title: 'Urban Trends',
      subtitle: 'Street Style',
      description: 'Bold designs for the confident modern man'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <>
      <section className="relative h-160 overflow-hidden">
        {/* Slider Images */}
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              {/* Dark Overlay for Text Readability */}
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
            <div className="animate-fadeIn text-white">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
                ✨ New Collection 2025
              </span>

              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                {slides[currentSlide].title}
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
                  {slides[currentSlide].subtitle}
                </span>
              </h1>

              <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto font-light">
                {slides[currentSlide].description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="group bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 flex items-center gap-2">
                  Shop Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all rounded-full ${index === currentSlide
                  ? 'w-12 h-3 bg-white'
                  : 'w-3 h-3 bg-white/50 hover:bg-white/70'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </section>
    </>
  );
}