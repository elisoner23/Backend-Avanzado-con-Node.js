import * as AuthService from '../services/auth.service.js';

export const registrar = async (req, res) => {
  const usuario = await AuthService.registrar({
    nombre: req.body?.nombre,
    email: req.body?.email,
    password: req.body?.password,
  });
  res.status(201).json(usuario);
};

export const login = async (req, res) => {
  const usuario = await AuthService.iniciarSesion({
    email: req.body?.email,
    password: req.body?.password,
  });
  res.json(usuario);
};

export const cambiarPassword = async (req, res) => {
  await AuthService.cambiarPassword(Number(req.params.id), {
    passwordActual: req.body?.passwordActual,
    passwordNueva: req.body?.passwordNueva,
  });
  res.status(204).send();
};

export const perfil = async (req, res) => {
  const usuario = await AuthService.obtenerPerfil(req.usuario.id);
  res.json(usuario);
};

export const listarUsuarios = async (req, res) => {
  const usuarios = await AuthService.listarUsuarios();
  res.json(usuarios);
}