import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Error,
  ShoppingCart,
  Home,
  Refresh,
  CreditCard,
  Warning,
  ContactSupport
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useCart } from './context/CartContext';

function PagoRechazado() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart, getTotal, getItemCount } = useCart();
  const [razonRechazo, setRazonRechazo] = useState('');
  const [ordenId, setOrdenId] = useState(null);

  useEffect(() => {
    // Obtener información del rechazo desde la URL
    const motivo = searchParams.get('motivo');
    const orden = searchParams.get('orden');
    
    setRazonRechazo(motivo || 'desconocido');
    setOrdenId(orden);
    
    // Mostrar notificación
    toast.error('❌ Pago rechazado');
    
    // Recuperar carrito si se había guardado
    const carritoBackup = localStorage.getItem('transbank_cart_backup');
    if (carritoBackup && cart.length === 0) {
      // El carrito se puede recuperar automáticamente desde CartContext
      console.log('💾 Carrito disponible para reintento');
    }
    
  }, [cart.length, searchParams]);

  const formatPrice = (price) => {
    return Math.round(parseFloat(price))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const getRazonDisplay = (razon) => {
    const razones = {
      'cancelled': {
        titulo: 'Pago Cancelado',
        descripcion: 'Cancelaste el proceso de pago en Transbank',
        icono: <Warning sx={{ fontSize: 60, color: 'warning.main' }} />,
        color: 'warning'
      },
      'failed': {
        titulo: 'Pago Rechazado',
        descripcion: 'Tu tarjeta fue rechazada o hubo un error en el procesamiento',
        icono: <Error sx={{ fontSize: 60, color: 'error.main' }} />,
        color: 'error'
      },
      'timeout': {
        titulo: 'Tiempo Agotado',
        descripcion: 'El tiempo para completar el pago se agotó',
        icono: <Warning sx={{ fontSize: 60, color: 'warning.main' }} />,
        color: 'warning'
      },
      'invalid_card': {
        titulo: 'Tarjeta Inválida',
        descripcion: 'Los datos de la tarjeta no son válidos',
        icono: <Error sx={{ fontSize: 60, color: 'error.main' }} />,
        color: 'error'
      },
      'insufficient_funds': {
        titulo: 'Fondos Insuficientes',
        descripcion: 'Tu tarjeta no tiene fondos suficientes',
        icono: <Error sx={{ fontSize: 60, color: 'error.main' }} />,
        color: 'error'
      }
    };
    
    return razones[razon] || {
      titulo: 'Pago No Completado',
      descripcion: 'No se pudo completar tu pago por un motivo desconocido',
      icono: <Error sx={{ fontSize: 60, color: 'error.main' }} />,
      color: 'error'
    };
  };

  const handleIntentarDeNuevo = () => {
    navigate('/carrito');
    toast.info('💡 Puedes intentar pagar nuevamente');
  };

  const handleCambiarMetodoPago = () => {
    navigate('/carrito');
    toast.info('💳 Intenta con otra tarjeta o método de pago');    
  };

  const handleVolverProductos = () => {
    navigate('/productos');
  };

  const handleIrInicio = () => {
    navigate('/home');
  };

  const info = getRazonDisplay(razonRechazo);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Encabezado del error */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {info.icono}
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            {info.titulo}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {info.descripcion}
          </Typography>
          
          {ordenId && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Orden #{ordenId}
            </Typography>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Información del pedido si hay carrito */}
        {cart.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              📋 Tu pedido está guardado
            </Typography>
            <Card sx={{ mb: 3, backgroundColor: 'grey.50' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Productos:</strong> {getItemCount()} artículos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tu carrito se mantiene intacto
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography variant="h6" color="primary">
                      Total: ${formatPrice(getTotal())}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Listo para intentar de nuevo
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </>
        )}

        {/* Consejos útiles */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" component="div">
            <strong>💡 Consejos para tu próximo intento:</strong>
            <List dense>
              <ListItem disablePadding>
                <ListItemText 
                  primary="• Verifica que los datos de tu tarjeta sean correctos"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText 
                  primary="• Asegúrate de tener fondos suficientes"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText 
                  primary="• Intenta con otra tarjeta si persiste el problema"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText 
                  primary="• Contacta a tu banco si el problema continúa"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Typography>
        </Alert>

        {/* Botones de acción */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2, 
          justifyContent: 'center',
          mt: 4 
        }}>
          {cart.length > 0 ? (
            <>
              <Button 
                variant="contained" 
                size="large"
                onClick={handleIntentarDeNuevo}
                startIcon={<Refresh />}
                sx={{ minWidth: 200 }}
              >
                Intentar de Nuevo
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={handleCambiarMetodoPago}
                startIcon={<CreditCard />}
                sx={{ minWidth: 200 }}
              >
                Cambiar Método
              </Button>
            </>
          ) : (
            <Button 
              variant="contained" 
              size="large"
              onClick={handleVolverProductos}
              startIcon={<ShoppingCart />}
              sx={{ minWidth: 200 }}
            >
              Ir de Compras
            </Button>
          )}
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2, 
          justifyContent: 'center',
          mt: 2 
        }}>
          <Button 
            variant="text" 
            onClick={handleVolverProductos}
            startIcon={<ShoppingCart />}
          >
            Ver Productos
          </Button>
          <Button 
            variant="text" 
            onClick={handleIrInicio}
            startIcon={<Home />}
          >
            Ir al Inicio
          </Button>
        </Box>

        {/* Información de contacto */}
        <Divider sx={{ mt: 4, mb: 2 }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            ¿Necesitas ayuda? Contáctanos
          </Typography>
          <Button 
            variant="text" 
            size="small"
            startIcon={<ContactSupport />}
            sx={{ mt: 1 }}
          >
            Soporte Cliente
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default PagoRechazado; 