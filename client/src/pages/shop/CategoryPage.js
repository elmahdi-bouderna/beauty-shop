import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft } from 'react-icons/fa';
import { productsAPI } from '../../utils/api';
import ProductCard from '../../components/shop/ProductCard';
import SortSelector from '../../components/shop/SortSelector';
import { useLanguage } from '../../contexts/LanguageContext';

const CategoryPage = () => {
  const { t } = useTranslation();
  const { category } = useParams();
  const { isRTL } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const sortBy = searchParams.get('sort') || 'newest';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let response;
        
        if (category === 'all') {
          response = await productsAPI.getAll(sortBy);
        } else {
          response = await productsAPI.getByCategory(category, sortBy);
        }
        
        setProducts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [category, sortBy, t]);
  
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
          <h1 className="text-2xl font-serif font-bold">
            {category === 'all' 
              ? t('category.allProducts') 
              : t(`categories.${category}`)}
          </h1>
        </div>
        
        <SortSelector value={sortBy} onChange={handleSortChange} />
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 product-grid-container">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">{t('category.noProducts')}</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;