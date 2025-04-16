import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaCheck, FaTruck, FaTimesCircle } from 'react-icons/fa';
import { ordersAPI } from '../../utils/api';
import { useLanguage } from '../../contexts/LanguageContext';

const OrderDetailsModal = ({ order, onClose, onUpdateStatus, updatingOrderId }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        setLoading(true);
        const response = await ordersAPI.getOrderItems(order.id);
        setOrderItems(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching order items:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderItems();
  }, [order.id, t]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5);
  };
  
  // Helper function to safely format prices
  const formatPrice = (price) => {
    // Ensure price is a number
    const numPrice = typeof price === 'number' ? price : parseFloat(price || 0);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  
  // Calculate order total - make sure we use the stored price in the order_items table
  // which should already include any discount
  const orderTotal = orderItems.reduce((total, item) => {
    const itemPrice = parseFloat(item.price || 0);
    return total + (itemPrice * item.quantity);
  }, 0);
  
  // Get action buttons based on order status
  const renderActionButtons = () => {
    const isUpdating = updatingOrderId === order.id;
    
    switch (order.status) {
      case 'pending':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onUpdateStatus(order.id, 'confirmed')}
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
            >
              {isUpdating ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : (
                <FaCheck className="mr-2" />
              )}
              {t('ordersAdmin.confirm')}
            </button>
            <button
              onClick={() => onUpdateStatus(order.id, 'cancelled')}
              disabled={isUpdating}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
            >
              {isUpdating ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : (
                <FaTimesCircle className="mr-2" />
              )}
              {t('ordersAdmin.cancel')}
            </button>
          </div>
        );
        
      case 'confirmed':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onUpdateStatus(order.id, 'delivered')}
              disabled={isUpdating}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
            >
              {isUpdating ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : (
                <FaTruck className="mr-2" />
              )}
              {t('ordersAdmin.markDelivered')}
            </button>
            <button
              onClick={() => onUpdateStatus(order.id, 'cancelled')}
              disabled={isUpdating}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
            >
              {isUpdating ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : (
                <FaTimesCircle className="mr-2" />
              )}
              {t('ordersAdmin.cancel')}
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">
            {t('ordersAdmin.orderDetails')} #{order.id}
            {order.order_source === 'whatsapp' && (
              <span className="ml-2 text-sm bg-green-100 text-green-800 py-1 px-2 rounded-full">
                {t('ordersAdmin.viaWhatsApp')}
              </span>
            )}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">{t('ordersAdmin.customerInfo')}</h3>
              <p className="font-medium">{order.name}</p>
              <p>{order.phone}</p>
              {order.address && <p className="whitespace-pre-line">{order.address}</p>}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">{t('ordersAdmin.orderInfo')}</h3>
              <p>
                <span className="font-medium">{t('ordersAdmin.orderDate')}: </span>
                {formatDate(order.order_date)}
              </p>
              {order.completed_date && (
                <p>
                  <span className="font-medium">{t('ordersAdmin.completedDate')}: </span>
                  {formatDate(order.completed_date)}
                </p>
              )}
              <p className="mt-1">
                <span className="font-medium">{t('ordersAdmin.status')}: </span>
                <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                  {t(`orderStatus.${order.status}`)}
                </span>
              </p>
            </div>
          </div>
          
          {order.notes && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{t('ordersAdmin.notes')}</h3>
              <p className="bg-gray-50 p-3 rounded whitespace-pre-line">{order.notes}</p>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('ordersAdmin.orderItems')}</h3>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : error ? (
              <div className="text-center py-4 text-red-600">{error}</div>
            ) : (
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('ordersAdmin.product')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('ordersAdmin.price')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('ordersAdmin.quantity')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('ordersAdmin.subtotal')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderItems.map((item) => {
                      const productName = currentLanguage === 'fr' ? item.name_fr : item.name_ar;
                      // Use the stored price in the order_items table which already includes any discount
                      const itemPrice = parseFloat(item.price || 0);
                      const subtotal = itemPrice * item.quantity;
                      
                      return (
                        <tr key={item.id}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                {item.image ? (
                                  <img 
                                    src={`http://localhost:5000${item.image}`} 
                                    alt={productName} 
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gray-200" />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{productName}</div>
                                {/* Display color if available */}
                                {item.color_name_fr && (
                                  <div className="text-xs text-gray-500 flex items-center mt-1">
                                    <span 
                                      className="inline-block w-3 h-3 rounded-full mr-1" 
                                      style={{ backgroundColor: item.color_hex || '#ccc' }}
                                    ></span>
                                    {currentLanguage === 'fr' ? item.color_name_fr : item.color_name_ar}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                            <div className="text-gray-900">{formatPrice(itemPrice)} MAD</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            {formatPrice(subtotal)} MAD
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {t('ordersAdmin.total')}:
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-primary">
                        {formatPrice(orderTotal)} MAD
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
          
          {/* Action buttons for changing order status */}
          <div className="flex justify-between items-center mt-6">
            {renderActionButtons()}
            
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;