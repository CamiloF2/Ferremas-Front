import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ArrowBack,
  Science,
  PlayArrow,
  Code,
  CheckCircle,
  Error as ErrorIcon,
  ExpandMore,
  Logout,
  Storage,
  Search,
  Update,
  ListAlt,
  Business,
  AccountBalance,
  Description
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { soapService } from './services/api';

function SOAPDemo() {
  const navigate = useNavigate();
  
  // Estados para cada test
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});
  const [parameters, setParameters] = useState({
    consultar_producto: '',
    consultar_orden: '',
    actualizar_stock_id: '',
    actualizar_stock_cantidad: ''
  });

  const handleVolver = () => {
    navigate('/productos');
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    toast.success('Sesión cerrada correctamente');
    navigate('/');
  };

  const executeTest = async (testKey, action, parameter = '') => {
    setLoading(prev => ({ ...prev, [testKey]: true }));
    
    try {
      const result = await soapService.testSoapEndpoint(action, parameter);
      
      setResults(prev => ({
        ...prev,
        [testKey]: {
          ...result,
          timestamp: new Date().toLocaleString('es-ES')
        }
      }));
      
      if (result.success) {
        toast.success(`✅ ${testKey} ejecutado exitosamente`);
      } else {
        toast.error(`❌ Error en ${testKey}`);
      }
      
    } catch (error) {
      console.error('Error ejecutando test:', error);
      setResults(prev => ({
        ...prev,
        [testKey]: {
          success: false,
          error: error.message || 'Error desconocido',
          request_xml: '',
          response_xml: '',
          status_code: 500,
          timestamp: new Date().toLocaleString('es-ES')
        }
      }));
      toast.error(`❌ Error en ${testKey}: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [testKey]: false }));
    }
  };

  const formatXML = (xml) => {
    if (!xml) return 'No disponible';
    
    // Formateo básico de XML para mejor legibilidad
    return xml
      .replace(/></g, '>\n<')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  };

  const renderResult = (testKey) => {
    const result = results[testKey];
    
    if (!result) return null;

    return (
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {result.success ? (
              <CheckCircle sx={{ color: 'success.main' }} />
            ) : (
              <ErrorIcon sx={{ color: 'error.main' }} />
            )}
            <Typography variant="h6">
              Resultado - {result.timestamp}
            </Typography>
            <Chip 
              label={result.success ? 'ÉXITO' : 'ERROR'} 
              color={result.success ? 'success' : 'error'}
              size="small"
            />
            <Chip 
              label={`Status: ${result.status_code}`} 
              variant="outlined"
              size="small"
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                📤 Request XML
              </Typography>
              <Paper 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'grey.100',
                  maxHeight: 300,
                  overflow: 'auto'
                }}
              >
                <Typography 
                  variant="body2" 
                  component="pre"
                  sx={{ 
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {formatXML(result.request_xml)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                📥 Response XML
              </Typography>
              <Paper 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'grey.100',
                  maxHeight: 300,
                  overflow: 'auto'
                }}
              >
                <Typography 
                  variant="body2" 
                  component="pre"
                  sx={{ 
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {formatXML(result.response_xml)}
                </Typography>
              </Paper>
            </Grid>
            {result.error && (
              <Grid item xs={12}>
                <Alert severity="error">
                  <strong>Error:</strong> {result.error}
                </Alert>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  const tests = [
    {
      key: 'consultar_producto',
      title: 'Consultar Producto',
      description: 'Consulta los detalles de un producto específico por ID',
      icon: <Search sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      needsParameter: true,
      parameterLabel: 'ID del Producto',
      parameterKey: 'consultar_producto',
      action: 'consultar_producto',
      execute: () => executeTest(
        'consultar_producto', 
        'consultar_producto', 
        parameters.consultar_producto
      )
    },
    {
      key: 'listar_productos',
      title: 'Listar Productos',
      description: 'Obtiene la lista completa de productos disponibles',
      icon: <ListAlt sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      needsParameter: false,
      action: 'listar_productos',
      execute: () => executeTest('listar_productos', 'listar_productos')
    },
    {
      key: 'consultar_orden',
      title: 'Consultar Orden',
      description: 'Consulta el estado y detalles de una orden específica',
      icon: <Description sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      needsParameter: true,
      parameterLabel: 'ID de la Orden',
      parameterKey: 'consultar_orden',
      action: 'consultar_orden',
      execute: () => executeTest(
        'consultar_orden', 
        'consultar_orden', 
        parameters.consultar_orden
      )
    },
    {
      key: 'actualizar_stock',
      title: 'Actualizar Stock',
      description: 'Actualiza el stock de un producto específico',
      icon: <Update sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      needsParameter: true,
      isComplex: true,
      action: 'actualizar_stock',
      execute: () => {
        const parameter = `${parameters.actualizar_stock_id},${parameters.actualizar_stock_cantidad}`;
        executeTest('actualizar_stock', 'actualizar_stock', parameter);
      }
    }
  ];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleVolver}>
            <ArrowBack />
          </IconButton>
          <Science sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Ferremas - Demo Integración SOAP
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            🧪 Demostración SOAP
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Prueba las integraciones SOAP con sistemas externos
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Este demo muestra cómo Ferremas se integra con sistemas externos mediante protocolos SOAP
          </Alert>
        </Box>

        {/* Tests Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {tests.map((test) => (
            <Grid item xs={12} md={6} key={test.key}>
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: test.color, mr: 2 }}>
                      {test.icon}
                    </Box>
                    <Box>
                      <Typography variant="h5" component="h2">
                        {test.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {test.description}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Parameters */}
                  {test.needsParameter && (
                    <Box sx={{ mb: 2 }}>
                      {test.isComplex ? (
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="ID del Producto"
                              value={parameters.actualizar_stock_id}
                              onChange={(e) => setParameters(prev => ({
                                ...prev,
                                actualizar_stock_id: e.target.value
                              }))}
                              placeholder="ej: 1"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nuevo Stock"
                              value={parameters.actualizar_stock_cantidad}
                              onChange={(e) => setParameters(prev => ({
                                ...prev,
                                actualizar_stock_cantidad: e.target.value
                              }))}
                              placeholder="ej: 100"
                              type="number"
                            />
                          </Grid>
                        </Grid>
                      ) : (
                        <TextField
                          fullWidth
                          size="small"
                          label={test.parameterLabel}
                          value={parameters[test.parameterKey]}
                          onChange={(e) => setParameters(prev => ({
                            ...prev,
                            [test.parameterKey]: e.target.value
                          }))}
                          placeholder={test.parameterKey === 'consultar_producto' ? 'ej: 1' : 'ej: 123'}
                        />
                      )}
                    </Box>
                  )}

                  {/* Execute Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={test.execute}
                    disabled={loading[test.key]}
                    startIcon={
                      loading[test.key] ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <PlayArrow />
                      )
                    }
                    sx={{ 
                      backgroundColor: test.color,
                      '&:hover': {
                        backgroundColor: test.color,
                        filter: 'brightness(0.9)'
                      }
                    }}
                  >
                    {loading[test.key] ? 'Ejecutando...' : 'Ejecutar Test'}
                  </Button>
                </CardContent>

                {/* Results */}
                {renderResult(test.key)}
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Información Educativa */}
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            💡 ¿Por qué SOAP en Ferremas?
          </Typography>
          <Typography variant="body1" paragraph>
            SOAP (Simple Object Access Protocol) es esencial para integraciones empresariales robustas. 
            En Ferremas lo utilizamos para conectar con sistemas críticos:
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <AccountBalance sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Servicios Gubernamentales
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText primary="SII (Facturación electrónica)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText primary="Registro Civil" />
                  </ListItem>
                </List>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Business sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Proveedores & Partners
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText primary="Catálogos de productos" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText primary="Actualización de precios" />
                  </ListItem>
                </List>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Storage sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Sistemas ERP
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText primary="Sincronización de inventario" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText primary="Órdenes de compra" />
                  </ListItem>
                </List>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Alert severity="success">
            <Typography variant="body2">
              <strong>🔒 Ventajas de SOAP:</strong> Protocolo robusto, seguro y estandarizado. 
              Ideal para transacciones críticas que requieren confirmación de entrega y manejo de errores avanzado.
            </Typography>
          </Alert>
        </Paper>
      </Container>
    </>
  );
}

export default SOAPDemo; 