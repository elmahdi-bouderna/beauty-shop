import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCheckCircle, FaHome, FaShoppingBag } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const CheckoutSuccessPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <FaCheckCircle className="mx-auto h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-serif font-bold mb-4">{t('checkoutSuccess.title')}</h1>
        
        <p className="text-gray-600 mb-8">
          {t('checkoutSuccess.message')}
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-gray-600 mb-4">
            {t('checkoutSuccess.contactMessage')}
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="https://wa.me/212600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800"
            >
              WhatsApp
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="tel:+212600000000"
              className="text-blue-600 hover:text-blue-800"
            >
              {t('checkoutSuccess.callUs')}
            </a>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link 
            to="/" 
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center justify-center"
          >
            <FaHome className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('checkoutSuccess.returnHome')}
          </Link>
          <Link 
            to="/category/all" 
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center justify-center"
          >
            <FaShoppingBag className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('checkoutSuccess.continueShopping')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;