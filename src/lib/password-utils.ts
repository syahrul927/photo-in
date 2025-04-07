import bcrypt from "bcryptjs";

export const hashPassword = (plainPassword: string) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plainPassword, salt);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compareSync(password, hash);
};
