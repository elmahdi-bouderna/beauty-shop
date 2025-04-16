import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productsAPI, bannersAPI } from '../../utils/api';
import ProductCard from '../../components/shop/ProductCard';
import BannerCarousel from '../../components/shop/BannerCarousel';
import HotDealsSection from '../../components/shop/HotDealsSection';
import LocationSection from '../../components/shop/LocationSection';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaShoppingBag, FaSprayCan, FaMagic, FaWallet, FaGem } from 'react-icons/fa';

const HomePage = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [banners, setBanners] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch active banners
        const bannersRes = await bannersAPI.getActive();
        setBanners(bannersRes.data);
        
        // Fetch products for featured section
        const productsRes = await productsAPI.getAll();
        
        // Get 8 featured products (newest)
        setFeaturedProducts(productsRes.data.slice(0, 8));
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [t]);
  
  // Categories section with icons
  const categories = [
    {
      id: 'bags',
      name: t('categories.bags'),
      icon: <FaShoppingBag className="h-16 w-16 mb-4 text-primary" />,
    },
    {
      id: 'perfumes',
      name: t('categories.perfumes'),
      icon: <FaSprayCan className="h-16 w-16 mb-4 text-primary" />,
    },
    {
      id: 'cosmetics',
      name: t('categories.cosmetics'),
      icon: <FaMagic className="h-16 w-16 mb-4 text-primary" />,
    },
    {
      id: 'wallets',
      name: t('categories.wallets'),
      icon: <FaWallet className="h-16 w-16 mb-4 text-primary" />,
    },
    {
      id: 'accessories',
      name: t('categories.accessories'),
      icon: <FaGem className="h-16 w-16 mb-4 text-primary" />,
    }
  ];

  return (
    <div>
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : (
        <>
          {/* Banner Carousel */}
          {banners.length > 0 && <BannerCarousel banners={banners} />}
          
          <div className="container mx-auto px-4 py-8">
            {/* Categories */}
            <section className="mb-12">
              <h2 className={`text-2xl sm:text-3xl font-serif font-bold mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('home.categories')}
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
                {categories.map((category) => (
                  <Link 
                    key={category.id} 
                    to={`/category/${category.id}`} 
                    className="text-center p-2 sm:p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-300"
                  >
                    <div className="flex justify-center">
                      {React.cloneElement(category.icon, { className: "h-8 w-8 sm:h-12 sm:w-12 mb-2 sm:mb-3 text-primary" })}
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-base font-medium">{category.name}</h3>
                  </Link>
                ))}
              </div>
            </section>
            
            {/* Hot Deals Section */}
            <HotDealsSection />
            
            {/* Featured Products */}
            <section className="mb-16">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-serif font-bold">{t('home.featuredProducts')}</h2>
                <Link to="/category/all" className="text-primary hover:underline font-medium">
                  {t('home.viewAll')}
                </Link>
              </div>
              
              {featuredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 product-grid-container">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <p className="text-center py-12 text-gray-600">{t('common.noResults')}</p>
              )}
            </section>
          </div>
          
          {/* Location Map Section (outside container for full width) */}
          <LocationSection />
        </>
      )}
    </div>
  );
};

export default HomePage;