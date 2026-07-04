import { AppError } from '../errors/appError.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generarToken } from '../utils/token.js';
import * as UsuarioRepository from '../repositories/usuario.repository.js';
 
export const registrar = async ({ nombre, email, password }) => {
  if (!nombre || !email || !password) {
    throw new AppError(
      'Todos los campos son requeridos: nombre, email, password',
      400,
    );
  }
 
  if (password.length < 8) {
    throw new AppError('La contraseña debe tener al menos 8 caracteres', 400);
  }
 
  if (password.length > 72) {
    throw new AppError('La contraseña no puede exceder 72 caracteres', 400);
  }
 
  const existente = await UsuarioRepository.findByEmail(email);
 
  if (existente) {
    throw new AppError('Ya existe una cuenta registrada con ese email', 409);
  }
 
  const passwordHash = await hashPassword(password);
 
  const nuevo = await UsuarioRepository.save({ nombre, email, passwordHash });
 
  return { id: nuevo.id, nombre: nuevo.nombre, email: nuevo.email };
};
 
export const iniciarSesion = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Email y contraseña son requeridos', 400);
  }
 
  const usuario = await UsuarioRepository.findByEmail(email);
 
  if (!usuario) {
    throw new AppError('Email o contraseña incorrectos', 401);
  }
 
  const coincide = await comparePassword(password, usuario.passwordHash);
 
  if (!coincide) {
    throw new AppError('Email o contraseña incorrectos', 401);
  }
 
  const token = generarToken({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  });
 
  return {
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
    },
    token,
  };
};
 
export const cambiarPassword = async (
  id,
  { passwordActual, passwordNueva },
) => {
  if (!passwordActual || !passwordNueva) {
    throw new AppError(
      'Se requieren la contraseña actual y la nueva contraseña',
      400,
    );
  }
 
  const usuario = await UsuarioRepository.findById(id);
 
  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }
 
  const coincide = await comparePassword(passwordActual, usuario.passwordHash);
  if (!coincide) {
    throw new AppError('La contraseña actual es incorrecta', 401);
  }
 
  if (passwordNueva.length < 8 || passwordNueva.length > 72) {
    throw new AppError(
      'La nueva contraseña debe tener entre 8 y 72 caracteres',
      400,
    );
  }
 
  const nuevoHash = await hashPassword(passwordNueva);
  await UsuarioRepository.updatePasswordHash(id, nuevoHash);
};

export const obtenerPerfil = async (id) => {
  const usuario = await UsuarioRepository.findById(id);
 
  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }
 
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  };
};

export const listarUsuarios = async () => {
  const usuarios = await UsuarioRepository.findAll();
}