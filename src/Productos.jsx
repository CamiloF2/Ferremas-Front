import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  AttachMoney,
  Inventory,
  Category,
  Refresh
} from '@mui/icons-material';
import { toast } from 'react-toastify';

function Productos() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarProductos = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/productos/');
      const data = await response.json();
      
      console.log("Respuesta del backend:", data);

      if (Array.isArray(data)) {
        setProductos(data);
        const categoriasUnicas = [...new Set(data.map(p => p.tipo_producto))];
        setCategorias(categoriasUnicas);
        toast.success(`🛍️ ${data.length} productos disponibles`);
      } else {
        console.error("La respuesta del backend no es un array:", data);
        setProductos([]);
        setError('Error: Los datos recibidos no tienen el formato esperado');
        toast.error('Formato de datos incorrecto');
      }
    } catch (error) {
      console.error("Error al obtener productos:", error);
      setError('Error de conexión con el servidor');
      setProductos([]);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const productosFiltrados = categoriaSeleccionada
    ? productos.filter(p => p.tipo_producto === categoriaSeleccionada)
    : productos;

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'herramientas manuales': return 'primary';
      case 'materiales basicos': return 'secondary';
      case 'equipos de seguridad': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Catálogo de Productos
        </Typography>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="categoria-select-label">Filtrar por categoría</InputLabel>
          <Select
            labelId="categoria-select-label"
            value={categoriaSeleccionada}
            label="Filtrar por categoría"
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          >
            <MenuItem value="">
              <em>Todas las categorías</em>
            </MenuItem>
            {categorias.map((cat, index) => (
              <MenuItem key={index} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" sx={{ my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {!loading && productosFiltrados.length === 0 && !error && (
        <Alert severity="info">
          No se encontraron productos en esta categoría.
        </Alert>
      )}

      <Grid container spacing={3}>
        {productosFiltrados.map((producto) => (
          <Grid item xs={12} sm={6} md={4} key={producto.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => navigate(`/producto/${producto.id}`)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {producto.nombre}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {producto.descripcion}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Chip 
                    icon={<Category />}
                    label={producto.tipo_producto}
                    color={getTipoColor(producto.tipo_producto)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoney color="primary" />
                  <Typography variant="h6" color="primary">
                    ${producto.precio?.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Inventory color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Stock: {producto.stock} unidades
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Marca: {producto.marca}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Código: {producto.codigo}
                </Typography>

                <Typography 
                  variant="caption" 
                  color="primary" 
                  sx={{ 
                    mt: 2, 
                    display: 'block',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  Click para ver detalles →
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Productos;
