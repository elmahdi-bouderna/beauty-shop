import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaSave, FaArrowLeft, FaImage, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { bannersAPI } from '../../utils/api';
import { useLanguage } from '../../contexts/LanguageContext';

const EditBannerPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    title_fr: '',
    title_ar: '',
    subtitle_fr: '',
    subtitle_ar: '',
    active: true,
    image: null,
  });
  
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  
  useEffect(() => {
    const fetchBanner = async () => {
      if (isEditing) {
        try {
          const response = await bannersAPI.getById(id);
          const banner = response.data;
          
          setFormData({
            title_fr: banner.title_fr || '',
            title_ar: banner.title_ar || '',
            subtitle_fr: banner.subtitle_fr || '',
            subtitle_ar: banner.subtitle_ar || '',
            active: banner.active,
          });
          
          if (banner.image) {
            setPreviewImage(`http://localhost:5000${banner.image}`);
          }
          
          setError(null);
        } catch (err) {
          console.error('Error fetching banner:', err);
          setError(t('common.error'));
        } finally {
          setInitialLoading(false);
        }
      } else {
        setInitialLoading(false);
      }
    };
    
    fetchBanner();
  }, [id, isEditing, t]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    // Reset success message when form changes
    setSuccess(false);
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
      // Reset success message when form changes
      setSuccess(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      if (isEditing) {
        await bannersAPI.update(id, formData);
      } else {
        // For new banners, image is required
        if (!formData.image) {
          setError(t('bannerAdmin.imageRequired'));
          setLoading(false);
          return;
        }
        await bannersAPI.create(formData);
      }
      
      setSuccess(true);
      
      // Navigate after a slight delay to show success message
      setTimeout(() => {
        navigate('/admin/banners');
      }, 1500);
      
    } catch (err) {
      console.error('Error saving banner:', err);
      setError(t('common.error'));
      setSuccess(false);
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
            {isEditing ? t('bannerAdmin.editBanner') : t('bannerAdmin.addBanner')}
          </h1>
          <Link
            to="/admin/banners"
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <label htmlFor="title_fr" className="block mb-2 font-medium">
                  {t('bannerAdmin.titleFr')}
                </label>
                <input
                  type="text"
                  id="title_fr"
                  name="title_fr"
                  value={formData.title_fr}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <label htmlFor="title_ar" className="block mb-2 font-medium">
                  {t('bannerAdmin.titleAr')}
                </label>
                <input
                  type="text"
                  id="title_ar"
                  name="title_ar"
                  value={formData.title_ar}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  dir="rtl"
                />
              </div>
              
              <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <label htmlFor="subtitle_fr" className="block mb-2 font-medium">
                  {t('bannerAdmin.subtitleFr')}
                </label>
                <textarea
                  id="subtitle_fr"
                  name="subtitle_fr"
                  value={formData.subtitle_fr}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <label htmlFor="subtitle_ar" className="block mb-2 font-medium">
                  {t('bannerAdmin.subtitleAr')}
                </label>
                <textarea
                  id="subtitle_ar"
                  name="subtitle_ar"
                  value={formData.subtitle_ar}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  dir="rtl"
                />
              </div>
              
              <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="ml-2">{t('bannerAdmin.active')}</span>
                </label>
                <p className="text-sm text-gray-500 mt-1">{t('bannerAdmin.activeDescription')}</p>
              </div>
              
              <div className={`${isRTL ? 'text-right' : 'text-left'} md:col-span-2`}>
                <label htmlFor="image" className="block mb-2 font-medium">
                  {t('bannerAdmin.image')}
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {!previewImage ? (
                    <div className="space-y-2">
                      <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-sm text-gray-500">{t('bannerAdmin.dragImage')}</p>
                      <label className="btn btn-outline cursor-pointer inline-block">
                        <span>{t('bannerAdmin.browseFiles')}</span>
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
                      <p className="text-xs text-gray-500 mt-2">{t('bannerAdmin.imageHint')}</p>
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
            </div>
            
            <div className={`mt-8 ${isRTL ? 'text-left' : 'text-right'}`}>
              <button
                type="submit"
                className="btn btn-primary flex items-center px-8"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <FaSave className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('bannerAdmin.save')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Preview panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
            <h3 className="font-medium text-lg mb-4 flex items-center">
              <FaEye className="mr-2" />
              {t('bannerAdmin.preview')}
            </h3>
            
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="aspect-[3/1] bg-gray-200 rounded-lg overflow-hidden mb-3">
                {previewImage ? (
                  <img src={previewImage} alt="Banner preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <FaImage className="text-gray-500 h-10 w-10" />
                  </div>
                )}
              </div>
              
              <div className="bg-white p-3 rounded shadow-sm">
                <h4 className="font-bold text-lg">
                  {formData.title_fr || t('bannerAdmin.titleExample')}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.subtitle_fr || t('bannerAdmin.subtitleExample')}
                </p>
              </div>
              
              <div className="text-sm text-gray-500 mt-4">
                <p className={`${formData.active ? 'text-green-500' : 'text-red-500'} font-medium`}>
                  {formData.active ? t('bannerAdmin.activeStatus') : t('bannerAdmin.inactiveStatus')}
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              {t('bannerAdmin.previewNote')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBannerPage;