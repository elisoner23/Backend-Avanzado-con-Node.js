import { AppError } from '../errors/appError.js';
 
export const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    // 1. Validar si req.usuario existe y extraer su rol limpiamente
    const rolUsuario = req.usuario?.rol;

    if (!rolUsuario || !rolesPermitidos.includes(rolUsuario)) {
      // Usamos next() para asegurar que Express capture el error correctamente
      return next(new AppError('No tienes permiso para realizar esta acción', 403));
    }
    
    next();
  };
};