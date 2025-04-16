import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const BannerCarousel = ({ banners }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isRTL } = useLanguage();
  
  useEffect(() => {
    if (banners.length <= 1) return;
    
    // Auto-rotate banners every 5 seconds
    const interval = setInterval(() => {
      setCurrentSlide((current) => (current + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length]);
  
  const nextSlide = () => {
    setCurrentSlide((current) => (current + 1) % banners.length);
  };
  
  const prevSlide = () => {
    setCurrentSlide((current) => (current - 1 + banners.length) % banners.length);
  };
  
  if (banners.length === 0) {
    return null;
  }
  
  return (
    <div className="relative mb-8 overflow-hidden rounded-xl">
      {/* Reduce the height here - using h-48 for mobile and h-72 for larger screens */}
      <div 
        className="w-full h-48 sm:h-64 md:h-72 bg-gray-200 relative overflow-hidden"
        aria-live="polite"
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={`http://localhost:5000${banner.image}`}
              alt={banner.title_fr || 'Banner'}
              className="w-full h-full object-cover"
            />
            
            {(banner.title_fr || banner.subtitle_fr) && (
              <div className="absolute inset-0 flex flex-col justify-center p-6 bg-black/30 text-white">
                <div className={`container mx-auto ${isRTL ? 'text-right' : 'text-left'}`}>
                  {banner.title_fr && (
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-2">
                      {isRTL ? banner.title_ar : banner.title_fr}
                    </h2>
                  )}
                  {banner.subtitle_fr && (
                    <p className="text-sm sm:text-base md:text-lg max-w-lg">
                      {isRTL ? banner.subtitle_ar : banner.subtitle_fr}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {banners.length > 1 && (
        <>
          {/* Navigation arrows */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 text-primary p-2 rounded-full z-20 hover:bg-white"
            onClick={prevSlide}
            aria-label="Previous banner"
          >
            <FaChevronLeft />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 text-primary p-2 rounded-full z-20 hover:bg-white"
            onClick={nextSlide}
            aria-label="Next banner"
          >
            <FaChevronRight />
          </button>
          
          {/* Dots indicator */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentSlide ? 'bg-primary' : 'bg-white/60'
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to banner ${index + 1}`}
                aria-current={index === currentSlide ? 'true' : 'false'}
              ></button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;