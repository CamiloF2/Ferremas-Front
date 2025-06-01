import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Toast de loading
    const loadingToast = toast.loading("Iniciando sesión...");

    try {
      const response = await fetch('http://localhost:8000/api/usuarios/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo, contraseña })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        // Toast de éxito
        toast.update(loadingToast, {
          render: `¡Bienvenido, ${data.usuario.nombre}! 🎉`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        // Navegar después de un breve delay
        setTimeout(() => {
          if (data.usuario.tipo === 'admin') {
            navigate('/admin');
          } else {
            navigate('/productos');
          }
        }, 1000);

      } else {
        // Toast de error
        toast.update(loadingToast, {
          render: data.error || 'Error de autenticación',
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      // Toast de error de conexión
      toast.update(loadingToast, {
        render: 'Error de conexión con el servidor',
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper 
          elevation={6}
          sx={{ 
            padding: 4,
            width: '100%',
            maxWidth: 400
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            color="primary"
          >
            Ferremas
          </Typography>
          
          <Typography 
            variant="h6" 
            component="h2" 
            gutterBottom 
            align="center"
            color="textSecondary"
            sx={{ mb: 3 }}
          >
            Iniciar Sesión
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="email"
              label="Correo Electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? 'Iniciando...' : 'Ingresar'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
