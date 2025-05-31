import React, { useEffect, useState } from 'react';

function AdminProductos() {
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
  const [modoEditar, setModoEditar] = useState(false);
  const [idProductoEditando, setIdProductoEditando] = useState(null);

  // Cargar productos
  useEffect(() => {
    fetch('http://localhost:8000/api/productos/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProductos(data);
        } else {
          setProductos([]);
        }
      })
      .catch(() => setProductos([]));
  }, []);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productoData = {
      nombre,
      descripcion,
      tipo_producto: tipoProducto,
      marca,
      codigo,
      precio: parseFloat(precio),
      stock: parseInt(stock)
    };

    const url = modoEditar
      ? `http://localhost:8000/api/productos/${idProductoEditando}/`
      : 'http://localhost:8000/api/productos/';

    const metodo = modoEditar ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productoData)
      });

      const data = await response.json();

      if (response.ok) {
        if (modoEditar) {
          // Reemplazar producto actualizado
          const nuevosProductos = productos.map(p =>
            p.id === idProductoEditando ? data : p
          );
          setProductos(nuevosProductos);
          setMensaje('Producto actualizado');
        } else {
          // Agregar nuevo producto
          setProductos([...productos, data]);
          setMensaje('Producto creado');
        }
        limpiarFormulario();
      } else {
        setMensaje(data.error || 'Error al guardar');
      }
    } catch (error) {
      setMensaje('Error de conexión');
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
    setPrecio(producto.precio);
    setStock(producto.stock);
  };

  const handleEliminar = async (id) => {
  const confirmar = window.confirm('¿Estás seguro de que deseas eliminar este producto?');
  if (!confirmar) return;

  try {
    const response = await fetch(`http://localhost:8000/api/productos/${id}/`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setProductos(productos.filter(p => p.id !== id));
      setMensaje('Producto eliminado correctamente');
    } else {
      setMensaje('Error al eliminar el producto');
    }
  } catch (error) {
    setMensaje('Error de conexión con el servidor');
  }
};


  return (
    <div>
      <h2>Administración de Productos</h2>

      <h3>{modoEditar ? 'Editar Producto' : 'Crear Nuevo Producto'}</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
        <input type="text" placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
        <select value={tipoProducto} onChange={e => setTipoProducto(e.target.value)} required>
          <option value="herramientas manuales">Herramientas Manuales</option>
          <option value="materiales basicos">Materiales Básicos</option>
          <option value="equipos de seguridad">Equipos de Seguridad</option>
        </select>
        <input type="text" placeholder="Marca" value={marca} onChange={e => setMarca(e.target.value)} required />
        <input type="text" placeholder="Código" value={codigo} onChange={e => setCodigo(e.target.value)} required />
        <input type="number" placeholder="Precio" value={precio} onChange={e => setPrecio(e.target.value)} required />
        <input type="number" placeholder="Stock" value={stock} onChange={e => setStock(e.target.value)} required />
        <button type="submit">{modoEditar ? 'Actualizar' : 'Crear Producto'}</button>
        {modoEditar && <button type="button" onClick={limpiarFormulario}>Cancelar</button>}
      </form>

      {mensaje && <p>{mensaje}</p>}
      <hr />

      {productos.length === 0 ? (
        <p>No hay productos para mostrar.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
            <tr key={producto.id}>
            <td>{producto.id}</td>
            <td>{producto.nombre}</td>
            <td>{producto.tipo_producto}</td>
            <td>${producto.precio}</td>
            <td>{producto.stock}</td>
            <td>
                <button onClick={() => handleEditar(producto)}>Editar</button>
                <button onClick={() => handleEliminar(producto.id)}>Eliminar</button>
            </td>
            </tr>

            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminProductos;
