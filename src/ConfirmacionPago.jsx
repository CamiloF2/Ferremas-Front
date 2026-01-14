import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Chip
} from '@mui/material';
import {
  CheckCircle,
  ShoppingBag,
  Home
} from '@mui/icons-material';

function ConfirmacionPago() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderData } = location.state || {};

  useEffect(() => {
    // Si no hay datos de la orden, redirigir
    if (!orderData) {
      navigate('/productos');
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircle 
          sx={{ 
            fontSize: 80, 
            color: 'success.main', 
            mb: 2 
          }} 
        />
        
        <Typography variant="h4" gutterBottom color="success.main">
          ¡Pago Exitoso!
        </Typography>
        
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            fontSize: '1.1rem',
            '& .MuiAlert-message': {
              textAlign: 'center',
              width: '100%'
            }
          }}
        >
          Tu compra ha sido procesada correctamente. 
          ¡Gracias por tu preferencia!
        </Alert>

        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            📋 Resumen de tu Compra
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>ID de Orden:</strong> #{orderData.orderId}
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              <strong>Fecha:</strong> {orderData.fecha}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Productos Comprados:
            </Typography>
            
            <List>
              {orderData.items.map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">
                          {item.nombre}
                        </Typography>
                        <Chip 
                          label={`${item.cantidad}x $${item.precio.toLocaleString()}`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                    }
                    secondary={`Código: ${item.codigo} | Marca: ${item.marca}`}
                  />
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Total Pagado:
              </Typography>
              <Typography variant="h5" color="primary">
                ${orderData.total.toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/productos')}
            size="large"
          >
            Seguir Comprando
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ShoppingBag />}
            onClick={() => navigate('/carrito')}
            size="large"
          >
            Ver Carrito
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ConfirmacionPago; 