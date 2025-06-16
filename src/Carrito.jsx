import React, { useState } from 'react';
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
  Paper,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Logout,
  AttachMoney,
  CreditCard
} from '@mui/icons-material';
import { useCart } from './context/CartContext';
import { toast } from 'react-toastify';
import { pagoService } from './services/api';

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
  const [procesandoPago, setProcesandoPago] = useState(false);

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

  // ✨ NUEVA FUNCIÓN: Procesar pago con Transbank (ARREGLADA)
  const procesarPagoTransbank = async () => {
    setProcesandoPago(true);
    
    try {
      // 🔍 DEBUG: Ver exactamente qué datos del usuario tenemos
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      console.log('👤 DATOS COMPLETOS DEL USUARIO:', usuario);
      console.log('📧 Email del usuario:', usuario.email);
      console.log('👤 Nombre del usuario:', usuario.username || usuario.nombre || usuario.first_name);
      
      // 🔍 DEBUG: Verificar qué datos tenemos
      console.log('🛒 Datos del carrito:', cart);
      console.log('💰 Total:', getTotal());
      console.log('📦 Items para enviar:', cart.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: parseFloat(item.precio)
      })));
      
      // Paso 1: Crear orden en Django
      toast.info('📦 Creando orden de pago...');
      const ordenResponse = await pagoService.crearOrden(cart, getTotal());
      
      console.log('📋 Respuesta crear orden:', ordenResponse);
      
      // ✅ ARREGLAR: Verificar el formato correcto de respuesta
      if (!ordenResponse.orden) {  // Cambiar de "success" a "orden"
        throw new Error(ordenResponse.error || 'Error al crear la orden');
      }

      const ordenId = ordenResponse.orden.id;  // ✅ ARREGLAR: Usar ordenResponse.orden.id
      
      // Paso 2: Iniciar pago con Transbank
      toast.info('💳 Iniciando pago con Transbank...');
      const pagoResponse = await pagoService.iniciarPago(ordenId);
      
      console.log('💳 Respuesta iniciar pago:', pagoResponse);
      
      // ✅ ARREGLAR: Verificar formato correcto
      if (!pagoResponse.url || !pagoResponse.token) {  // Verificar campos específicos
        throw new Error(pagoResponse.error || 'Error al iniciar el pago');
      }

      // Paso 3: Redireccionar a Transbank usando POST form
      const { token, url } = pagoResponse;
      
      if (!token || !url) {
        throw new Error('Token o URL de Transbank no válidos');
      }

      // Guardar datos temporales para el retorno
      localStorage.setItem('transbank_orden_id', ordenId);
      localStorage.setItem('transbank_cart_backup', JSON.stringify(cart));
      
      toast.success('🚀 Redirigiendo a Transbank...');
      
      // Crear y enviar formulario POST a Transbank
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;
      form.style.display = 'none';
      
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'token_ws';
      tokenInput.value = token;
      
      form.appendChild(tokenInput);
      document.body.appendChild(form);
      form.submit();
      
    } catch (error) {
      console.error('❌ Error completo:', error);
      toast.error(error.message || 'Error al procesar el pago');
      setProcesandoPago(false);
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

    // Usar la nueva función de Transbank
    procesarPagoTransbank();
  };

  // Función helper para formatear precios
  const formatPrice = (price) => {
    return Math.round(parseFloat(price))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
          <Alert severity="info" sx={{ mb: 3 }}>
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
                      {/* ✅ INFORMACIÓN DEL PRODUCTO (SIN IMÁGENES) */}
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
                          ${formatPrice(item.precio)} c/u
                        </Typography>
                      </Grid>

                      {/* ✅ CONTROLES DE CANTIDAD */}
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

                      {/* ✅ SUBTOTAL Y ELIMINAR */}
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" color="primary" gutterBottom>
                            ${formatPrice(item.precio * item.cantidad)}
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
                  disabled={procesandoPago}
                >
                  Vaciar Carrito
                </Button>
              </Box>
            </Grid>

            {/* Resumen del pedido */}
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
                <Typography variant="h5" gutterBottom>
                  📋 Resumen del Pedido
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    Productos ({getItemCount()}): ${formatPrice(getTotal())}
                  </Typography>
                  <Typography variant="body1">
                    Envío: Gratis
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="h6" sx={{ mb: 3 }}>
                  <AttachMoney /> Total: ${formatPrice(getTotal())}
                </Typography>
                
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleCheckout}
                  disabled={loading || procesandoPago || cart.length === 0}
                  startIcon={
                    procesandoPago ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <CreditCard />
                    )
                  }
                  sx={{ mb: 2 }}
                >
                  {procesandoPago ? 'Procesando...' : 'Pagar con Transbank'}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
}

export default Carrito;
