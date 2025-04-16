import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { productsAPI } from '../../utils/api';
import { useLanguage } from '../../contexts/LanguageContext';

const ProductsAdminPage = () => {
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll();
        setProducts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [t]);
  
  const handleDeleteProduct = async (id) => {
    if (window.confirm(t('productAdmin.confirmDelete'))) {
      try {
        await productsAPI.delete(id);
        setProducts(products.filter(product => product.id !== id));
      } catch (err) {
        console.error('Error deleting product:', err);
        alert(t('common.error'));
      }
    }
  };
  
  return (
    <div>
      <div className={`flex justify-between items-center mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h1 className="text-2xl font-bold">
          {t('productAdmin.title')}
        </h1>
        <Link
          to="/admin/products/add"
          className="btn btn-primary flex items-center"
        >
          <FaPlus className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('productAdmin.addProduct')}
        </Link>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : (
        <>
          {products.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('common.image')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('common.name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('common.price')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('common.category')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                          <img
                            src={product.image ? `http://localhost:5000${product.image}` : 'https://via.placeholder.com/40'}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {currentLanguage === 'fr' ? product.name_fr : product.name_ar}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.price} MAD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {t(`categories.${product.category}`)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-12 text-gray-600">{t('common.noResults')}</p>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsAdminPage;