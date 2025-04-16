import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaImages, FaImage } from 'react-icons/fa';
import { bannersAPI } from '../../utils/api';
import { useLanguage } from '../../contexts/LanguageContext';

const BannersAdminPage = () => {
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguage();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await bannersAPI.getAll();
        setBanners(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching banners:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchBanners();
  }, [t]);
  
  const handleDeleteBanner = async (id) => {
    if (window.confirm(t('bannerAdmin.confirmDelete'))) {
      try {
        await bannersAPI.delete(id);
        setBanners(banners.filter(banner => banner.id !== id));
      } catch (err) {
        console.error('Error deleting banner:', err);
        alert(t('common.error'));
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await bannersAPI.update(id, { active: !currentStatus });
      setBanners(banners.map(banner => 
        banner.id === id ? { ...banner, active: !banner.active } : banner
      ));
    } catch (err) {
      console.error('Error updating banner status:', err);
      alert(t('common.error'));
    }
  };
  
  return (
    <div>
      <div className="mb-8 pb-5 border-b border-gray-200">
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div>
            <h1 className="text-2xl font-serif font-bold">
              {t('bannerAdmin.title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('bannerAdmin.description')}
            </p>
          </div>
          <Link
            to="/admin/banners/add"
            className="py-2 px-6 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center transition-colors shadow-md"
          >
            <FaPlus className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('bannerAdmin.addBanner')}
          </Link>
        </div>
      </div>
      
      {/* Banner explanation */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaImages className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">{t('bannerAdmin.carousel')}</h3>
            <p className="text-sm text-blue-700 mt-1">{t('bannerAdmin.carouselDescription')}</p>
          </div>
        </div>
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
          {banners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((banner) => (
                <div key={banner.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={banner.image ? `http://localhost:5000${banner.image}` : 'https://via.placeholder.com/400x200'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} flex space-x-2`}>
                      <button
                        onClick={() => handleToggleActive(banner.id, banner.active)}
                        className={`p-2 rounded-full shadow-md transition-colors ${
                          banner.active 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-white text-gray-400 hover:bg-gray-200'
                        }`}
                        title={banner.active ? t('common.active') : t('common.inactive')}
                      >
                        {banner.active ? <FaEye /> : <FaEyeSlash />}
                      </button>
                      <Link
                        to={`/admin/banners/${banner.id}`}
                        className="bg-white p-2 rounded-full shadow-md hover:bg-blue-500 hover:text-white transition-colors"
                        title={t('common.edit')}
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="bg-white p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors"
                        title={t('common.delete')}
                      >
                        <FaTrash />
                      </button>
                    </div>
                    
                    {/* Status badge */}
                    <div className={`absolute bottom-3 left-3 ${
                      banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    } text-xs px-2 py-1 rounded-full`}>
                      {banner.active ? t('common.active') : t('common.inactive')}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-1">
                      {currentLanguage === 'fr' ? banner.title_fr : banner.title_ar}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {currentLanguage === 'fr' ? banner.subtitle_fr : banner.subtitle_ar}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <FaImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">{t('common.noResults')}</p>
              <Link
                to="/admin/banners/add"
                className="py-2 px-6 bg-primary text-white rounded-full inline-flex items-center"
              >
                <FaPlus className="mr-2" />
                {t('bannerAdmin.addBanner')}
              </Link>
            </div>
          )}
        </>
      )}
      
      {/* Preview on homepage section */}
      {banners.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-medium mb-4">{t('bannerAdmin.previewOnHomepage')}</h3>
          <Link 
            to="/" 
            target="_blank"
            className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
          >
            <FaEye className="mr-2" />
            {t('bannerAdmin.viewOnHomepage')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default BannersAdminPage;