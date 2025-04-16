import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('beauty-shop-cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            setCart(parsedCart);
            console.log('Cart loaded from localStorage:', parsedCart.length, 'items');
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('beauty-shop-cart');
      } finally {
        setIsInitialized(true);
      }
    };
    
    loadCart();
  }, []);
  
  // Save cart to localStorage whenever it changes, but only after initialization
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('beauty-shop-cart', JSON.stringify(cart));
        console.log('Cart saved to localStorage:', cart.length, 'items');
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart, isInitialized]);
  
  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    // Ensure the product has all required fields correctly formatted
    const productToAdd = {
      id: product.id,
      name_fr: product.name_fr,
      name_ar: product.name_ar,
      image: product.image,
      price: parseFloat(product.price) || 0,
      quantity: quantity
    };
    
    // Add discount info if available
    if (product.discount && product.discount > 0) {
      productToAdd.discount = parseFloat(product.discount);
      productToAdd.discountedPrice = productToAdd.price * (1 - productToAdd.discount / 100);
    }
    
    // Add color info if selected
    if (product.selectedColor) {
      productToAdd.selectedColor = product.selectedColor;
    }
    
    // Check if the product is already in the cart (considering color selection)
    const colorIdentifier = product.selectedColor ? product.selectedColor.id : '';
    const existingItemIndex = cart.findIndex(item => 
      item.id === product.id && 
      (item.selectedColor?.id || '') === colorIdentifier
    );
    
    if (existingItemIndex !== -1) {
      // If it's already in the cart, update the quantity
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      // Otherwise, add the new product
      setCart([...cart, productToAdd]);
    }
  };
  
  // Remove item from cart
  const removeFromCart = (productId, colorId = null) => {
    setCart(cart.filter(item => {
      if (colorId) {
        return !(item.id === productId && item.selectedColor?.id === colorId);
      }
      return item.id !== productId;
    }));
  };
  
  // Update item quantity
  const updateQuantity = (productId, quantity, colorId = null) => {
    const updatedCart = cart.map(item => {
      if (colorId) {
        if (item.id === productId && item.selectedColor?.id === colorId) {
          return { ...item, quantity };
        }
      } else {
        if (item.id === productId) {
          return { ...item, quantity };
        }
      }
      return item;
    });
    
    setCart(updatedCart);
  };
  
  // Get total number of items in cart
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate total price
  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.discountedPrice !== undefined 
        ? item.discountedPrice 
        : parseFloat(item.price) || 0;
      return total + (itemPrice * item.quantity);
    }, 0);
  };
  
  // Toggle cart sidebar
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };
  
  // Clear cart
  const clearCart = () => {
    setCart([]);
  };
  
  // Format the order items for API submission
  const formatOrderItems = () => {
    return cart.map(item => {
      // Calculate the final price (including discount)
      const finalPrice = item.discountedPrice !== undefined 
        ? item.discountedPrice 
        : parseFloat(item.price) || 0;
      
      return {
        productId: item.id,
        quantity: item.quantity,
        price: finalPrice,
        colorId: item.selectedColor?.id || null
      };
    });
  };
  
  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        itemCount,
        calculateTotalPrice,
        isCartOpen,
        toggleCart,
        clearCart,
        formatOrderItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};