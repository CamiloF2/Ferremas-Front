import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  AppBar,
  Toolbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Grid,
  InputAdornment
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Logout,
  AttachMoney,
  Inventory,
  Code,
  Business
} from '@mui/icons-material';
import { toast } from 'react-toastify';

function AdminProductos() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoProducto, setTipoProducto] = useState('herramientas manuales');
  const [marca, setMarca] = useState('');
  const [codigo, setCodigo] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [idProductoEditando, setIdProductoEditando] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Cargar productos
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/productos/');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setProductos(data);
        toast.success(`📦 ${data.length} productos cargados`);
      } else {
        setProductos([]);
        toast.error('No se pudieron cargar los productos');
      }
    } catch (error) {
      setProductos([]);
      toast.error('Error al cargar productos');
    }
  };

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setTipoProducto('herramientas manuales');
    setMarca('');
    setCodigo('');
    setPrecio('');
    setStock('');
    setModoEditar(false);
    setIdProductoEditando(null);
    setMensaje('');
    setError(false);
    setImagen(null);
    setPreviewUrl('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      // Crear preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('tipo_producto', tipoProducto);
    formData.append('marca', marca);
    formData.append('codigo', codigo);
    formData.append('precio', parseFloat(precio));
    formData.append('stock', parseInt(stock));
    
    // Agregar imagen si hay una
    if (imagen) {
      formData.append('imagen', imagen);
    }

    const url = modoEditar
      ? `http://localhost:8000/api/productos/${idProductoEditando}/`
      : 'http://localhost:8000/api/productos/';

    const metodo = modoEditar ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: metodo,
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        if (modoEditar) {
          const nuevosProductos = productos.map(p =>
            p.id === idProductoEditando ? data : p
          );
          setProductos(nuevosProductos);
          toast.success('✅ Producto actualizado exitosamente');
        } else {
          setProductos([...productos, data]);
          toast.success('🎉 Producto creado exitosamente');
        }
        limpiarFormulario();
      } else {
        toast.error(data.error || 'Error al guardar el producto');
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor');
    }
  };

  const handleEditar = (producto) => {
    setModoEditar(true);
    setIdProductoEditando(producto.id);
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion);
    setTipoProducto(producto.tipo_producto);
    setMarca(producto.marca);
    setCodigo(producto.codigo);
    setPrecio(producto.precio.toString());
    setStock(producto.stock.toString());
    setMensaje('');
    setError(false);
  };

  const handleEliminar = async () => {
    if (!productoAEliminar) return;

    try {
      const response = await fetch(`http://localhost:8000/api/productos/${productoAEliminar.id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProductos(productos.filter(p => p.id !== productoAEliminar.id));
        toast.success('🗑️ Producto eliminado correctamente');
      } else {
        toast.error('Error al eliminar el producto');
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor');
    }

    setDialogOpen(false);
    setProductoAEliminar(null);
  };

  const confirmarEliminacion = (producto) => {
    setProductoAEliminar(producto);
    setDialogOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'herramientas manuales': return 'primary';
      case 'materiales basicos': return 'secondary';
      case 'equipos de seguridad': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Ferremas - Panel de Administración
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Administración de Productos
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {modoEditar ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre del Producto"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Marca"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Producto</InputLabel>
                  <Select
                    value={tipoProducto}
                    label="Tipo de Producto"
                    onChange={(e) => setTipoProducto(e.target.value)}
                  >
                    <MenuItem value="Herramientas Manuales">Herramientas Manuales</MenuItem>
                    <MenuItem value="Materiales Básicos">Materiales Básicos</MenuItem>
                    <MenuItem value="Equipos de Seguridad">Equipos de Seguridad</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Código"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Code />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Precio"
                  type="number"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Inventory />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ height: 56 }}
                >
                  Subir Imagen
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>
              </Grid>

              {previewUrl && (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" gutterBottom>
                      Vista previa:
                    </Typography>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        objectFit: 'cover',
                        borderRadius: 8
                      }}
                    />
                  </Box>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    startIcon={modoEditar ? <Edit /> : <Add />}
                  >
                    {modoEditar ? 'Actualizar Producto' : 'Crear Producto'}
                  </Button>
                  {modoEditar && (
                    <Button 
                      variant="outlined" 
                      onClick={limpiarFormulario}
                    >
                      Cancelar
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {mensaje && (
            <Alert 
              severity={error ? "error" : "success"}
              sx={{ mt: 2 }}
            >
              {mensaje}
            </Alert>
          )}
        </Paper>

        <Paper elevation={3}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Lista de Productos
          </Typography>
          
          {productos.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Alert severity="info">
                No hay productos para mostrar.
              </Alert>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Code sx={{ mr: 1, fontSize: 18 }} />
                        Código
                      </Box>
                    </TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Marca</TableCell>
                    <TableCell>Precio</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productos.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell>{producto.id}</TableCell>
                      <TableCell>{producto.nombre}</TableCell>
                      <TableCell>{producto.descripcion}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Code sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {producto.codigo}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={producto.tipo_producto}
                          color={getTipoColor(producto.tipo_producto)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{producto.marca}</TableCell>
                      <TableCell>${producto.precio?.toLocaleString()}</TableCell>
                      <TableCell>{producto.stock}</TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEditar(producto)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => confirmarEliminacion(producto)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* Dialog de confirmación para eliminar */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el producto "{productoAEliminar?.nombre}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleEliminar} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AdminProductos;
