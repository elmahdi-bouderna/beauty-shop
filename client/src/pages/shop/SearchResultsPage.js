import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaArrowLeft } from 'react-icons/fa';
import { productsAPI } from '../../utils/api';
import ProductCard from '../../components/shop/ProductCard';
import SortSelector from '../../components/shop/SortSelector';

const SearchResultsPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await productsAPI.search(query, sortBy);
        setProducts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error searching products:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [query, sortBy, t]);
  
  const handleSortChange = (newSortValue) => {
    searchParams.set('sort', newSortValue);
    setSearchParams(searchParams);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <Link to="/" className="mr-4 text-gray-600 hover:text-primary">
            <FaArrowLeft />
          </Link>
          <h1 className="text-2xl font-serif font-bold flex items-center">
            <FaSearch className="mr-2 text-gray-500" />
            {t('search.resultsFor')} "{query}"
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
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">{t('search.noResults')}</h3>
          <p className="text-gray-500">{t('search.tryAgain')}</p>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;