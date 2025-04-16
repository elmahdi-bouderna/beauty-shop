import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBoxes, FaImages, FaShoppingCart, FaHourglassHalf, FaTruck, FaTimesCircle } from 'react-icons/fa';
import { productsAPI, bannersAPI, ordersAPI } from '../../utils/api';
import { useLanguage } from '../../contexts/LanguageContext';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [stats, setStats] = useState({
    products: 0,
    banners: 0,
    activeOrders: 0,
    ordersByStatus: {
      pending: 0,
      confirmed: 0,
      delivered: 0,
      cancelled: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch stats in parallel
        const [productsRes, bannersRes, ordersRes] = await Promise.all([
          productsAPI.getAll(),
          bannersAPI.getAll(),
          ordersAPI.getAll(),
        ]);
        
        // Calculate active orders (pending + confirmed)
        const orders = ordersRes.data;
        const ordersByStatus = {
          pending: orders.filter(order => order.status === 'pending').length,
          confirmed: orders.filter(order => order.status === 'confirmed').length,
          delivered: orders.filter(order => order.status === 'delivered').length,
          cancelled: orders.filter(order => order.status === 'cancelled').length
        };
        
        const activeOrders = ordersByStatus.pending + ordersByStatus.confirmed;
        
        setStats({
          products: productsRes.data.length,
          banners: bannersRes.data.length,
          activeOrders,
          ordersByStatus
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [t]);
  
  // Dashboard cards data
  const cards = [
    {
      title: t('admin.products'),
      count: stats.products,
      icon: <FaBoxes className="h-12 w-12" />,
      link: '/admin/products',
      color: 'bg-blue-500',
    },
    {
      title: t('admin.banners'),
      count: stats.banners,
      icon: <FaImages className="h-12 w-12" />,
      link: '/admin/banners',
      color: 'bg-purple-500',
    },
    {
      title: t('admin.activeOrders'),
      count: stats.activeOrders,
      icon: <FaShoppingCart className="h-12 w-12" />,
      link: '/admin/orders',
      color: 'bg-green-500',
    },
  ];
  
  // Order status breakdown cards
  const orderStatusCards = [
    {
      title: t('orderStatus.pending'),
      count: stats.ordersByStatus.pending,
      icon: <FaHourglassHalf className="h-6 w-6" />,
      link: '/admin/orders?status=pending',
      color: 'bg-yellow-500',
    },
    {
      title: t('orderStatus.confirmed'),
      count: stats.ordersByStatus.confirmed,
      icon: <FaShoppingCart className="h-6 w-6" />,
      link: '/admin/orders?status=confirmed',
      color: 'bg-blue-500',
    },
    {
      title: t('orderStatus.delivered'),
      count: stats.ordersByStatus.delivered,
      icon: <FaTruck className="h-6 w-6" />,
      link: '/admin/orders?status=delivered',
      color: 'bg-green-500',
    },
    {
      title: t('orderStatus.cancelled'),
      count: stats.ordersByStatus.cancelled,
      icon: <FaTimesCircle className="h-6 w-6" />,
      link: '/admin/orders?status=cancelled',
      color: 'bg-red-500',
    },
  ];
  
  return (
    <div>
      <h1 className={`text-2xl font-bold mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
        {t('admin.dashboard')}
      </h1>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : (
        <>
          {/* Main stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {cards.map((card) => (
              <Link
                key={card.title}
                to={card.link}
                className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`${card.color} rounded-full p-3 text-white`}>
                      {card.icon}
                    </div>
                    <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
                      <h3 className="text-lg font-semibold text-gray-700">
                        {card.title}
                      </h3>
                      <p className="text-4xl font-bold">{card.count}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Order status breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className={`text-xl font-bold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('admin.orderStatusBreakdown')}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {orderStatusCards.map((card) => (
                <Link
                  key={card.title}
                  to={card.link}
                  className="block bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className={`flex items-center ${isRTL ? 'justify-end' : 'justify-start'} mb-2`}>
                    <div className={`${card.color} rounded-full p-2 text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                      {card.icon}
                    </div>
                    <h3 className="font-medium text-gray-700">
                      {card.title}
                    </h3>
                  </div>
                  <p className={`text-2xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                    {card.count}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;