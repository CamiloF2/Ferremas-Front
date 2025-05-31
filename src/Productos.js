import React, { useEffect, useState } from 'react';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/productos/')
      .then((res) => res.json())
      .then((data) => {
        console.log("Respuesta del backend:", data); // 👈 revisa esto en la consola

        if (Array.isArray(data)) {
          setProductos(data);

          const categoriasUnicas = [...new Set(data.map(p => p.tipo_producto))];
          setCategorias(categoriasUnicas);
        } else {
          console.error("La respuesta del backend no es un array:", data);
          setProductos([]);
        }
      })
      .catch((error) => {
        console.error("Error al obtener productos:", error);
      });
  }, []);

  const productosFiltrados = categoriaSeleccionada
    ? productos.filter(p => p.tipo_producto === categoriaSeleccionada)
    : productos;

  return (
    <div>
      <h2>Listado de Productos</h2>

      <label>Filtrar por categoría: </label>
      <select
        onChange={(e) => setCategoriaSeleccionada(e.target.value)}
        value={categoriaSeleccionada}
      >
        <option value="">Todas</option>
        {categorias.map((cat, index) => (
          <option key={index} value={cat}>{cat}</option>
        ))}
      </select>

      <ul>
        {productosFiltrados.map((producto) => (
          <li key={producto.id}>
            <strong>{producto.nombre}</strong> - {producto.tipo_producto} - ${producto.precio}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Productos;
