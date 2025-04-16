import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaPlus, FaMinus, FaTrash, FaChevronRight, FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ordersAPI } from '../../utils/api';

const Cart = () => {
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguage();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    calculateTotalPrice, 
    isCartOpen, 
    toggleCart, 
    clearCart,
    formatOrderItems 
  } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [showQuickCheckout, setShowQuickCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleQuantityChange = (productId, quantity, colorId = null) => {
    if (quantity < 1) return;
    updateQuantity(productId, quantity, colorId);
  };
  
  const formatWhatsAppOrder = () => {
    if (!cart.length) return '';
    
    let message = `${t('whatsapp.orderPrefix')}\n\n`;
    
    cart.forEach((item, index) => {
      const name = currentLanguage === 'fr' ? item.name_fr : item.name_ar;
      const price = item.discountedPrice || item.price;
      const colorInfo = item.selectedColor ? 
        ` (${t('product.color')}: ${currentLanguage === 'fr' ? item.selectedColor.name_fr : item.selectedColor.name_ar})` : '';
      
      message += `${index + 1}. ${name}${colorInfo} x ${item.quantity} = ${(price * item.quantity).toFixed(2)} MAD\n`;
    });
    
    message += `\n${t('cart.total')}: ${calculateTotalPrice().toFixed(2)} MAD`;
    
    return encodeURIComponent(message);
  };
  
  const handleWhatsAppOrder = async () => {
    if (cart.length === 0) return;
    
    try {
      setWhatsappLoading(true);
      setError(null);
      
      // Create an order in the database first
      const orderItems = formatOrderItems();
      
      // Create the order data with the whatsapp source flag
      const orderData = {
        items: orderItems,
        order_source: 'whatsapp' // This is the key flag
      };
      
      // Create the order in the database
      await ordersAPI.createWhatsAppOrder(orderData);
      
      // Generate WhatsApp message
      const whatsappMessage = formatWhatsAppOrder();
      
      // Clear the cart after successful order creation
      clearCart();
      
      // Close the cart sidebar
      toggleCart();
      
      // Redirect to WhatsApp with the message
      window.open(`https://wa.me/212600000000?text=${whatsappMessage}`, '_blank');
      
    } catch (err) {
      console.error('Error creating WhatsApp order:', err);
      setError(t('cart.whatsappOrderError'));
    } finally {
      setWhatsappLoading(false);
    }
  };
  
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address) {
      setError(t('cart.fillAllFields'));
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
      
      // Clear cart and close quick checkout form
      clearCart();
      setShowQuickCheckout(false);
      toggleCart(); // Close the cart sidebar
      
      // Navigate to success page
      navigate('/checkout/success');
      
    } catch (err) {
      console.error('Error submitting order:', err);
      setError(t('cart.orderError'));
    } finally {
      setLoading(false);
    }
  };
  
  // Format price with 2 decimal places
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };
  
  // Calculate subtotal for an item
  const calculateItemSubtotal = (item) => {
    const price = parseFloat(item.discountedPrice || item.price) || 0;
    return price * item.quantity;
  };
  
  return (
    <>
      {/* Cart overlay - visible when cart is open */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleCart}
        ></div>
      )}
      
      {/* Cart sidebar */}
      <div 
        className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-full sm:w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : `${isRTL ? '-translate-x-full' : 'translate-x-full'}`
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold">{t('cart.title')}</h2>
            <button 
              onClick={toggleCart}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <svg 
                className="w-16 h-16 text-gray-300 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                ></path>
              </svg>
              <p className="text-gray-500 text-center">{t('cart.empty')}</p>
              <button 
                onClick={toggleCart}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                {t('cart.continueShopping')}
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {cart.map(item => {
                    const name = currentLanguage === 'fr' ? item.name_fr : item.name_ar;
                    const colorId = item.selectedColor?.id;
                    const imageUrl = item.selectedColor && item.selectedColor.image
                      ? `http://localhost:5000${item.selectedColor.image}`
                      : `http://localhost:5000${item.image}`;
                    
                    return (
                      <div 
                        key={`${item.id}-${colorId || ''}`} 
                        className="flex border-b border-gray-200 pb-4"
                      >
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img 
                            src={imageUrl} 
                            alt={name} 
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        
                        <div className={`ml-4 flex flex-1 flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>{name}</h3>
                              <p className="ml-4">{formatPrice(calculateItemSubtotal(item))} MAD</p>
                            </div>
                            {item.discountedPrice && (
                              <p className="mt-1 text-xs text-gray-500 line-through">
                                {formatPrice(item.price * item.quantity)} MAD
                              </p>
                            )}
                            {item.selectedColor && (
                              <div className="mt-1 flex items-center">
                                <span 
                                  className="w-3 h-3 rounded-full mr-1" 
                                  style={{ backgroundColor: item.selectedColor.hex_code }}
                                ></span>
                                <span className="text-xs text-gray-500">
                                  {currentLanguage === 'fr' ? item.selectedColor.name_fr : item.selectedColor.name_ar}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-1 items-end justify-between text-sm">
                            <div className="flex items-center border rounded-md">
                              <button 
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1, colorId)}
                                className="px-2 py-1 text-gray-600 hover:text-gray-800"
                              >
                                <FaMinus className="h-3 w-3" />
                              </button>
                              <span className="px-2 text-gray-900">{item.quantity}</span>
                              <button 
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1, colorId)}
                                className="px-2 py-1 text-gray-600 hover:text-gray-800"
                              >
                                <FaPlus className="h-3 w-3" />
                              </button>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id, colorId)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                  <p>{t('cart.subtotal')}</p>
                  <p>{formatPrice(calculateTotalPrice())} MAD</p>
                </div>
                
                {showQuickCheckout ? (
                  <div>
                    {error && (
                      <div className="bg-red-100 p-3 rounded-md text-red-700 mb-4 text-sm">
                        {error}
                      </div>
                    )}
                    <form onSubmit={handleSubmitOrder}>
                      <div className="space-y-3 mb-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('checkout.fullName')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary text-sm"
                            required
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
                            onChange={handleInputChange}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary text-sm"
                            required
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
                            onChange={handleInputChange}
                            rows="2"
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary text-sm"
                            required
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
                            onChange={handleInputChange}
                            rows="2"
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <button
                          type="submit"
                          className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              {t('common.processing')}
                            </div>
                          ) : (
                            t('cart.confirmOrder')
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setShowQuickCheckout(false)}
                          className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/checkout"
                      className="flex w-full items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark"
                      onClick={toggleCart}
                    >
                      {t('cart.checkout')}
                      <FaChevronRight className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'} ${isRTL ? 'transform rotate-180' : ''}`} />
                    </Link>
                    
                    <button
                      onClick={() => setShowQuickCheckout(true)}
                      className="flex w-full items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-primary bg-white border-primary hover:bg-gray-50"
                    >
                      {t('cart.quickCheckout')}
                    </button>
                    
                    <button
                      onClick={handleWhatsAppOrder}
                      disabled={whatsappLoading}
                      className="flex w-full items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      {whatsappLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          {t('common.processing')}
                        </div>
                      ) : (
                        <>
                          <FaWhatsapp className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {t('cart.orderViaWhatsApp')}
                        </>
                      )}
                    </button>
                    
                    {error && (
                      <div className="bg-red-100 p-3 rounded-md text-red-700 text-sm">
                        {error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;