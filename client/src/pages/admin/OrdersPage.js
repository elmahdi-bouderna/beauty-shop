import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaEye, 
  FaCheck, 
  FaTruck, 
  FaTimesCircle,
  FaDownload, 
  FaFileExcel, 
  FaFilePdf, 
  FaFileWord, 
  FaFilter, 
  FaTimes, 
  FaCalendarAlt,
  FaSearch
} from 'react-icons/fa';
import { ordersAPI } from '../../utils/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';

const OrdersPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [orderIdFilter, setOrderIdFilter] = useState('');
  
  // Export state
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportLoading, setExportLoading] = useState(false);
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  // Status update loading state
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  
  // Order data state
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersAPI.getAll();
        setOrders(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [t]);
  
  // Apply filters when filter state or orders change
  useEffect(() => {
    if (!orders.length) {
      setFilteredOrders([]);
      return;
    }
    
    let filtered = [...orders];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Apply date filters
    if (startDate) {
      filtered = filtered.filter(order => new Date(order.order_date) >= startDate);
    }
    
    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filtered = filtered.filter(order => new Date(order.order_date) < nextDay);
    }
    
    // Apply order ID filter
    if (orderIdFilter.trim()) {
      filtered = filtered.filter(order => order.id.toString() === orderIdFilter.trim());
    }
    
    setFilteredOrders(filtered);
  }, [orders, statusFilter, startDate, endDate, orderIdFilter]);
  
  // Update URL when status filter changes
  useEffect(() => {
    if (statusFilter === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', statusFilter);
    }
    setSearchParams(searchParams);
  }, [statusFilter, searchParams, setSearchParams]);
  
  // Handler for status filter change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };
  
  // Handler for clearing date filters
  const handleClearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };
  
  // View order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };
  
  // Close order details modal
  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };
  
  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      
      await ordersAPI.updateStatus(orderId, newStatus);
      
      // Update the orders list with new status
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, completed_date: newStatus === 'delivered' ? new Date().toISOString() : order.completed_date } 
            : order
        )
      );
      
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(t('ordersAdmin.statusUpdateError'));
    } finally {
      setUpdatingOrderId(null);
    }
  };
  
  // Export orders in selected format
  const handleExport = (formatType) => {
    try {
      setExportLoading(true);
      toast.info(t('admin.preparingExport'));
      
      // Create direct download URL with query parameters
      const params = new URLSearchParams();
      params.append('format', formatType || exportFormat);
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (startDate) {
        params.append('startDate', format(startDate, 'yyyy-MM-dd'));
      }
      
      if (endDate) {
        params.append('endDate', format(endDate, 'yyyy-MM-dd'));
      }
      
      if (orderIdFilter.trim()) {
        params.append('orderId', orderIdFilter.trim());
      }
      
      // Add auth token
      params.append('token', localStorage.getItem('token'));
      
      // Get the base API URL
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Check if apiBaseUrl already ends with /api to prevent duplication
      const hasApiPath = apiBaseUrl.endsWith('/api');
      
      // Construct URL without duplicating /api
      const downloadUrl = hasApiPath 
        ? `${apiBaseUrl}/orders/export?${params.toString()}`
        : `${apiBaseUrl}/api/orders/export?${params.toString()}`;
      
      console.log('Download URL:', downloadUrl); // Debug: Log the URL
      
      // Open in a new tab for direct download
      window.open(downloadUrl, '_blank');
      
      setTimeout(() => {
        setExportLoading(false);
        toast.success(t('admin.exportSuccess'));
        setShowExportOptions(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error exporting orders:', err);
      toast.error(t('admin.exportError'));
      setExportLoading(false);
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get available actions based on order status
  const getOrderActions = (order) => {
    const actions = [];
    
    // View action is always available
    actions.push(
      <button
        key="view"
        onClick={() => handleViewOrder(order)}
        className="text-blue-600 hover:text-blue-800 mx-1"
        title={t('ordersAdmin.view')}
      >
        <FaEye />
      </button>
    );
    
    // Actions based on status
    switch (order.status) {
      case 'pending':
        actions.push(
          <button
            key="confirm"
            onClick={() => handleUpdateStatus(order.id, 'confirmed')}
            className="text-blue-600 hover:text-blue-800 mx-1"
            title={t('ordersAdmin.confirm')}
            disabled={updatingOrderId === order.id}
          >
            {updatingOrderId === order.id ? (
              <span className="inline-block h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <FaCheck />
            )}
          </button>
        );
        break;
      
      case 'confirmed':
        actions.push(
          <button
            key="deliver"
            onClick={() => handleUpdateStatus(order.id, 'delivered')}
            className="text-green-600 hover:text-green-800 mx-1"
            title={t('ordersAdmin.markDelivered')}
            disabled={updatingOrderId === order.id}
          >
            {updatingOrderId === order.id ? (
              <span className="inline-block h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <FaTruck />
            )}
          </button>
        );
        break;
    }
    
    // Cancel action is available for pending and confirmed orders
    if (order.status === 'pending' || order.status === 'confirmed') {
      actions.push(
        <button
          key="cancel"
          onClick={() => handleUpdateStatus(order.id, 'cancelled')}
          className="text-red-600 hover:text-red-800 mx-1"
          title={t('ordersAdmin.cancel')}
          disabled={updatingOrderId === order.id}
        >
          {updatingOrderId === order.id ? (
            <span className="inline-block h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <FaTimesCircle />
          )}
        </button>
      );
    }
    
    return actions;
  };
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className={`text-2xl font-bold ${isRTL ? 'sm:text-right' : 'sm:text-left'}`}>
          {t('admin.orders')}
        </h1>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
          {/* Export button */}
          <div className="relative">
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="btn btn-primary flex items-center"
              disabled={filteredOrders.length === 0}
            >
              <FaDownload className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('admin.exportOrders')}
            </button>
            
            {/* Export options popup */}
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg z-10 border">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">{t('admin.exportOptions')}</h3>
                    <button 
                      onClick={() => setShowExportOptions(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">
                      {t('admin.exportFormat')}
                    </label>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setExportFormat('excel');
                          handleExport('excel');
                        }}
                        className={`flex-1 p-2 rounded flex items-center justify-center text-sm ${
                          exportFormat === 'excel' 
                            ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <FaFileExcel className="mr-1" /> Excel
                      </button>
                      <button 
                        onClick={() => {
                          setExportFormat('pdf');
                          handleExport('pdf');
                        }}
                        className={`flex-1 p-2 rounded flex items-center justify-center text-sm ${
                          exportFormat === 'pdf' 
                            ? 'bg-red-100 text-red-700 border-2 border-red-300' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <FaFilePdf className="mr-1" /> PDF
                      </button>
                      <button 
                        onClick={() => {
                          setExportFormat('word');
                          handleExport('word');
                        }}
                        className={`flex-1 p-2 rounded flex items-center justify-center text-sm ${
                          exportFormat === 'word' 
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <FaFileWord className="mr-1" /> Word
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col sm:flex-row justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="font-medium mb-2 flex items-center">
              <FaFilter className={`text-gray-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('admin.filterOrders')}
            </h2>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
              >
                <option value="all">{t('admin.allStatuses')}</option>
                <option value="pending">{t('orderStatus.pending')}</option>
                <option value="confirmed">{t('orderStatus.confirmed')}</option>
                <option value="delivered">{t('orderStatus.delivered')}</option>
                <option value="cancelled">{t('orderStatus.cancelled')}</option>
              </select>
              
              {/* Order ID filter input */}
              <div className="relative">
                <input
                  type="text"
                  value={orderIdFilter}
                  onChange={(e) => setOrderIdFilter(e.target.value)}
                  placeholder={t('admin.orderIdFilter') || "Order ID"}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:border-primary pl-8"
                />
                <FaSearch className="absolute left-2.5 top-3 text-gray-400" />
                {orderIdFilter && (
                  <button
                    onClick={() => setOrderIdFilter('')}
                    className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="font-medium mb-2 flex items-center">
              <FaCalendarAlt className={`text-gray-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('admin.dateRange')}
            </h2>
            
            <div className="flex flex-wrap items-center gap-2">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText={t('admin.startDate')}
                className="p-2 border border-gray-300 rounded w-32 focus:outline-none focus:border-primary"
                dateFormat="yyyy-MM-dd"
              />
              
              <span className="text-gray-500">-</span>
              
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText={t('admin.endDate')}
                className="p-2 border border-gray-300 rounded w-32 focus:outline-none focus:border-primary"
                dateFormat="yyyy-MM-dd"
              />
              
              {(startDate || endDate) && (
                <button
                  onClick={handleClearDates}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title={t('common.clear')}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Order count display */}
      <div className="mb-4 text-gray-600">
        {orderIdFilter ? 
          t('admin.showingOrderById', { id: orderIdFilter }) : 
          t('admin.showingOrders', { count: filteredOrders.length })}
      </div>
      
      {/* Orders table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : filteredOrders.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.orderId')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.customer')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.date')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.status')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  // Parse the date for formatting
                  const orderDate = new Date(order.order_date);
                  const formattedDate = format(orderDate, 'yyyy-MM-dd HH:mm');
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">#{order.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.name}</div>
                        <div className="text-sm text-gray-500">{order.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formattedDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                          {t(`orderStatus.${order.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <div className="flex items-center justify-center">
                          {getOrderActions(order)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">{t('admin.noOrders')}</p>
        </div>
      )}
      
      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={handleCloseOrderDetails} 
          onUpdateStatus={handleUpdateStatus}
          updatingOrderId={updatingOrderId}
        />
      )}
    </div>
  );
};

export default OrdersPage;