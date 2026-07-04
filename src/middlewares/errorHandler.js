import { AppError } from '../errors/appError.js';
import { Prisma } from '@prisma/client';

export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url} => ${err.message} `);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    if (err.code === 'P2002') {
      return res.status(400).json({
        error: 'El valor ya existe y debe ser unico',
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Registro no encontrado',
      });
    }
  }

  res.status(500).json({
    error: 'Error interno del servidor',
  });
};
