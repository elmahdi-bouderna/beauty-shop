import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaWhatsapp, FaEye, FaCartPlus } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { ordersAPI, productsAPI } from '../../utils/api';

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { addToCart } = useCart();
  const [outOfStock, setOutOfStock] = useState(false);
  
  const name = currentLanguage === 'fr' ? product.name_fr : product.name_ar;
  const imageUrl = product.image 
    ? `http://localhost:5000${product.image}` 
    : 'https://via.placeholder.com/300x300?text=No+Image';
  
  // Ensure price is a number
  const productPrice = product.price ? parseFloat(product.price) : 0;
  
  // Calculate discounted price if applicable
  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount 
    ? productPrice - (productPrice * product.discount / 100) 
    : null;
  
  // Check if the product is out of stock based on color variants
  const checkProductAvailability = async () => {
    try {
      // Fetch product colors
      const colorsRes = await productsAPI.getProductColors(product.id);
      const colors = colorsRes.data;
      
      // If there are colors, product is out of stock only if all colors are out of stock
      if (colors.length > 0) {
        const allColorsOutOfStock = colors.every(color => color.stock <= 0);
        setOutOfStock(allColorsOutOfStock);
      } else {
        // If no colors, use product stock
        setOutOfStock(product.stock <= 0);
      }
    } catch (error) {
      console.error('Error checking product stock:', error);
      // Default to product stock if there's an error
      setOutOfStock(product.stock <= 0);
    }
  };
  
  // Check product availability when component mounts
  useEffect(() => {
    checkProductAvailability();
  }, [product.id]);
  
  // Format product name and price for WhatsApp message
  const formatWhatsAppMessage = () => {
    const price = discountedPrice !== null ? discountedPrice : productPrice;
    // Ensure price is a number before calling toFixed
    const priceString = typeof price === 'number' ? price.toFixed(2) : '0.00';
    const message = `${t('whatsapp.messagePrefix')} "${name}" (${priceString} MAD)`;
    return encodeURIComponent(message);
  };
  
  // Add to cart with discount information
  const handleAddToCart = () => {
    const productWithDiscount = {
      ...product,
      name: name, // Add current language name
      price: productPrice, // Ensure price is a number
      discountedPrice: discountedPrice
    };
    addToCart(productWithDiscount);
  };
  
  // Handle WhatsApp order
  const handleWhatsAppOrder = () => {
    // First, create an order record in the database
    try {
      ordersAPI.createWhatsAppOrder({
        productId: product.id,
        quantity: 1,
        price: discountedPrice || productPrice
      });
      // Then open WhatsApp
      window.open(`https://wa.me/212600000000?text=${formatWhatsAppMessage()}`, '_blank');
    } catch (err) {
      console.error('Failed to record WhatsApp order:', err);
      // Still open WhatsApp even if recording fails
      window.open(`https://wa.me/212600000000?text=${formatWhatsAppMessage()}`, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden">
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 transform hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <span className="bg-white rounded-full p-2">
              <FaEye className="text-primary h-4 w-4" />
            </span>
          </div>
        </Link>
        
        {/* Category badge */}
        <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
          {t(`categories.${product.category}`)}
        </div>
        
        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            -{product.discount}%
          </div>
        )}
        
        {/* Out of stock overlay - using outOfStock state instead of checking product.stock directly */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              {t('product.outOfStock')}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif font-bold text-sm sm:text-base mb-1 hover:text-primary transition-colors line-clamp-2">{name}</h3>
        </Link>
        <div className="flex justify-between items-center mt-2">
          <div>
            {hasDiscount ? (
              <>
                <p className="font-semibold text-primary text-sm sm:text-base">{discountedPrice.toFixed(2)} MAD</p>
                <p className="text-xs text-gray-500 line-through">{productPrice.toFixed(2)} MAD</p>
              </>
            ) : (
              <p className="font-semibold text-primary text-sm sm:text-base">{productPrice.toFixed(2)} MAD</p>
            )}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`p-2 bg-primary text-white rounded-full hover:bg-primary-dark transform hover:scale-110 transition-transform ${
                outOfStock ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={t('product.addToCart')}
            >
              <FaCartPlus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;