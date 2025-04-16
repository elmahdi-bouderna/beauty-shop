import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../contexts/CartContext';
import { ordersAPI } from '../../utils/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';

const CheckoutPage = () => {
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguage();
  const { cart, calculateTotalPrice, clearCart, formatOrderItems } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address) {
      setError(t('checkout.fillAllFields'));
      return;
    }
    
    if (cart.length === 0) {
      setError(t('checkout.emptyCart'));
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Format order items for API submission
      const orderItems = formatOrderItems();
      
      // Create order
      const orderData = {
        ...formData,
        items: orderItems
      };
      
      await ordersAPI.create(orderData);
      
      setSubmitted(true);
      clearCart();
      
      // Redirect to thank you page after 2 seconds
      setTimeout(() => {
        navigate('/checkout/success');
      }, 2000);
      
    } catch (err) {
      console.error('Error creating order:', err);
      setError(t('checkout.error'));
    } finally {
      setLoading(false);
    }
  };
  
  // Format price with 2 decimal places
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };
  
  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-green-100 text-green-700 p-4 rounded-md mb-6">
            <h2 className="text-xl font-bold mb-2">{t('checkout.orderReceived')}</h2>
            <p>{t('checkout.redirecting')}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (cart.length === 0 && !submitted) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 p-8 rounded-lg">
            <FaShoppingCart className="text-gray-400 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">{t('checkout.emptyCart')}</h2>
            <p className="text-gray-600 mb-6">{t('checkout.addItemsToCart')}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-primary text-white rounded-md"
            >
              {t('checkout.continueShopping')}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center text-gray-600 hover:text-primary ${isRTL ? 'mr-auto' : 'ml-0'}`}
        >
          <FaArrowLeft className={`${isRTL ? 'ml-2 transform rotate-180' : 'mr-2'}`} />
          {t('checkout.back')}
        </button>
      </div>
      
      <h1 className={`text-3xl font-serif font-bold mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
        {t('checkout.title')}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order summary */}
        <div className="lg:col-span-1 order-2 lg:order-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className={`text-xl font-bold mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('checkout.orderSummary')}
            </h2>
            
            <div className="space-y-4 mb-6">
              {cart.map((item) => {
                const name = currentLanguage === 'fr' ? item.name_fr : item.name_ar;
                const price = parseFloat(item.price) || 0;
                const discount = parseFloat(item.discount || 0);
                const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
                
                return (
                  <div key={`${item.id}-${item.selectedColor?.id || ''}`} className="flex border-b border-gray-200 pb-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img 
                        src={
                          item.selectedColor && item.selectedColor.image
                            ? `http://localhost:5000${item.selectedColor.image}`
                            : `http://localhost:5000${item.image}`
                        }
                        alt={name} 
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    
                    <div className={`ml-4 flex flex-1 flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{name}</h3>
                          <p className="ml-4">{formatPrice(finalPrice * item.quantity)} MAD</p>
                        </div>
                        {discount > 0 && (
                          <p className="mt-1 text-sm line-through text-gray-500">{formatPrice(price * item.quantity)} MAD</p>
                        )}
                        {item.selectedColor && (
                          <div className="mt-1 flex items-center">
                            <span 
                              className="w-3 h-3 rounded-full mr-1" 
                              style={{ backgroundColor: item.selectedColor.hex_code }}
                            ></span>
                            <span className="text-sm text-gray-500">
                              {currentLanguage === 'fr' ? item.selectedColor.name_fr : item.selectedColor.name_ar}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <p>{t('cart.quantity')}: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>{t('checkout.total')}</p>
                <p>{formatPrice(calculateTotalPrice())} MAD</p>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {t('checkout.shippingNote')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Checkout form */}
        <div className="lg:col-span-2 order-1 lg:order-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className={`text-xl font-bold mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('checkout.shippingInfo')}
            </h2>
            
            {error && (
              <div className="bg-red-100 p-4 rounded-md text-red-700 mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className={`grid grid-cols-1 gap-6 mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.fullName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-primary"
                    required
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.phone')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-primary"
                    required
                    dir="ltr"
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.address')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-primary"
                    required
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.notes')}
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-primary"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t('checkout.processing')}
                  </div>
                ) : (
                  t('checkout.placeOrder')
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;