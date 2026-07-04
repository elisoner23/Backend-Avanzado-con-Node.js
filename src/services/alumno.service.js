import { AppError } from '../errors/appError.js';
import * as AlumnoRepository from '../repositories/alumno.repository.js';

// getAll - Devuelve todos los alumnos, con opción de filtrar por grado
export const getAll = async ({ grado } = {}) => {
  return await AlumnoRepository.findAll({ grado });
};

// getById - Devuelve un alumno por su ID
export const getById = async (id) => {
  const alumno = await AlumnoRepository.findById(id);

  if (!alumno) throw new AppError('Alumno no encontrado', 404);

  return alumno;
};

// create - Agrega un nuevo alumno a la base de datos
export const create = async ({ nombre, apellido, grado, seccion }) => {
  if (!nombre || !apellido || !grado || !seccion) {
    throw new AppError(
      'Todos los campos son requeridos: nombre, apellido, grado y seccion',
      400,
    );
  }

  const existente = await AlumnoRepository.findByNombreCompleto(
    nombre,
    apellido,
  );

  if (existente) {
    throw new AppError(
      'Ya existe un alumno registrado con el mismo nombre y apellido',
      409,
    );
  }

  return await AlumnoRepository.save({ nombre, apellido, grado, seccion });
};

export const update = async (id, campos) => {
  const existe = await AlumnoRepository.findById(id);

  if (!existe) {
    throw new AppError('Alumno no encontrado', 404);
  }

  if (!campos) {
    throw new AppError('No se proporcionaron campos para actualizar', 400);
  }

  const camposPermitidos = ['nombre', 'apellido', 'grado', 'seccion'];

  const camposEnviados = Object.keys(campos).filter((campo) =>
    camposPermitidos.includes(campo),
  );

  if (camposEnviados.length === 0) {
    throw new AppError(
      'Debes enviar al menos un campo valido: nombre, apellido, grado o seccion',
      400,
    );
  }

  return await AlumnoRepository.updateById(id, campos);
};

export const remove = async (id) => {
  const existe = await AlumnoRepository.findById(id);

  if (!existe) {
    throw new AppError('Alumno no encontrado', 404);
  }

  await AlumnoRepository.deleteById(id);
};