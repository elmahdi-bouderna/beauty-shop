import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaTrash, FaTimes, FaImage } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const ColorManager = ({ colors, onChange }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [showColorForm, setShowColorForm] = useState(false);
  const [newColor, setNewColor] = useState({
    name_fr: '',
    name_ar: '',
    hex_code: '#000000',
    stock: 0,
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [editingColor, setEditingColor] = useState(null);
  
  const handleAddColor = () => {
    // Validate inputs
    if (!newColor.name_fr || !newColor.name_ar) {
      alert(t('productAdmin.colorNameRequired'));
      return;
    }
    
    if (editingColor) {
      // Update existing color
      const updatedColors = colors.map(c => 
        c.id === editingColor.id ? { ...c, ...newColor } : c
      );
      onChange(updatedColors);
    } else {
      // Add new color with a temporary ID
      const tempId = `temp-${Date.now()}`;
      onChange([...colors, { ...newColor, id: tempId, isNew: true }]);
    }
    
    // Reset form
    setNewColor({
      name_fr: '',
      name_ar: '',
      hex_code: '#000000',
      stock: 0,
      image: null
    });
    setPreviewImage(null);
    setEditingColor(null);
    setShowColorForm(false);
  };
  
  const handleEditColor = (color) => {
    setNewColor({
      name_fr: color.name_fr,
      name_ar: color.name_ar,
      hex_code: color.hex_code,
      stock: color.stock,
      image: color.image
    });
    
    if (color.image && typeof color.image === 'string') {
      setPreviewImage(`http://localhost:5000${color.image}`);
    } else {
      setPreviewImage(null);
    }
    
    setEditingColor(color);
    setShowColorForm(true);
  };
  
  const handleRemoveColor = (colorId) => {
    onChange(colors.filter(c => c.id !== colorId));
    
    // Close form if editing the removed color
    if (editingColor && editingColor.id === colorId) {
      setNewColor({
        name_fr: '',
        name_ar: '',
        hex_code: '#000000',
        stock: 0,
        image: null
      });
      setPreviewImage(null);
      setEditingColor(null);
      setShowColorForm(false);
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewColor({ ...newColor, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{t('productAdmin.colors')}</h3>
        {!showColorForm && (
          <button
            type="button"
            onClick={() => setShowColorForm(true)}
            className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center text-sm"
          >
            <FaPlus className="mr-1" />
            {t('productAdmin.addColor')}
          </button>
        )}
      </div>
      
      {/* Color list */}
      {colors.length > 0 ? (
        <div className="mb-4 space-y-2">
          {colors.map((color) => (
            <div 
              key={color.id} 
              className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div 
                  className="w-8 h-8 rounded-full border mr-3" 
                  style={{ backgroundColor: color.hex_code }}
                ></div>
                <div>
                  <div className="font-medium">{color.name_fr} / {color.name_ar}</div>
                  <div className="text-sm text-gray-500">
                    {t('productAdmin.inStock')}: {color.stock}
                  </div>
                  {color.image && (
                    <div className="text-sm text-green-600 flex items-center mt-1">
                      <FaImage className="h-3 w-3 mr-1" />
                      {t('productAdmin.hasColorImage')}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleEditColor(color)}
                  className="p-1 text-blue-500 hover:text-blue-700"
                  title={t('common.edit')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveColor(color.id)}
                  className="p-1 text-red-500 hover:text-red-700"
                  title={t('common.remove')}
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-4">{t('productAdmin.noColorsAdded')}</p>
      )}
      
      {/* Add/Edit color form */}
      {showColorForm && (
        <div className="bg-gray-50 p-4 rounded-md border mb-4">
          <div className="flex justify-between mb-4">
            <h4 className="font-medium">
              {editingColor ? t('productAdmin.editColor') : t('productAdmin.newColor')}
            </h4>
            <button 
              type="button"
              onClick={() => {
                setShowColorForm(false);
                setEditingColor(null);
                setNewColor({
                  name_fr: '',
                  name_ar: '',
                  hex_code: '#000000',
                  stock: 0,
                  image: null
                });
                setPreviewImage(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1 text-sm font-medium">
                {t('productAdmin.colorNameFr')}
              </label>
              <input
                type="text"
                value={newColor.name_fr}
                onChange={(e) => setNewColor({ ...newColor, name_fr: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Rouge"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                {t('productAdmin.colorNameAr')}
              </label>
              <input
                type="text"
                value={newColor.name_ar}
                onChange={(e) => setNewColor({ ...newColor, name_ar: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                dir="rtl"
                placeholder="أحمر"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                {t('productAdmin.colorHex')}
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={newColor.hex_code}
                  onChange={(e) => setNewColor({ ...newColor, hex_code: e.target.value })}
                  className="h-10 w-10 border-0 p-0 mr-2"
                />
                <input
                  type="text"
                  value={newColor.hex_code}
                  onChange={(e) => setNewColor({ ...newColor, hex_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="#FF0000"
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                {t('productAdmin.colorStock')}
              </label>
              <input
                type="number"
                value={newColor.stock}
                onChange={(e) => setNewColor({ ...newColor, stock: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          {/* Color image upload */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">
              {t('productAdmin.colorImage')}
            </label>
            <p className="text-sm text-gray-500 mb-2">{t('productAdmin.colorImageImportant')}</p>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
              {previewImage ? (
                <div className="relative">
                  <img 
                    src={previewImage} 
                    alt="Color preview" 
                    className="h-48 mx-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setNewColor({ ...newColor, image: null });
                    }}
                    className="mt-2 text-sm text-red-500 hover:underline"
                  >
                    {t('common.remove')}
                  </button>
                </div>
              ) : (
                <>
                  <label className="cursor-pointer block">
                    <div className="flex flex-col items-center">
                      <FaImage className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-gray-500">{t('productAdmin.uploadColorImage')}</span>
                      <span className="mt-1 text-xs text-gray-400">{t('productAdmin.clickToUpload')}</span>
                    </div>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddColor}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              {editingColor ? t('common.update') : t('productAdmin.addColor')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorManager;