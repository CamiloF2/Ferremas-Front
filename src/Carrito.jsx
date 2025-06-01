import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  Divider,
  Alert,
  AppBar,
  Toolbar,
  TextField,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Logout,
  AttachMoney
} from '@mui/icons-material';
import { useCart } from './context/CartContext';
import { toast } from 'react-toastify';

function Carrito() {
  const navigate = useNavigate();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotal, 
    getItemCount 
  } = useCart();
  const [loading, setLoading] = useState(false);

  const handleVolver = () => {
    navigate('/productos');
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    toast.success('Sesión cerrada correctamente');
    navigate('/');
  };

  const handleIncrement = (item) => {
    if (item.cantidad < item.stock) {
      updateQuantity(item.id, item.cantidad + 1);
      toast.success(`Cantidad actualizada: ${item.cantidad + 1}`);
    } else {
      toast.warn('No hay más stock disponible');
    }
  };

  const handleDecrement = (item) => {
    if (item.cantidad > 1) {
      updateQuantity(item.id, item.cantidad - 1);
      toast.success(`Cantidad actualizada: ${item.cantidad - 1}`);
    } else {
      handleRemoveItem(item.id, item.nombre);
    }
  };

  const handleRemoveItem = (id, nombre) => {
    removeFromCart(id);
    toast.success(`"${nombre}" eliminado del carrito`);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('🛒 Carrito vaciado');
  };

  const handleQuantityChange = (item, newQuantity) => {
    const quantity = parseInt(newQuantity);
    if (quantity > 0 && quantity <= item.stock) {
      updateQuantity(item.id, quantity);
    } else if (quantity > item.stock) {
      toast.warn('Cantidad excede el stock disponible');
    }
  };

  const procesarPago = async () => {
    setLoading(true);
    
    try {
      // Preparar datos para enviar al backend
      const orderData = {
        items: cart.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio
        })),
        total: getTotal()
      };

      // Llamada al backend para procesar el pago
      const response = await fetch('http://localhost:8000/api/procesar-pago/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok) {
        // Éxito - mostrar confirmación
        const orderConfirmation = {
          orderId: result.order_id || Date.now(),
          fecha: new Date().toLocaleDateString('es-ES'),
          items: cart,
          total: getTotal()
        };

        // Limpiar carrito
        clearCart();
        
        // Toast de éxito
        toast.success('🎉 ¡Pago procesado exitosamente!');
        
        // Navegar a página de confirmación
        navigate('/confirmacion-pago', { 
          state: { orderData: orderConfirmation } 
        });
        
      } else {
        // Error del backend
        toast.error(result.error || 'Error al procesar el pago');
      }
      
    } catch (error) {
      console.error('Error al procesar pago:', error);
      toast.error('Error de conexión al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.warn('Tu carrito está vacío');
      return;
    }

    // Validar stock antes del pago
    const itemsSinStock = cart.filter(item => item.cantidad > item.stock);
    
    if (itemsSinStock.length > 0) {
      toast.error(`Sin stock suficiente para: ${itemsSinStock.map(item => item.nombre).join(', ')}`);
      return;
    }

    procesarPago();
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleVolver}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Ferremas - Carrito de Compras
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button 
          variant="outlined" 
          onClick={handleVolver} 
          startIcon={<ArrowBack />}
          sx={{ mb: 3 }}
        >
          Seguir Comprando
        </Button>

        <Typography variant="h4" component="h1" gutterBottom>
          🛒 Mi Carrito ({getItemCount()} {getItemCount() === 1 ? 'producto' : 'productos'})
        </Typography>

        {cart.length === 0 ? (
          <Alert 
            severity="info" 
            sx={{ 
              mt: 4, 
              py: 3,
              display: 'flex',
              alignItems: 'center',
              fontSize: '1.1rem'
            }}
          >
            <ShoppingCart sx={{ mr: 2, fontSize: 30 }} />
            Tu carrito está vacío. ¡Agrega algunos productos!
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {/* Lista de productos */}
            <Grid item xs={12} md={8}>
              {cart.map((item) => (
                <Card key={item.id} sx={{ mb: 2 }} elevation={2}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      {/* Información del producto */}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" gutterBottom>
                          {item.nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Marca: {item.marca}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Código: {item.codigo}
                        </Typography>
                        <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
                          ${item.precio.toLocaleString()} c/u
                        </Typography>
                      </Grid>

                      {/* Controles de cantidad */}
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton 
                            onClick={() => handleDecrement(item)}
                            size="small"
                            color="primary"
                          >
                            <Remove />
                          </IconButton>
                          
                          <TextField
                            size="small"
                            value={item.cantidad}
                            onChange={(e) => handleQuantityChange(item, e.target.value)}
                            inputProps={{ 
                              min: 1, 
                              max: item.stock,
                              style: { textAlign: 'center', width: '60px' }
                            }}
                            type="number"
                          />
                          
                          <IconButton 
                            onClick={() => handleIncrement(item)}
                            size="small"
                            color="primary"
                            disabled={item.cantidad >= item.stock}
                          >
                            <Add />
                          </IconButton>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Stock: {item.stock}
                        </Typography>
                      </Grid>

                      {/* Subtotal y eliminar */}
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" color="primary" gutterBottom>
                            ${(item.precio * item.cantidad).toLocaleString()}
                          </Typography>
                          <IconButton 
                            onClick={() => handleRemoveItem(item.id, item.nombre)}
                            color="error"
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}

              {/* Botón limpiar carrito */}
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={handleClearCart}
                  startIcon={<Delete />}
                >
                  Vaciar Carrito
                </Button>
              </Box>
            </Grid>

            {/* Resumen del pedido */}
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
                <Typography variant="h6" gutterBottom>
                  📋 Resumen del Pedido
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Productos ({getItemCount()})</Typography>
                    <Typography>${getTotal().toLocaleString()}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Envío</Typography>
                    <Typography color="success.main">Gratis</Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary">
                    ${getTotal().toLocaleString()}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<AttachMoney />}
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0}
                  sx={{ py: 1.5 }}
                >
                  {loading ? 'Procesando...' : 'Proceder al Pago'}
                </Button>

                <Typography 
                  variant="caption" 
                  display="block" 
                  sx={{ mt: 2, textAlign: 'center' }}
                  color="text.secondary"
                >
                  Envío gratis en compras sobre $50.000
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
}

export default Carrito;
