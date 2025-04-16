import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCartPlus, FaWhatsapp, FaPlus, FaMinus, FaCheck } from 'react-icons/fa';
import { productsAPI, ordersAPI } from '../../utils/api';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-toastify';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { currentLanguage, isRTL } = useLanguage();
  
  const [product, setProduct] = useState(null);
  const [colors, setColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  
  const colorSectionRef = useRef(null);

  // Calculate if the product is out of stock (all color variants are out of stock)
  const isProductOutOfStock = () => {
    // If there are colors and all colors are out of stock, the product is out of stock
    if (colors.length > 0) {
      return colors.every(color => color.stock <= 0);
    }
    // If there are no colors, use the product stock
    return product.stock <= 0;
  };
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Fetch product data
        const response = await productsAPI.getById(id);
        setProduct(response.data);
        
        // Set default product image
        setCurrentImage(`http://localhost:5000${response.data.image}`);
        
        // Fetch product colors
        const colorsRes = await productsAPI.getProductColors(id);
        setColors(colorsRes.data);
        
        // Select first available color if there are colors
        if (colorsRes.data.length > 0) {
          // Try to find a color that has stock
          const availableColor = colorsRes.data.find(c => c.stock > 0);
          
          // If an available color is found, select it, otherwise select the first one
          const colorToSelect = availableColor || colorsRes.data[0];
          setSelectedColor(colorToSelect);
          
          // If the selected color has an image, use it
          if (colorToSelect.image) {
            setCurrentImage(`http://localhost:5000${colorToSelect.image}`);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, t]);
  
  // Handle color selection
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setQuantity(1); // Reset quantity when changing color
    
    // Change image if the color has its own image
    if (color.image) {
      setCurrentImage(`http://localhost:5000${color.image}`);
    } else {
      // Fall back to main product image
      setCurrentImage(`http://localhost:5000${product.image}`);
    }
  };
  
  const incrementQuantity = () => {
    // Only check selected color stock since that's what we're adding to cart
    const maxQuantity = selectedColor ? selectedColor.stock : 0;
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = () => {
    // Don't add if out of stock or if no color is selected when colors are available
    if ((colors.length > 0 && !selectedColor) || 
        (selectedColor && selectedColor.stock <= 0)) {
      return;
    }
    
    const productWithDiscount = {
      ...product,
      price: parseFloat(product.price),
      discount: parseFloat(product.discount || 0),
      // Add color information if selected
      selectedColor: selectedColor ? {
        id: selectedColor.id,
        name_fr: selectedColor.name_fr,
        name_ar: selectedColor.name_ar,
        hex_code: selectedColor.hex_code,
        image: selectedColor.image
      } : null
    };
    
    addToCart(productWithDiscount, quantity);
    setAddedToCart(true);
    
    // Reset "Added to cart" message after 3 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };
  
  const handleWhatsAppOrder = async () => {
    try {
      // Don't proceed if out of stock or if no color is selected when colors are available
      if ((colors.length > 0 && !selectedColor) || 
          (selectedColor && selectedColor.stock <= 0)) {
        return;
      }
      
      // Create an order item for the API
      const orderItem = {
        productId: product.id,
        quantity: quantity,
        price: product.discount > 0 
          ? product.price * (1 - product.discount / 100) 
          : product.price,
        colorId: selectedColor ? selectedColor.id : null
      };
      
      // Create order data - only need to include items and order_source flag
      const orderData = {
        items: [orderItem],
        order_source: 'whatsapp'
      };
      
      // Create the order in the database
      await ordersAPI.createWhatsAppOrder(orderData);
      
      // Format WhatsApp message
      const productName = currentLanguage === 'fr' ? product.name_fr : product.name_ar;
      const price = product.discount > 0
        ? product.price * (1 - product.discount / 100)
        : product.price;
      const colorInfo = selectedColor ? 
        ` (${t('product.color')}: ${currentLanguage === 'fr' ? selectedColor.name_fr : selectedColor.name_ar})` : '';
      const total = price * quantity;
      
      const message = `${t('whatsapp.messagePrefix')} ${productName}${colorInfo} x ${quantity} = ${total.toFixed(2)} MAD`;
      
      // Redirect to WhatsApp
      window.open(`https://wa.me/212600000000?text=${encodeURIComponent(message)}`, '_blank');
      
    } catch (error) {
      console.error('Error processing WhatsApp order:', error);
      // Show error notification
      toast.error(t('cart.whatsappOrderError'));
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-red-600">{error}</div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-gray-600">{t('product.notFound')}</div>
      </div>
    );
  }
  
  const name = currentLanguage === 'fr' ? product.name_fr : product.name_ar;
  const description = currentLanguage === 'fr' ? product.desc_fr : product.desc_ar;
  
  const productPrice = parseFloat(product.price);
  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount ? 
    productPrice - (productPrice * product.discount / 100) : null;
  
  const finalPrice = discountedPrice || productPrice;
  
  // Determine overall product availability
  const productOutOfStock = isProductOutOfStock();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-md p-6">
        {/* Product image */}
        <div className="flex flex-col items-center">
          <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img 
              src={currentImage} 
              alt={name} 
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Color image thumbnails */}
          {colors.length > 0 && colors.some(c => c.image) && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {/* Main product image thumbnail */}
              <button 
                onClick={() => setCurrentImage(`http://localhost:5000${product.image}`)}
                className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                  currentImage === `http://localhost:5000${product.image}` ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img 
                  src={`http://localhost:5000${product.image}`} 
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </button>
              
              {/* Color image thumbnails */}
              {colors.filter(c => c.image).map(color => (
                <button 
                  key={color.id}
                  onClick={() => {
                    setCurrentImage(`http://localhost:5000${color.image}`);
                    setSelectedColor(color);
                  }}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                    currentImage === `http://localhost:5000${color.image}` ? 'border-primary' : 'border-transparent'
                  }`}
                  title={color.name_fr}
                >
                  <img 
                    src={`http://localhost:5000${color.image}`}
                    alt={color.name_fr}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product details */}
        <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
          <h1 className="text-3xl font-serif font-bold mb-3">{name}</h1>
          
          <div className="mb-6">
            {hasDiscount ? (
              <div className="flex items-center">
                <p className="font-bold text-2xl text-primary">{discountedPrice.toFixed(2)} MAD</p>
                <p className="ml-3 text-gray-500 line-through">{productPrice.toFixed(2)} MAD</p>
                <span className="ml-3 bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                  -{product.discount}%
                </span>
              </div>
            ) : (
              <p className="font-bold text-2xl text-primary">{productPrice.toFixed(2)} MAD</p>
            )}
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">{t('product.description')}</h3>
            <p className="text-gray-600 whitespace-pre-line">{description}</p>
          </div>
          
          {/* Stock indicator */}
          <div className="mb-6">
            {colors.length > 0 ? (
              selectedColor ? (
                selectedColor.stock > 0 ? (
                  <p className="text-green-600 font-medium">
                    {t('product.inStock')} ({selectedColor.stock})
                  </p>
                ) : (
                  <p className="text-red-600 font-medium">{t('product.outOfStock')}</p>
                )
              ) : (
                productOutOfStock ? (
                  <p className="text-red-600 font-medium">{t('product.outOfStock')}</p>
                ) : (
                  <p className="text-green-600 font-medium">{t('product.inStock')}</p>
                )
              )
            ) : (
              product.stock > 0 ? (
                <p className="text-green-600 font-medium">
                  {t('product.inStock')} ({product.stock})
                </p>
              ) : (
                <p className="text-red-600 font-medium">{t('product.outOfStock')}</p>
              )
            )}
          </div>
          
          {/* Color selection */}
          {colors.length > 0 && (
            <div ref={colorSectionRef} className="mb-6">
              <label className="block text-gray-700 mb-2">
                {t('product.selectColor')}
                {colors.some(c => c.stock > 0) && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {colors.map(color => {
                  const isSelected = selectedColor && selectedColor.id === color.id;
                  const isOutOfStock = color.stock <= 0;
                  
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => {
                        if (!isOutOfStock) {
                          handleColorSelect(color);
                        }
                      }}
                      disabled={isOutOfStock}
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center 
                        ${isSelected ? 'ring-2 ring-offset-2 ring-primary' : 'ring-1 ring-gray-300'}
                        ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:ring-2 hover:ring-gray-400'}
                      `}
                      title={`${color.name_fr} - ${isOutOfStock ? t('product.outOfStock') : `${color.stock} ${t('product.inStock')}`}`}
                    >
                      <span 
                        className="w-10 h-10 rounded-full" 
                        style={{ backgroundColor: color.hex_code }}
                      ></span>
                      {isSelected && (
                        <span className="absolute bg-white rounded-full p-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedColor && (
                <div className="mt-2">
                  <span className="font-medium">{selectedColor.name_fr} / {selectedColor.name_ar}</span>
                  {selectedColor.stock > 0 ? (
                    <span className="ml-2 text-green-600">({selectedColor.stock} {t('product.inStock')})</span>
                  ) : (
                    <span className="ml-2 text-red-600">{t('product.outOfStock')}</span>
                  )}
                </div>
              )}
              {colors.length > 0 && !selectedColor && colors.some(c => c.stock > 0) && (
                <p className="text-red-500 text-sm mt-2">
                  {t('product.pleaseSelectColor')}
                </p>
              )}
            </div>
          )}
          
          {/* Quantity selector - Only show if a color with stock is selected or if there are no colors */}
          {((colors.length > 0 && selectedColor && selectedColor.stock > 0) || 
             (colors.length === 0 && product.stock > 0)) && (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                {t('product.quantity')}
              </label>
              <div className="flex items-center border border-gray-300 rounded-md w-32">
                <button 
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className={`px-3 py-2 ${quantity <= 1 ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <FaMinus className="h-3 w-3" />
                </button>
                <span className="flex-1 text-center font-medium">{quantity}</span>
                <button 
                  onClick={incrementQuantity}
                  disabled={(selectedColor && quantity >= selectedColor.stock) || 
                    (!selectedColor && quantity >= product.stock)}
                  className={`px-3 py-2 ${
                    (selectedColor && quantity >= selectedColor.stock) || 
                    (!selectedColor && quantity >= product.stock) 
                      ? 'text-gray-400' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaPlus className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="mt-8 space-y-3">
            {/* "Added to cart" message */}
            {addedToCart && (
              <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center mb-3">
                <FaCheck className="mr-2" />
                <p>{t('product.addedToCart')}</p>
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={handleAddToCart}
                disabled={
                  productOutOfStock || 
                  (colors.length > 0 && (!selectedColor || selectedColor.stock <= 0))
                }
                className={`flex-1 inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark 
                  ${
                    productOutOfStock || 
                    (colors.length > 0 && (!selectedColor || selectedColor.stock <= 0))
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
              >
                <FaCartPlus className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('product.addToCart')}
              </button>
              
              <button 
                onClick={handleWhatsAppOrder}
                disabled={
                  productOutOfStock || 
                  (colors.length > 0 && (!selectedColor || selectedColor.stock <= 0))
                }
                className={`flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 
                  ${
                    productOutOfStock || 
                    (colors.length > 0 && (!selectedColor || selectedColor.stock <= 0))
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
              >
                <FaWhatsapp className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('product.orderNow')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;