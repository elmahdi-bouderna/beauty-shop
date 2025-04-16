import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const Banner = ({ banner }) => {
  const { currentLanguage } = useLanguage();
  
  if (!banner) return null;
  
  const title = currentLanguage === 'fr' ? banner.title_fr : banner.title_ar;
  const subtitle = currentLanguage === 'fr' ? banner.subtitle_fr : banner.subtitle_ar;
  const imageUrl = banner.image 
    ? `http://localhost:5000${banner.image}` 
    : 'https://via.placeholder.com/1200x400?text=No+Banner';
  
  return (
    <div className="w-full h-96 relative rounded-lg overflow-hidden mb-8">
      <img 
        src={imageUrl} 
        alt={title} 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center px-8 md:px-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{title}</h2>
        <p className="text-lg md:text-xl text-white/90 max-w-md">{subtitle}</p>
      </div>
    </div>
  );
};

export default Banner;