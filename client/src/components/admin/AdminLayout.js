import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaTachometerAlt, FaBoxes, FaImages, FaShoppingCart, FaSignOutAlt, FaUserCircle, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ordersAPI } from '../../utils/api';
import LogoImage from '../../assets/logo.png';
import NotificationCenter from './NotificationCenter'; // Import the notification center

const AdminLayout = ({ children }) => {
  const { t } = useTranslation();
  const { logout, currentAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL } = useLanguage();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeOrders, setActiveOrders] = useState(0);
  
  // Fetch active orders count
  useEffect(() => {
    const fetchActiveOrders = async () => {
      try {
        const response = await ordersAPI.getActiveCount();
        setActiveOrders(response.data.count);
      } catch (err) {
        console.error('Failed to fetch active orders count:', err);
      }
    };
    
    fetchActiveOrders();
    
    // Set up refresh interval (every 5 minutes)
    const interval = setInterval(fetchActiveOrders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  
  // Menu items
  const menuItems = [
    { path: '/admin', label: t('admin.dashboard'), icon: <FaTachometerAlt /> },
    { path: '/admin/products', label: t('admin.products'), icon: <FaBoxes /> },
    { path: '/admin/banners', label: t('admin.banners'), icon: <FaImages /> },
    { 
      path: '/admin/orders', 
      label: t('admin.orders'), 
      icon: <FaShoppingCart />,
      badge: activeOrders > 0 ? activeOrders : null
    },
  ];
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin header bar */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src={LogoImage} alt="Logo" className="h-10 w-auto mr-3" />
              <h1 className="text-xl font-serif font-bold text-primary">
                {t('admin.adminPanel')}
              </h1>
            </div>
            
            {/* Header actions */}
            <div className="flex items-center space-x-4">
              {/* Add the notification center here */}
              <NotificationCenter />
              
              {/* User dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-3 bg-gray-100 hover:bg-gray-200 rounded-full py-2 px-4 focus:outline-none transition-colors"
                >
                  <FaUserCircle className="text-gray-600 h-6 w-6" />
                  <span className="font-medium">{currentAdmin?.username}</span>
                  <FaChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                    >
                      <FaSignOutAlt className="mr-2" />
                      {t('admin.logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="bg-white rounded-xl shadow-md p-6 md:col-span-1">
            <nav className={`space-y-3 ${isRTL ? 'text-right' : 'text-left'}`}>
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center py-3 px-4 rounded-lg transition-all ${
                    location.pathname === item.path 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  <div className={`flex items-center w-full ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                    <span className={`${isRTL ? 'ml-3' : 'mr-3'}`}>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span 
                        className={`ml-2 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1 ${
                          location.pathname === item.path ? 'bg-white text-primary' : ''
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
              
              {/* Mobile logout button - visible only on small screens */}
              <button
                onClick={handleLogout}
                className="flex md:hidden items-center w-full py-3 px-4 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors mt-6"
              >
                <div className={`flex items-center w-full ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <span className={`${isRTL ? 'ml-3' : 'mr-3'}`}><FaSignOutAlt /></span>
                  <span className="font-medium">{t('admin.logout')}</span>
                </div>
              </button>
            </nav>
          </div>
          
          {/* Content */}
          <div className="bg-white rounded-xl shadow-md p-6 md:col-span-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;