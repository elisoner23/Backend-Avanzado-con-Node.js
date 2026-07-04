import 'dotenv/config';
import express from 'express';
import alumnosRoutes from './src/routes/alumno.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

// Rutas para alumnos
app.use('/api/alumnos', alumnosRoutes);

// Rutas de autenticacion
app.use('/api/auth', authRoutes);

// Captura cualquier solicitud que no coincida con las rutas definidas
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});