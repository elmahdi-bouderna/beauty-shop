import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaFire, FaArrowLeft } from 'react-icons/fa';
import { productsAPI } from '../../utils/api';
import ProductCard from '../../components/shop/ProductCard';
import SortSelector from '../../components/shop/SortSelector';
import { useLanguage } from '../../contexts/LanguageContext';

const HotDealsPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const sortBy = searchParams.get('sort') || 'discount'; // Default sort by highest discount
  
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getDiscounted(sortBy);
        setDiscountedProducts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching discounted products:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchDiscountedProducts();
  }, [sortBy, t]);
  
  const handleSortChange = (newSortValue) => {
    searchParams.set('sort', newSortValue);
    setSearchParams(searchParams);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <div className={`flex items-center mb-4 sm:mb-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Link to="/" className={`${isRTL ? 'ml-4' : 'mr-4'} text-gray-600 hover:text-primary`}>
            <FaArrowLeft className={isRTL ? 'transform rotate-180' : ''} />
          </Link>
          <h1 className="text-2xl font-serif font-bold flex items-center">
            <FaFire className={`text-red-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('deals.pageTitle')}
          </h1>
        </div>
        
        <SortSelector value={sortBy} onChange={handleSortChange} />
      </div>
      
      <p className="text-gray-600 mb-8">
        {t('deals.pageSubtitle')}
      </p>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : discountedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 product-grid-container">
          {discountedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FaFire className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">{t('deals.noDeals')}</h3>
          <p className="text-gray-500">{t('deals.noDealsText')}</p>
        </div>
      )}
    </div>
  );
};

export default HotDealsPage;