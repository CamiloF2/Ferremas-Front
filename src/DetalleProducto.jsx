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
  Paper
} from '@mui/material';
import {
  ArrowBack,
  AttachMoney,
  Inventory,
  Category,
  Business,
  Code,
  Description,
  ShoppingCart,
  Logout
} from '@mui/icons-material';
import { toast } from 'react-toastify';

function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarProducto();
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
    // Funcionalidad del carrito para el futuro
    toast.success(`🛒 "${producto.nombre}" agregado al carrito`);
  };

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'herramientas manuales': return 'primary';
      case 'materiales basicos': return 'secondary';
      case 'equipos de seguridad': return 'error';
      default: return 'default';
    }
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
          {/* Imagen del producto (placeholder por ahora) */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3}
              sx={{ 
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'grey.100',
                borderRadius: 2
              }}
            >
              <Typography variant="h3" color="text.secondary">
                📦
              </Typography>
            </Paper>
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
                ${producto.precio?.toLocaleString()}
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

              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAgregarCarrito}
                disabled={producto.stock === 0}
                sx={{ mb: 3, py: 1.5 }}
                fullWidth
              >
                {producto.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
              </Button>

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
