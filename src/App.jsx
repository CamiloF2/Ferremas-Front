import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// React-Toastify imports
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { CartProvider } from './context/CartContext';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './Login';
import Productos from './Productos';
import AdminProductos from './AdminProductos';
import DetalleProducto from './DetalleProducto';
import Carrito from './Carrito';
import ConfirmacionPago from './ConfirmacionPago';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      lighter: '#e3f2fd',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CartProvider>
        <Router>
          <Routes>
            {/* Ruta pública */}
            <Route path="/" element={<Login />} />
            
            {/* Rutas protegidas con Layout */}
            <Route path="/productos" element={
              <PrivateRoute>
                <Layout>
                  <Productos />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/producto/:id" element={
              <PrivateRoute>
                <Layout>
                  <DetalleProducto />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/carrito" element={
              <PrivateRoute>
                <Layout>
                  <Carrito />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/admin" element={
              <PrivateRoute requiredRole="admin">
                <Layout>
                  <AdminProductos />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/confirmacion-pago" element={
              <PrivateRoute>
                <Layout>
                  <ConfirmacionPago />
                </Layout>
              </PrivateRoute>
            } />
          </Routes>
          
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
