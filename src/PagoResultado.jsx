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
  Schedule,
  CreditCardOff,
  Cancel,
  TimerOff,
  BugReport,
  ContactSupport,
  Refresh
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

  // ✨ NUEVA FUNCIÓN: Categorizar motivos de rechazo
  const categorizarMotivo = (motivo) => {
    if (!motivo) return 'tecnico';
    
    const motivoLower = motivo.toLowerCase();
    
    if (motivoLower.includes('banco') || motivoLower.includes('rechazado') || motivoLower.includes('declined')) {
      return 'banco';
    }
    if (motivoLower.includes('canceló') || motivoLower.includes('cancelado') || motivoLower.includes('cancelled')) {
      return 'cancelado';
    }
    if (motivoLower.includes('tiempo') || motivoLower.includes('agotado') || motivoLower.includes('timeout') || motivoLower.includes('expired')) {
      return 'timeout';
    }
    if (motivoLower.includes('comunicación') || motivoLower.includes('conexión') || motivoLower.includes('network')) {
      return 'conexion';
    }
    
    return 'tecnico';
  };

  // ✨ NUEVA FUNCIÓN: Configuración de categorías de motivos
  const getMotivoConfig = (motivo) => {
    const categoria = categorizarMotivo(motivo);
    
    const configs = {
      'banco': {
        color: 'error',
        icon: <CreditCardOff sx={{ fontSize: 48 }} />,
        title: 'Pago Rechazado por el Banco',
        suggestion: 'Contacta a tu banco o intenta con otra tarjeta',
        severity: 'error',
        actions: ['soporte', 'productos']
      },
      'cancelado': {
        color: 'warning', 
        icon: <Cancel sx={{ fontSize: 48 }} />,
        title: 'Pago Cancelado',
        suggestion: 'Puedes intentar el pago nuevamente cuando desees',
        severity: 'warning',
        actions: ['reintentar', 'productos']
      },
      'timeout': {
        color: 'info',
        icon: <TimerOff sx={{ fontSize: 48 }} />,
        title: 'Tiempo de Pago Agotado',
        suggestion: 'El tiempo de pago expiró, pero puedes intentar nuevamente',
        severity: 'info',
        actions: ['reintentar', 'productos']
      },
      'conexion': {
        color: 'warning',
        icon: <BugReport sx={{ fontSize: 48 }} />,
        title: 'Error de Conexión',
        suggestion: 'Hubo un problema de comunicación, intenta nuevamente',
        severity: 'warning',
        actions: ['reintentar', 'soporte']
      },
      'tecnico': {
        color: 'error',
        icon: <BugReport sx={{ fontSize: 48 }} />,
        title: 'Error Técnico',
        suggestion: 'Ocurrió un error inesperado, contacta a soporte técnico',
        severity: 'error',
        actions: ['soporte', 'productos']
      }
    };
    
    return configs[categoria];
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
        icon: <CheckCircle sx={{ fontSize: 60 }} />,
        description: 'Tu pago ha sido procesado exitosamente'
      },
      'AUTHORIZED': { 
        label: 'Autorizado', 
        color: 'success', 
        icon: <CheckCircle sx={{ fontSize: 60 }} />,
        description: 'Tu pago ha sido autorizado correctamente'
      },
      'FAILED': { 
        label: 'Fallido', 
        color: 'error', 
        icon: <Error sx={{ fontSize: 60 }} />,
        description: 'El pago no pudo ser procesado'
      },
      'CANCELLED': { 
        label: 'Cancelado', 
        color: 'warning', 
        icon: <Error sx={{ fontSize: 60 }} />,
        description: 'El pago fue cancelado'
      },
      'PENDING': { 
        label: 'Pendiente', 
        color: 'info', 
        icon: <Schedule sx={{ fontSize: 60 }} />,
        description: 'El pago está siendo procesado'
      }
    };
    
    return estados[estado] || { 
      label: estado || 'Desconocido', 
      color: 'default', 
      icon: <Schedule sx={{ fontSize: 60 }} />,
      description: 'Estado del pago desconocido'
    };
  };

  // ✨ NUEVA FUNCIÓN: Botones de acción según el motivo
  const renderActionButtons = (motivoConfig) => {
    const buttons = [];
    
    if (motivoConfig.actions.includes('reintentar')) {
      buttons.push(
        <Button 
          key="reintentar"
          variant="contained" 
          onClick={() => navigate('/carrito')}
          startIcon={<Refresh />}
          size="large"
          color="primary"
        >
          Intentar Nuevamente
        </Button>
      );
    }
    
    if (motivoConfig.actions.includes('soporte')) {
      buttons.push(
        <Button 
          key="soporte"
          variant="outlined" 
          onClick={() => toast.info('📞 Contacta soporte: soporte@ferremas.com')}
          startIcon={<ContactSupport />}
          size="large"
          color="error"
        >
          Contactar Soporte
        </Button>
      );
    }
    
    buttons.push(
      <Button 
        key="productos"
        variant={buttons.length === 0 ? "contained" : "text"}
        onClick={() => navigate('/productos')}
        startIcon={<Home />}
        size="large"
      >
        Volver a Productos
      </Button>
    );
    
    return buttons;
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
  
  // ✨ OBTENER CONFIGURACIÓN DEL MOTIVO DE RECHAZO
  const motivoRechazo = ordenData?.motivo_rechazo;
  const motivoConfig = !esExitoso ? getMotivoConfig(motivoRechazo) : null;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header del resultado */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {esExitoso ? (
            // ✅ PAGO EXITOSO
            <>
              <Box sx={{ mb: 2, color: 'success.main' }}>
                {estadoInfo.icon}
              </Box>
              <Typography variant="h4" gutterBottom color="success.main">
                ¡Pago Exitoso!
              </Typography>
              <Chip 
                label={estadoInfo.label}
                color="success"
                size="large"
                sx={{ mb: 2 }}
              />
              <Typography variant="body1" color="text.secondary">
                {estadoInfo.description}
              </Typography>
            </>
          ) : (
            // ❌ PAGO RECHAZADO - CON MOTIVO ESPECÍFICO
            <>
              <Box sx={{ mb: 2, color: `${motivoConfig.color}.main` }}>
                {motivoConfig.icon}
              </Box>
              <Typography variant="h4" gutterBottom color={`${motivoConfig.color}.main`}>
                {motivoConfig.title}
              </Typography>
              
              {/* ✨ MOTIVO ESPECÍFICO DEL RECHAZO */}
              <Alert severity={motivoConfig.severity} sx={{ mb: 3, textAlign: 'left' }}>
                <Box>
                  <Typography variant="body1" fontWeight="bold" gutterBottom>
                    {motivoRechazo || 'Error desconocido'}
                  </Typography>
                  <Typography variant="body2">
                    💡 {motivoConfig.suggestion}
                  </Typography>
                </Box>
              </Alert>

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
                <Chip 
                  label={`Estado: ${estadoInfo.label}`} 
                  color={motivoConfig.color}
                />
                <Chip 
                  label={`Categoría: ${motivoConfig.title.split(' ')[1] || 'Error'}`}
                  variant="outlined"
                  color={motivoConfig.color}
                />
              </Box>
            </>
          )}
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
                Fecha del Intento:
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
                  {esExitoso ? 'Total Pagado:' : 'Monto del Intento:'}
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

            {/* ✨ MOSTRAR CÓDIGO DE RESPUESTA SI ESTÁ DISPONIBLE */}
            {ordenData?.codigo_respuesta && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Código de Respuesta:
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {ordenData.codigo_respuesta}
                </Typography>
              </Grid>
            )}
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
              Recibirás un comprobante por email. Gracias por tu compra en Ferremas.
            </Typography>
          </Alert>
        )}

        {/* ✨ BOTONES DE ACCIÓN ESPECÍFICOS SEGÚN EL MOTIVO */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'center', 
          flexWrap: 'wrap',
          mt: 3 
        }}>
          {esExitoso ? (
            <Button 
              variant="contained" 
              onClick={() => navigate('/productos')}
              startIcon={<Home />}
              size="large"
            >
              Seguir Comprando
            </Button>
          ) : (
            renderActionButtons(motivoConfig)
          )}
        </Box>

        {/* ✨ INFORMACIÓN ADICIONAL PARA PAGOS RECHAZADOS */}
        {!esExitoso && (
          <Box sx={{ mt: 4, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              ℹ️ Información Útil:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Guarda el número de orden para futuras consultas<br/>
              • Si el problema persiste, contacta a tu banco<br/>
              • Puedes intentar con otra tarjeta o método de pago<br/>
              • Tu carrito se mantiene guardado para reintentarlo
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default PagoResultado; 