import bcrypt from 'bcryptjs';

export const hashPassword = (plainText) => {
  return bcrypt.hash(plainText, 12);
};

export const comparePassword = (plainText, hashedPassword) => {
  return bcrypt.compare(plainText, hashedPassword);
};
