import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Productos from './Productos';
import AdminProductos from './AdminProductos';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/admin" element={<AdminProductos />} />
      </Routes>
    </Router>
  );
}

export default App;
