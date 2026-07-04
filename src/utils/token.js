import jwt from 'jsonwebtoken';
 
const EXPIRES_IN = '1h';
 
export const generarToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: EXPIRES_IN });
};
 
export const verificarToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};