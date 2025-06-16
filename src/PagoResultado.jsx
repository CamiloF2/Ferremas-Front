import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid
} from '@mui/material';
import {
  CheckCircle,
  Error,
  ShoppingBag,
  Home,
  Receipt,
  CreditCard,
  Schedule
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { pagoService } from './services/api';
import { useCart } from './context/CartContext';

function PagoResultado() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [estadoPago, setEstadoPago] = useState(null);
  const [ordenData, setOrdenData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    verificarResultadoPago();
  }, []);

  const verificarResultadoPago = async () => {
    try {
      // 🔍 Obtener parámetros de la URL que viene del backend
      const ordenId = searchParams.get('orden');
      const estadoFromUrl = searchParams.get('estado');
      
      console.log('🔍 Orden ID desde URL:', ordenId);
      console.log('🔍 Estado desde URL:', estadoFromUrl);
      
      if (!ordenId) {
        setError('No se encontró información de la orden');
        setLoading(false);
        return;
      }

      // Si ya tenemos el estado desde la URL, lo usamos directamente
      if (estadoFromUrl) {
        setEstadoPago(estadoFromUrl);
        
        // Obtener detalles de la orden
        try {
          const response = await pagoService.obtenerEstadoOrden(ordenId);
          
          if (response.success || response.orden) {
            setOrdenData(response.orden || response);
          }
        } catch (error) {
          console.warn('No se pudieron obtener detalles de la orden:', error);
          // Continuar sin detalles, solo con el estado
        }
        
        // Manejar según el estado
        if (estadoFromUrl === 'PAGADO' || estadoFromUrl === 'AUTHORIZED') {
          clearCart();
          toast.success('🎉 ¡Pago realizado exitosamente!');
          
          // Limpiar datos temporales
          localStorage.removeItem('transbank_orden_id');
          localStorage.removeItem('transbank_cart_backup');
        } else if (estadoFromUrl === 'FAILED' || estadoFromUrl === 'CANCELLED') {
          toast.error('❌ El pago no pudo ser procesado');
        }
        
      } else {
        // Fallback: verificar estado desde el backend
        const response = await pagoService.obtenerEstadoOrden(ordenId);
        
        if (response.success || response.orden) {
          setEstadoPago(response.estado || 'UNKNOWN');
          setOrdenData(response.orden || response);
        } else {
          setError(response.error || 'Error al verificar el estado del pago');
        }
      }
      
    } catch (error) {
      console.error('Error al verificar resultado:', error);
      setError('Error al verificar el resultado del pago');
      toast.error('Error al verificar el resultado del pago');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return Math.round(parseFloat(price))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const getEstadoDisplay = (estado) => {
    const estados = {
      'PAGADO': { 
        label: 'Pagado', 
        color: 'success', 
        icon: <CheckCircle />,
        description: 'Tu pago ha sido procesado exitosamente'
      },
      'AUTHORIZED': { 
        label: 'Autorizado', 
        color: 'success', 
        icon: <CheckCircle />,
        description: 'Tu pago ha sido autorizado correctamente'
      },
      'FAILED': { 
        label: 'Fallido', 
        color: 'error', 
        icon: <Error />,
        description: 'El pago no pudo ser procesado'
      },
      'CANCELLED': { 
        label: 'Cancelado', 
        color: 'warning', 
        icon: <Error />,
        description: 'El pago fue cancelado'
      },
      'PENDING': { 
        label: 'Pendiente', 
        color: 'info', 
        icon: <Schedule />,
        description: 'El pago está siendo procesado'
      }
    };
    
    return estados[estado] || { 
      label: estado || 'Desconocido', 
      color: 'default', 
      icon: <Schedule />,
      description: 'Estado del pago desconocido'
    };
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">
            Verificando resultado del pago...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Por favor espera mientras confirmamos tu transacción
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Error sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Error al procesar el pago
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/productos')}
              startIcon={<Home />}
            >
              Volver al Inicio
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/carrito')}
              startIcon={<ShoppingBag />}
            >
              Ver Carrito
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  const estadoInfo = getEstadoDisplay(estadoPago);
  const esExitoso = estadoPago === 'PAGADO' || estadoPago === 'AUTHORIZED';

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header del resultado */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ mb: 2, color: esExitoso ? 'success.main' : 'error.main' }}>
            {estadoInfo.icon}
          </Box>
          <Typography variant="h4" gutterBottom>
            {esExitoso ? '¡Pago Exitoso!' : 'Pago No Procesado'}
          </Typography>
          <Chip 
            label={estadoInfo.label}
            color={estadoInfo.color}
            size="large"
            sx={{ mb: 2 }}
          />
          <Typography variant="body1" color="text.secondary">
            {estadoInfo.description}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Información de la orden */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            📋 Detalles de la Transacción
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Número de Orden:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                #{searchParams.get('orden')}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Fecha:
              </Typography>
              <Typography variant="body1">
                {new Date().toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Grid>
            
            {ordenData?.total && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Pagado:
                </Typography>
                <Typography variant="h6" color="primary">
                  ${formatPrice(ordenData.total)}
                </Typography>
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Método de Pago:
              </Typography>
              <Typography variant="body1">
                <CreditCard sx={{ fontSize: 16, mr: 1 }} />
                Transbank Webpay
              </Typography>
            </Grid>
          </Grid>

          {/* Lista de productos si está disponible */}
          {ordenData?.items && ordenData.items.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Productos:
              </Typography>
              <List>
                {ordenData.items.map((item, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={item.producto_nombre || item.nombre}
                      secondary={`Cantidad: ${item.cantidad} x $${formatPrice(item.precio_unitario || item.precio)}`}
                    />
                    <Typography variant="body2" fontWeight="bold">
                      ${formatPrice((item.cantidad || 1) * (item.precio_unitario || item.precio || 0))}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>

        {/* Mensaje adicional según el estado */}
        {esExitoso && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>¡Felicidades!</strong> Tu pago ha sido procesado exitosamente. 
              Gracias por tu compra en Ferremas.
            </Typography>
          </Alert>
        )}

        {!esExitoso && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              El pago no pudo ser procesado. Por favor, intenta nuevamente o 
              contacta con nuestro soporte si el problema persiste.
            </Typography>
          </Alert>
        )}

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/productos')}
            startIcon={<Home />}
            size="large"
          >
            Seguir Comprando
          </Button>
          
          {!esExitoso && (
            <Button 
              variant="outlined" 
              onClick={() => navigate('/carrito')}
              startIcon={<ShoppingBag />}
              size="large"
            >
              Volver al Carrito
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default PagoResultado; 