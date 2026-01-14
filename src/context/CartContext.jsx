import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Reducer para manejar las acciones del carrito
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.find(item => item.id === action.payload.id);
      if (existingItem) {
        return state.map(item =>
          item.id === action.payload.id
            ? { ...item, cantidad: item.cantidad + action.payload.cantidad }
            : item
        );
      }
      return [...state, { ...action.payload, cantidad: action.payload.cantidad }];
    
    case 'REMOVE_ITEM':
      return state.filter(item => item.id !== action.payload);
    
    case 'UPDATE_QUANTITY':
      return state.map(item =>
        item.id === action.payload.id
          ? { ...item, cantidad: action.payload.cantidad }
          : item
      );
    
    case 'CLEAR_CART':
      return [];
    
    case 'LOAD_CART':
      return action.payload;
    
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('ferremas_cart');
    if (savedCart) {
      dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('ferremas_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (producto, cantidad = 1) => {
    dispatch({ 
      type: 'ADD_ITEM', 
      payload: { 
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        marca: producto.marca,
        codigo: producto.codigo,
        stock: producto.stock,
        cantidad: cantidad
      } 
    });
  };

  const removeFromCart = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id, cantidad) => {
    if (cantidad <= 0) {
      removeFromCart(id);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, cantidad } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const getItemCount = () => {
    return cart.reduce((total, item) => total + item.cantidad, 0);
  };

  const isInCart = (id) => {
    return cart.some(item => item.id === id);
  };

  const getItemQuantity = (id) => {
    const item = cart.find(item => item.id === id);
    return item ? item.cantidad : 0;
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotal,
      getItemCount,
      isInCart,
      getItemQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
}; 