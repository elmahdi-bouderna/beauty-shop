import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaShoppingCart, FaExclamationTriangle, FaTimes, FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import io from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';

const NotificationCenter = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const audioRef = useRef(null);
  
  // Connect to socket.io when component mounts
  useEffect(() => {
    // Create audio element for notification sound
    const audio = new Audio('/notification-sound.wav'); // Add a notification sound file to your public folder
    audioRef.current = audio;
    
    // Connect to socket server
    const newSocket = io('http://localhost:5000');
    
    newSocket.on('connect', () => {
      console.log('Connected to notification server');
      
      // Authenticate as admin
      newSocket.emit('admin:authenticate', token);
    });
    
    newSocket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      
      // Ensure the notification has a timestamp
      if (!notification.timestamp) {
        notification.timestamp = new Date().toISOString();
      }
      
      // Add the notification to our state
      setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50 notifications
      
      // Increase unread count
      setUnreadCount(prev => prev + 1);
      
      // Play sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Error playing sound:', e));
      }
      
      // Show browser notification if supported and permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title || t('admin.newNotification'), {
          body: notification.message,
          icon: '/logo192.png' // Add your app icon to public folder
        });
      }
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from notification server');
    });
    
    setSocket(newSocket);
    
    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [token, t]);
  
  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark all as read when opening
      setUnreadCount(0);
    }
  };
  
  const markAllAsRead = () => {
    setUnreadCount(0);
  };
  
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <FaShoppingCart className="text-blue-500" />;
      case 'stock':
        return <FaExclamationTriangle className="text-yellow-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };
  
  const formatTime = (timestamp) => {
    try {
      if (!timestamp) return '--:--';
      
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid timestamp:', timestamp);
        return '--:--';
      }
      
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '--:--';
    }
  };
  
  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={toggleOpen}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <FaBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="p-3 bg-gray-100 border-b flex justify-between items-center">
            <h3 className="text-sm font-semibold">{t('admin.notifications')}</h3>
            <div className="flex space-x-2">
              <button 
                onClick={markAllAsRead} 
                className="text-xs text-blue-600 hover:text-blue-800"
                title={t('admin.markAllAsRead')}
              >
                <FaCheck className="h-4 w-4" />
              </button>
              <button 
                onClick={clearNotifications} 
                className="text-xs text-gray-600 hover:text-gray-800"
                title={t('admin.clearAll')}
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {t('admin.noNotifications')}
              </div>
            ) : (
              <div>
                {notifications.map((notification, index) => {
                  const formattedTime = formatTime(notification.timestamp);
                  
                  let linkTo = '';
                  if (notification.type === 'order') {
                    linkTo = `/admin/orders?status=pending`;
                  } else if (notification.type === 'stock') {
                    linkTo = `/admin/products`;
                  }
                  
                  return (
                    <Link 
                      key={index}
                      to={linkTo}
                      className="block px-4 py-3 border-b hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title || t('admin.notification')}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formattedTime}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;