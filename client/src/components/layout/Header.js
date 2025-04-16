import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaShoppingBag, FaBars, FaTimes, FaShoppingCart, FaFire, FaSearch } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import Cart from '../shop/Cart';
import LogoImage from '../../assets/logo.png';

const Header = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, isRTL } = useLanguage();
  const { toggleCart, itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  
  // Check if it's admin route
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleLanguage = () => {
    changeLanguage(currentLanguage === 'fr' ? 'ar' : 'fr');
  };
  
  // Focus search input when search is opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);
  
  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      if (mobileMenuOpen) setMobileMenuOpen(false);
    }
  };

  // Don't show header in admin routes
  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <header className="bg-white shadow-md py-4 relative">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src={LogoImage} alt="Beauty Shop" className="h-12 w-auto mr-3" />
              <span className={`text-xl md:text-2xl font-serif font-bold text-primary ${isRTL ? 'mr-2' : 'ml-2'}`}>
                {t('app.title')}
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <div className="flex space-x-6 mr-6">
                <Link to="/" className="font-medium text-gray-700 hover:text-primary transition-colors px-2">
                  {t('nav.home')}
                </Link>
                <Link to="/category/bags" className="font-medium text-gray-700 hover:text-primary transition-colors px-2">
                  {t('nav.bags')}
                </Link>
                <Link to="/category/perfumes" className="font-medium text-gray-700 hover:text-primary transition-colors px-2">
                  {t('nav.perfumes')}
                </Link>
                <Link to="/category/cosmetics" className="font-medium text-gray-700 hover:text-primary transition-colors px-2">
                  {t('nav.cosmetics')}
                </Link>
                <Link to="/category/wallets" className="font-medium text-gray-700 hover:text-primary transition-colors px-2">
                  {t('nav.wallets')}
                </Link>
                <Link to="/category/accessories" className="font-medium text-gray-700 hover:text-primary transition-colors px-2">
                  {t('nav.accessories')}
                </Link>
                <Link to="/hotdeals" className="font-medium text-gray-700 hover:text-primary transition-colors px-2">
                  <FaFire className="inline-block mr-1 text-red-500" />
                  {t('deals.title')}
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Search button */}
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 text-gray-700 hover:text-primary transition-colors"
                  aria-label={t('search.search')}
                >
                  <FaSearch className="h-5 w-5" />
                </button>
                
                {/* Cart button */}
                <button 
                  onClick={toggleCart}
                  className="relative p-2 text-gray-700 hover:text-primary transition-colors"
                >
                  <FaShoppingCart className="h-6 w-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>
                
                {/* Language toggle */}
                <button 
                  onClick={toggleLanguage} 
                  className="px-4 py-2 border-2 border-primary rounded-full text-primary font-medium hover:bg-primary hover:text-white transition-colors"
                >
                  {currentLanguage === 'fr' ? 'العربية' : 'Français'}
                </button>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              {/* Search icon for mobile */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-700 hover:text-primary transition-colors"
                aria-label={t('search.search')}
              >
                <FaSearch className="h-5 w-5" />
              </button>
              
              {/* Cart icon for mobile */}
              <button 
                onClick={toggleCart}
                className="relative p-2 text-gray-700 hover:text-primary transition-colors"
              >
                <FaShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
              
              <button 
                onClick={toggleMobileMenu} 
                className="text-gray-600 hover:text-primary focus:outline-none p-2"
              >
                {mobileMenuOpen ? (
                  <FaTimes className="h-6 w-6" />
                ) : (
                  <FaBars className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-3 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <Link 
                  to="/" 
                  className="font-medium text-gray-700 hover:text-primary px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.home')}
                </Link>
                <Link 
                  to="/category/bags" 
                  className="font-medium text-gray-700 hover:text-primary px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.bags')}
                </Link>
                <Link 
                  to="/category/perfumes" 
                  className="font-medium text-gray-700 hover:text-primary px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.perfumes')}
                </Link>
                <Link 
                  to="/category/cosmetics" 
                  className="font-medium text-gray-700 hover:text-primary px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.cosmetics')}
                </Link>
                <Link 
                  to="/category/wallets" 
                  className="font-medium text-gray-700 hover:text-primary px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.wallets')}
                </Link>
                <Link 
                  to="/category/accessories" 
                  className="font-medium text-gray-700 hover:text-primary px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.accessories')}
                </Link>
                <Link 
                  to="/hotdeals" 
                  className="font-medium text-gray-700 hover:text-primary px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaFire className="inline-block mr-1 text-red-500" />
                  {t('deals.title')}
                </Link>
                
                {/* Language toggle */}
                <button 
                  onClick={() => {
                    toggleLanguage();
                    setMobileMenuOpen(false);
                  }} 
                  className="px-4 py-2 border-2 border-primary rounded-full text-primary font-medium hover:bg-primary hover:text-white transition-colors w-fit"
                >
                  {currentLanguage === 'fr' ? 'العربية' : 'Français'}
                </button>
              </div>
            </div>
          )}
        </nav>
        
        {/* Search overlay - shows when searchOpen is true */}
        {searchOpen && (
          <div className="absolute left-0 right-0 top-0 bg-white shadow-lg p-4 z-50 transition-all duration-300 ease-in-out">
            <div className="container mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className={`w-full py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary ${
                    isRTL ? 'pr-12 pl-10' : 'pl-12 pr-10'
                  }`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <FaSearch className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${
                  isRTL ? 'right-4' : 'left-4'
                }`} />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 ${
                    isRTL ? 'left-4' : 'right-4'
                  }`}
                  aria-label={t('search.close')}
                >
                  <FaTimes />
                </button>
              </form>
            </div>
          </div>
        )}
      </header>
      
      {/* Cart Sidebar (rendered conditionally) */}
      <Cart />
    </>
  );
};

export default Header;