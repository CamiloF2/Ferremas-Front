import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
  Divider,
  Badge,
  TextField
} from '@mui/material';
import {
  ArrowBack,
  Inventory,
  Category,
  Business,
  Code,
  Description,
  ShoppingCart,
  Logout,
  Remove,
  Add
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useCart } from './context/CartContext';

function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getItemCount, isInCart, getItemQuantity } = useCart();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    cargarProducto();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarProducto = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8000/api/productos/${id}/`);
      
      if (response.ok) {
        const data = await response.json();
        setProducto(data);
        toast.success('📦 Producto cargado');
      } else {
        setError('Producto no encontrado');
        toast.error('❌ Producto no encontrado');
      }
    } catch (error) {
      console.error("Error al obtener producto:", error);
      setError('Error de conexión con el servidor');
      toast.error('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate('/productos');
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    toast.success('Sesión cerrada correctamente');
    navigate('/');
  };

  const handleAgregarCarrito = () => {
    if (cantidad > producto.stock) {
      toast.error('No hay suficiente stock disponible');
      return;
    }
    
    addToCart(producto, cantidad);
    toast.success(`🛒 ${cantidad} x "${producto.nombre}" agregado al carrito`);
  };

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'herramientas manuales': return 'primary';
      case 'materiales basicos': return 'secondary';
      case 'equipos de seguridad': return 'error';
      default: return 'default';
    }
  };

  // Función helper para formatear precios
  const formatPrice = (price) => {
    return Math.round(parseFloat(price))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  if (loading) {
    return (
      <>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleVolver}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Ferremas - Detalle del Producto
            </Typography>
            <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
              Cerrar Sesión
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box display="flex" justifyContent="center" sx={{ my: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  if (error || !producto) {
    return (
      <>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleVolver}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Ferremas - Error
            </Typography>
            <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
              Cerrar Sesión
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={handleVolver} startIcon={<ArrowBack />}>
            Volver al Catálogo
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleVolver}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Ferremas - {producto.nombre}
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/carrito')}>
            <Badge badgeContent={getItemCount()} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
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
          Volver al Catálogo
        </Button>

        <Grid container spacing={4}>
          {/* Imagen del producto */}
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                borderRadius: 2,
                boxShadow: 3
              }}
              src={producto.imagen_url || '/media/productos/default.jpg'}
              alt={producto.nombre}
              onError={(e) => {
                e.target.src = '/media/productos/default.jpg';
              }}
            />
          </Grid>

          {/* Información del producto */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {producto.nombre}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Chip 
                  icon={<Category />}
                  label={producto.tipo_producto}
                  color={getTipoColor(producto.tipo_producto)}
                  size="medium"
                />
              </Box>

              <Typography variant="h3" color="primary" sx={{ mb: 3 }}>
                ${formatPrice(producto.precio)}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: producto.stock > 0 ? 'success.main' : 'error.main',
                    mb: 1 
                  }}
                >
                  <Inventory sx={{ mr: 1 }} />
                  {producto.stock > 0 ? 'En Stock' : 'Sin Stock'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {producto.stock} unidades disponibles
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Cantidad:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton 
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    disabled={cantidad <= 1}
                  >
                    <Remove />
                  </IconButton>
                  
                  <TextField
                    size="small"
                    value={cantidad}
                    onChange={(e) => {
                      const value = Math.max(1, Math.min(producto.stock, parseInt(e.target.value) || 1));
                      setCantidad(value);
                    }}
                    inputProps={{ 
                      min: 1, 
                      max: producto.stock,
                      style: { textAlign: 'center', width: '80px' }
                    }}
                    type="number"
                  />
                  
                  <IconButton 
                    onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                    disabled={cantidad >= producto.stock}
                  >
                    <Add />
                  </IconButton>
                </Box>
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAgregarCarrito}
                disabled={producto.stock === 0}
                sx={{ mb: 3, py: 1.5 }}
                fullWidth
              >
                {producto.stock > 0 
                  ? `Agregar ${cantidad} al Carrito` 
                  : 'Sin Stock'
                }
              </Button>

              {isInCart(producto.id) && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Ya tienes {getItemQuantity(producto.id)} de este producto en tu carrito
                </Alert>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Información del Producto
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Business sx={{ mr: 1, color: 'text.secondary' }} />
                    <strong>Marca:</strong>&nbsp;{producto.marca}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Code sx={{ mr: 1, color: 'text.secondary' }} />
                    <strong>Código:</strong>&nbsp;
                    <span style={{ fontFamily: 'monospace' }}>{producto.codigo}</span>
                  </Typography>
                </Box>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Descripción
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {producto.descripcion}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Información adicional */}
        <Card sx={{ mt: 4 }} elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Detalles Técnicos
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  ID del Producto
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  #{producto.id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Categoría
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {producto.tipo_producto}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Marca
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {producto.marca}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Código
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {producto.codigo}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

export default DetalleProducto;
