import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('app.title')}</h3>
            <p className="mb-4">{t('app.slogan')}</p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-white hover:text-primary" target="_blank" rel="noopener noreferrer">
                <FaFacebook className="w-6 h-6" />
              </a>
              <a href="https://instagram.com" className="text-white hover:text-primary" target="_blank" rel="noopener noreferrer">
                <FaInstagram className="w-6 h-6" />
              </a>
              <a href="https://wa.me/212600000000" className="text-white hover:text-primary" target="_blank" rel="noopener noreferrer">
                <FaWhatsapp className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('home.categories')}</h3>
            <ul className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              <li>
                <Link to="/category/bags" className="text-gray-300 hover:text-white">
                  {t('categories.bags')}
                </Link>
              </li>
              <li>
                <Link to="/category/perfumes" className="text-gray-300 hover:text-white">
                  {t('categories.perfumes')}
                </Link>
              </li>
              <li>
                <Link to="/category/cosmetics" className="text-gray-300 hover:text-white">
                  {t('categories.cosmetics')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('contact.title')}</h3>
            <p className="mb-2">{t('contact.address')}: 123 Rue Mohammed V, Casablanca</p>
            <p className="mb-2">{t('contact.phone')}: +212 600 000 000</p>
            <p className="mb-2">{t('contact.email')}: contact@beautyshop.com</p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} {t('app.title')}. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;