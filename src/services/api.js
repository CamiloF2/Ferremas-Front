/* eslint-disable import/no-anonymous-default-export */
import axios from 'axios';

// Configuración base de axios
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token si existe
api.interceptors.request.use(
  (config) => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (usuario.token) {
      config.headers.Authorization = `Bearer ${usuario.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Servicios de pago con Transbank
export const pagoService = {
  // Crear orden de pago
  crearOrden: async (items, total) => {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      
      const emailGenerado = usuario.nombre 
        ? `${usuario.nombre.toLowerCase().replace(/\s+/g, '')}@ferremas.com`
        : 'cliente@ferremas.com';
      
      // ✅ Usar el formato que ya sabemos que funciona (Formato 1)
      const payload = {
        productos: items.map(item => ({
          producto_id: item.id,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio_unitario: parseFloat(item.precio)
        })),
        total: parseFloat(total),
        nombre_comprador: usuario.nombre || 'Cliente Ferremas',
        email_comprador: emailGenerado
      };
      
      console.log('📤 Payload final:', JSON.stringify(payload, null, 2));
      
      const response = await api.post('/pagos/crear-orden/', payload);
      
      console.log('✅ Respuesta exitosa:', response.data);
      return response.data;  // Devolver directamente la data
      
    } catch (error) {
      console.error('❌ Error crear orden:', error.response?.data);
      throw error.response?.data || { error: 'Error al crear la orden' };
    }
  },

  // Iniciar pago con Transbank
  iniciarPago: async (ordenId) => {
    try {
      console.log('📤 Iniciando pago para orden ID:', ordenId);
      const response = await api.post(`/pagos/iniciar-pago/${ordenId}/`);
      console.log('📥 Respuesta iniciar pago:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en iniciarPago:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error.response?.data || { error: 'Error al iniciar el pago' };
    }
  },

  // Obtener estado de orden
  obtenerEstadoOrden: async (ordenId) => {
    try {
      const response = await api.get(`/pagos/estado-orden/${ordenId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener estado de orden' };
    }
  },

  // Obtener mis órdenes
  obtenerMisOrdenes: async (email = null) => {
    try {
      const url = email ? `/pagos/mis-ordenes/?email=${email}` : '/pagos/mis-ordenes/';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo órdenes:', error);
      throw error.response?.data || error;
    }
  }
};

// También servicio para productos
export const productoService = {
  obtenerProductos: async () => {
    try {
      const response = await api.get('/productos/');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      throw error;
    }
  },

  obtenerProducto: async (id) => {
    try {
      const response = await api.get(`/productos/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      throw error;
    }
  }
};

export default api;