import { prisma } from '../config/prisma.js';

// findAll - Devuelve todos los alumnos, con opción de filtrar por grado
export const findAll = ({ grado } = {}) => {
  return prisma.alumno.findMany({
    where: grado ? { grado } : undefined,
  });
};

// findById - Devuelve un alumno por su ID
export const findById = (id) => {
  return prisma.alumno.findUnique({
    where: { id },
  });
};

// findByNombreCompleto - Devuelve un alumno por su nombre completo
export const findByNombreCompleto = (nombre, apellido) => {
  return prisma.alumno.findFirst({
    where: { nombre, apellido },
  });
};

// save - Agrega un nuevo alumno a la base de datos
export const save = ({ nombre, apellido, grado, seccion }) => {
  return prisma.alumno.create({
    data: { nombre, apellido, grado, seccion },
  });
};

// update - Actualiza un alumno existente
export const updateById = (id, campos) => {
  return prisma.alumno.update({
    where: { id },
    data: campos,
  });
};

// delete - Elimina un alumno por su ID
export const deleteById = (id) => {
  return prisma.alumno.delete({
    where: { id },
  });
};
