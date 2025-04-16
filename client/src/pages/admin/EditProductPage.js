import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaSave, FaArrowLeft, FaImage, FaCheck, FaTimes, FaPalette } from 'react-icons/fa';
import { productsAPI } from '../../utils/api';
import { useLanguage } from '../../contexts/LanguageContext';
import ColorManager from '../../components/admin/ColorManager';

const EditProductPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    name_fr: '',
    name_ar: '',
    desc_fr: '',
    desc_ar: '',
    price: '',
    discount: 0,
    category: '',
    stock: 0,
    image: null,
  });
  
  const [colors, setColors] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' or 'colors'
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (isEditing) {
        try {
          setInitialLoading(true);
          
          // Fetch product data
          const productRes = await productsAPI.getById(id);
          const product = productRes.data;
          
          setFormData({
            name_fr: product.name_fr || '',
            name_ar: product.name_ar || '',
            desc_fr: product.desc_fr || '',
            desc_ar: product.desc_ar || '',
            price: product.price || '',
            discount: product.discount || 0,
            category: product.category || '',
            stock: product.stock || 0,
          });
          
          if (product.image) {
            setPreviewImage(`http://localhost:5000${product.image}`);
          }
          
          // Fetch product colors
          const colorsRes = await productsAPI.getProductColors(id);
          setColors(colorsRes.data);
          
          setError(null);
        } catch (err) {
          console.error('Error fetching product:', err);
          setError(t('common.error'));
        } finally {
          setInitialLoading(false);
        }
      } else {
        setInitialLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, isEditing, t]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For numeric fields, ensure we're passing numbers not strings
    if (name === 'price' || name === 'discount' || name === 'stock') {
      const numValue = type === 'checkbox' ? checked : parseFloat(value) || 0;
      setFormData({ ...formData, [name]: numValue });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
    
    // Reset success message when form changes
    setSuccess(false);
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
      setSuccess(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      
      // Add basic product info
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'image' && formData[key] instanceof File) {
          formDataToSend.append('image', formData[key]);
        } else if (value !== undefined && value !== null) {
          formDataToSend.append(key, String(value));
        }
      });
      
      // Add colors info as JSON string
      formDataToSend.append('colors', JSON.stringify(
        colors.map(color => ({
          ...color,
          // Don't send File objects in JSON
          image: color.image instanceof File ? null : color.image
        }))
      ));
      
      // Add color images if they exist
      colors.forEach((color, index) => {
        if (color.image instanceof File) {
          formDataToSend.append(`colorImage_${index}`, color.image);
          formDataToSend.append(`colorImageIndex_${index}`, index);
          formDataToSend.append(`colorId_${index}`, color.id || '');
        }
      });
      
      let result;
      if (isEditing) {
        result = await productsAPI.update(id, formDataToSend);
      } else {
        // For new products, image is required
        if (!formData.image) {
          setError(t('productAdmin.imageRequired'));
          setLoading(false);
          return;
        }
        result = await productsAPI.create(formDataToSend);
      }
      
      setSuccess(true);
      
      // Navigate after a slight delay to show success message
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
      
    } catch (err) {
      console.error('Error saving product:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-3 text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8 pb-5 border-b border-gray-200">
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h1 className="text-2xl font-serif font-bold">
            {isEditing ? t('productAdmin.editProduct') : t('productAdmin.addProduct')}
          </h1>
          <Link
            to="/admin/products"
            className="btn btn-outline flex items-center"
          >
            <FaArrowLeft className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('common.back')}
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
          <FaTimes className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md flex items-center">
          <FaCheck className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{t('common.saveSuccess')}</p>
        </div>
      )}
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'basic' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('basic')}
          >
            {t('productAdmin.basicInfo')}
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'colors' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('colors')}
          >
            <FaPalette className="inline-block mr-1" />
            {t('productAdmin.colorOptions')}
          </button>
        </nav>
      </div>
      
      <form onSubmit={handleSubmit}>
        {activeTab === 'basic' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <label htmlFor="name_fr" className="block mb-2 font-medium">
                {t('productAdmin.nameFr')}
              </label>
              <input
                type="text"
                id="name_fr"
                name="name_fr"
                value={formData.name_fr}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <label htmlFor="name_ar" className="block mb-2 font-medium">
                {t('productAdmin.nameAr')}
              </label>
              <input
                type="text"
                id="name_ar"
                name="name_ar"
                value={formData.name_ar}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
                dir="rtl"
              />
            </div>
            
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <label htmlFor="desc_fr" className="block mb-2 font-medium">
                {t('productAdmin.descriptionFr')}
              </label>
              <textarea
                id="desc_fr"
                name="desc_fr"
                value={formData.desc_fr}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <label htmlFor="desc_ar" className="block mb-2 font-medium">
                {t('productAdmin.descriptionAr')}
              </label>
              <textarea
                id="desc_ar"
                name="desc_ar"
                value={formData.desc_ar}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                dir="rtl"
              />
            </div>
            
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <label htmlFor="price" className="block mb-2 font-medium">
                {t('productAdmin.price')} (MAD)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <label htmlFor="discount" className="block mb-2 font-medium">
                {t('productAdmin.discount')} (%)
              </label>
              <input
                type="number"
                id="discount"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">{t('productAdmin.discountHint')}</p>
            </div>
            
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <label htmlFor="category" className="block mb-2 font-medium">
                {t('productAdmin.category')}
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="" disabled>{t('productAdmin.selectCategory')}</option>
                <option value="bags">{t('categories.bags')}</option>
                <option value="perfumes">{t('categories.perfumes')}</option>
                <option value="cosmetics">{t('categories.cosmetics')}</option>
                <option value="wallets">{t('categories.wallets')}</option>
                <option value="accessories">{t('categories.accessories')}</option>
              </select>
            </div>
            
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <label htmlFor="stock" className="block mb-2 font-medium">
                {t('productAdmin.stock')}
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {colors.length > 0 ? t('productAdmin.stockPerColorNote') : ''}
              </p>
            </div>
            
            <div className={`md:col-span-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              <label htmlFor="image" className="block mb-2 font-medium">
                {t('productAdmin.image')}
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {!previewImage ? (
                  <div className="space-y-2">
                    <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-500">{t('productAdmin.dragImage')}</p>
                    <label className="btn btn-outline cursor-pointer inline-block">
                      <span>{t('productAdmin.browseFiles')}</span>
                      <input
                        type="file"
                        id="image"
                        name="image"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                        required={!isEditing}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">{t('productAdmin.imageHint')}</p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded"
                    />
                    <div className="mt-3 flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData({ ...formData, image: null });
                        }}
                        className="text-red-500 text-sm underline"
                      >
                        {t('common.remove')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Discount preview */}
            {formData.discount > 0 && (
              <div className="md:col-span-2 mt-4 p-4 border border-dashed border-gray-300 rounded-md">
                <h3 className="text-lg font-medium mb-2">{t('productAdmin.discountPreview')}</h3>
                <div className="flex items-center">
                  <div className="mr-4">
                    <p className="text-gray-600">{t('productAdmin.originalPrice')}: <span className="line-through">{formData.price} MAD</span></p>
                    <p className="text-primary font-bold">
                      {t('productAdmin.discountedPrice')}: {(formData.price * (1 - formData.discount/100)).toFixed(2)} MAD
                    </p>
                  </div>
                  <div className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                    -{formData.discount}%
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <ColorManager 
              colors={colors} 
              onChange={setColors}
            />
            
            {colors.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      {t('productAdmin.colorStockNote')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className={`mt-8 ${isRTL ? 'text-left' : 'text-right'}`}>
          <button
            type="submit"
            className={`px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                {t('common.saving')}
              </>
            ) : (
              <>
                <FaSave className={`inline ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('common.save')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;