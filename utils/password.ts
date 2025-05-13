//method to hash password using bcrypt
import bcrypt from "bcryptjs";
export const hashPassword = (password: string) => {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
};
export const comparePassword = (password: string, hash: string) => {
    return bcrypt.compareSync(password, hash);
};