import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import LogoImage from '../../assets/logo.png';

const LoginPage = () => {
  const { t } = useTranslation();
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      return;
    }
    
    const success = await login(username, password);
    if (success) {
      navigate('/admin');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={LogoImage} alt="Beauty Shop" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold text-primary">{t('admin.login')}</h1>
          <p className="text-gray-600 mt-2">{t('admin.loginSubtitle')}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <p className="font-medium">{t('common.error')}</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={`relative ${isRTL ? 'text-right' : 'text-left'}`}>
                <label htmlFor="username" className="block text-gray-700 mb-2 font-medium">
                  {t('admin.username')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('admin.usernamePlaceholder')}
                    required
                  />
                </div>
              </div>
              
              <div className={`relative ${isRTL ? 'text-right' : 'text-left'}`}>
                <label htmlFor="password" className="block text-gray-700 mb-2 font-medium">
                  {t('admin.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('admin.passwordPlaceholder')}
                    required
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  ) : (
                    <FaSignInAlt className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                  )}
                  {loading ? t('common.loading') : t('admin.loginButton')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;