import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaFire, FaArrowRight } from 'react-icons/fa';
import { productsAPI } from '../../utils/api';
import ProductCard from './ProductCard';

const HotDealsSection = ({ limit = 4 }) => {
  const { t } = useTranslation();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll();
        // Filter products with discount > 0 and limit them
        const discountedProducts = response.data.filter(product => product.discount > 0)
          .sort((a, b) => b.discount - a.discount) // Sort by highest discount first
          .slice(0, limit);
        setDeals(discountedProducts);
      } catch (err) {
        console.error('Error fetching discounted products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDiscountedProducts();
  }, [limit]);
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }
  
  // If no deals, don't render the section
  if (deals.length === 0) {
    return null;
  }
  
  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif font-bold flex items-center">
          <FaFire className="text-red-500 mr-2" />
          {t('deals.title')}
        </h2>
        <Link to="/hotdeals" className="text-primary hover:underline font-medium flex items-center">
          {t('home.viewAll')}
          <FaArrowRight className="ml-1 text-sm" />
        </Link>
      </div>
      
      <p className="text-gray-600 mb-8">
        {t('deals.subtitle')}
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 product-grid-container">
        {deals.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default HotDealsSection;