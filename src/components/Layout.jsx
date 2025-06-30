import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Badge
} from '@mui/material';
import { Logout, Science } from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemCount } = useCart();
  
  // Obtener información del usuario
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  
  if (!usuario) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('ferremas_cart');
    toast.success('👋 Sesión cerrada correctamente');
    navigate('/');
  };

  const navegarA = (ruta) => {
    navigate(ruta);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          {/* Logo */}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              mr: 4,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={() => navegarA('/productos')}
          >
            🔧 Ferremas
          </Typography>

          {/* Enlaces de navegación */}
          <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
            <Button
              color="inherit"
              onClick={() => navegarA('/productos')}
              sx={{
                fontWeight: isActive('/productos') ? 'bold' : 'normal',
                backgroundColor: isActive('/productos') ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
              }}
            >
              Productos
            </Button>

            <Button
              color="inherit"
              onClick={() => navegarA('/carrito')}
              sx={{
                fontWeight: isActive('/carrito') ? 'bold' : 'normal',
                backgroundColor: isActive('/carrito') ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
              }}
            >
              Carrito
              {getItemCount() > 0 && (
                <Badge 
                  badgeContent={getItemCount()} 
                  color="error" 
                  sx={{ ml: 1 }}
                />
              )}
            </Button>

            <Button
              color="inherit"
              onClick={() => navegarA('/soap-demo')}
              startIcon={<Science />}
              sx={{
                fontWeight: isActive('/soap-demo') ? 'bold' : 'normal',
                backgroundColor: isActive('/soap-demo') ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
              }}
            >
              SOAP Demo
            </Button>

            {usuario?.tipo === 'admin' && (
              <Button
                color="inherit"
                onClick={() => navegarA('/admin')}
                sx={{
                  fontWeight: isActive('/admin') ? 'bold' : 'normal',
                  backgroundColor: isActive('/admin') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}
              >
                Administración
              </Button>
            )}
          </Box>

          {/* Usuario y logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {usuario.nombre}
            </Typography>
            
            <Button 
              color="inherit" 
              onClick={handleLogout}
              startIcon={<Logout />}
              sx={{ 
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Contenido principal */}
      <Box component="main">
        {children}
      </Box>
    </>
  );
};

export default Layout; 